use std::borrow::Cow;
use std::io::SeekFrom;
use std::path::Path;
use std::process::ExitStatus;
use std::str::FromStr;
use std::sync::Arc;
use std::time::{Duration, Instant};

use image::{image_dimensions, ImageError};
use reqwest::header;
use serde::{Deserialize, Serialize, Serializer};
use serde_json::json;
use thiserror::Error;
use tokio::fs::File;
use tokio::io::AsyncSeekExt;
use tokio::process::Command;
use tokio::select;
use tokio::sync::watch::error::SendError;
use tokio::sync::{mpsc, watch};
use tokio::task::{spawn_blocking, JoinError};
use tokio::time::{sleep, timeout};
use tokio_util::io::ReaderStream;
use tokio_util::sync::CancellationToken;
use tokio_util::task::TaskTracker;
use tracing::{debug, error, info, info_span, warn, Instrument};
use ulid::Ulid;

use crate::auth::TokenClaim;
use crate::config::{Fit, FrameConfig, LimitsConfig};

pub type JobSender = mpsc::Sender<QueuedJobInfo>;
pub type JobReceiver = mpsc::Receiver<QueuedJobInfo>;
pub type StatusSender = watch::Sender<StatusUpdate>;
pub type StatusReceiver = watch::Receiver<StatusUpdate>;
pub type JobTracker = scc::HashMap<Ulid, StatusReceiver>;

#[derive(Debug)]
pub struct JobInfo {
    pub id: Ulid,
    pub frame: Arc<FrameConfig>,
    pub limits: Arc<LimitsConfig>,
    pub image_path: Arc<Path>,
    pub image_size: (u32, u32),
    pub audio_path: Arc<Path>,
    pub output_path: Arc<Path>,
    pub audio_length: f64,
    pub meta: Metadata,
    pub auth: TokenClaim,
}

pub struct QueuedJobInfo {
    info: JobInfo,
    tx: watch::Sender<StatusUpdate>,
}

#[derive(Deserialize, Debug)]
pub struct UploadResponseSuccess {
    pub id: String,
    //snippet: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Error, Deserialize, Debug)]
#[error("{}", &error.message)]
pub struct GoogleErrorResponse {
    pub error: GoogleErrorResponseInner,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GoogleErrorResponseInner {
    pub message: String,
    #[serde(flatten)]
    pub extra: serde_json::Value,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum UploadResponseResult {
    Ok(UploadResponseSuccess),
    Err(GoogleErrorResponse),
}

#[derive(Debug, Clone, Copy, Default)]
#[repr(u8)]
pub enum Privacy {
    Private,
    Unlisted,
    #[default]
    Public,
}

impl From<Privacy> for &'static str {
    fn from(value: Privacy) -> &'static str {
        match value {
            Privacy::Private => "private",
            Privacy::Unlisted => "unlisted",
            Privacy::Public => "public",
        }
    }
}

#[derive(Error, Debug)]
#[error("unrecognized privacy value")]
pub struct UnrecognizedPrivacy;

impl FromStr for Privacy {
    type Err = UnrecognizedPrivacy;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "private" => Ok(Self::Private),
            "unlisted" => Ok(Self::Unlisted),
            "public" => Ok(Self::Public),
            _ => Err(UnrecognizedPrivacy),
        }
    }
}

#[derive(Debug)]
pub struct Metadata {
    pub filename: String,
    pub title: Option<String>,
    pub description: String,
    pub privacy: Privacy,
    pub tags: Vec<String>,
    pub category: u32,
    pub made_for_kids: bool,
    pub notify_subs: bool,
}

pub const CATEGORY_IDS: &[u32] = &[
    1, 2, 10, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 41, 42, 43, 44,
];

impl From<UploadResponseResult> for Result<UploadResponseSuccess, GoogleErrorResponse> {
    fn from(value: UploadResponseResult) -> Self {
        match value {
            UploadResponseResult::Ok(v) => Self::Ok(v),
            UploadResponseResult::Err(e) => Self::Err(e),
        }
    }
}

#[derive(Error, Debug)]
pub enum YTUploadError {
    #[error("failed to contact google api: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("failed to parse response: {0}")]
    JsonError(#[from] serde_json::Error),
    #[error("failed to upload video: {0}")]
    UploadError(#[from] GoogleErrorResponse),
    #[error("internal server error: {0}")]
    Other(Cow<'static, str>),
}

#[derive(Error, Debug)]
pub enum FFmpegProcessError {
    #[error("video took too long to process (took {value:?}, max {max:?})")]
    TimeLimitExceeded { value: Duration, max: Duration },
    #[error("failed to spawn ffmpeg process: {0}")]
    SpawnError(std::io::Error),
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error(transparent)]
    ImageParseError(#[from] ImageError),
    #[error(transparent)]
    JoinError(#[from] JoinError),
    #[error("ffmpeg error: {0}")]
    FfmpegError(ExitStatus),
}

#[derive(Error, Debug)]
pub enum VideoProcessError {
    #[error("upload error: {0}")]
    YTUpload(#[from] YTUploadError),
    #[error("processing error: {0}")]
    FFmpegProcessError(#[from] FFmpegProcessError),
    #[error("channel closed")]
    ChannelClosed(#[from] SendError<StatusUpdate>),
    #[error(transparent)]
    IoError(#[from] std::io::Error),
}

#[derive(Serialize, Debug, Clone, Default)]
#[serde(rename_all = "snake_case", tag = "state")]
pub enum StatusUpdate {
    #[default]
    Queued,
    Processing,
    Uploading,
    #[serde(serialize_with = "done_value")]
    Done(Result<String, Arc<VideoProcessError>>),
}

fn done_value<S: Serializer>(
    value: &Result<String, Arc<VideoProcessError>>,
    serializer: S,
) -> Result<S::Ok, S::Error> {
    impl From<&VideoProcessError> for serde_json::Value {
        fn from(value: &VideoProcessError) -> Self {
            let message = value.to_string();

            let mut map = match value {
                VideoProcessError::YTUpload(YTUploadError::ReqwestError(_)) => json!({
                    "error": "reqwest",
                    "stage": "upload",
                }),
                VideoProcessError::YTUpload(YTUploadError::UploadError(v)) => json!({
                    "error": "api",
                    "stage": "upload",
                    "original": v.error
                }),
                VideoProcessError::YTUpload(YTUploadError::JsonError(_)) => json!({
                    "error": "parse",
                    "stage": "upload",
                }),
                VideoProcessError::YTUpload(YTUploadError::Other(_)) => json!({
                    "error": "other",
                    "stage": "upload",
                }),
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::TimeLimitExceeded {
                    value,
                    max,
                }) => {
                    json!({
                        "error": "timeout",
                        "stage": "video",
                        "value": value.as_millis_f64(),
                        "max": max.as_millis_f64()
                    })
                }
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::SpawnError(_)) => {
                    json!({
                        "error": "spawn",
                        "stage": "video",
                    })
                }
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::IoError(_)) => json!({
                    "error": "io",
                    "stage": "video",
                }),
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::ImageParseError(_)) => {
                    json!({
                        "error": "image_parse",
                        "stage": "video",
                    })
                }
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::JoinError(_)) => {
                    json!({
                        "error": "join",
                        "stage": "video",
                    })
                }
                VideoProcessError::FFmpegProcessError(FFmpegProcessError::FfmpegError(_)) => {
                    json!({
                        "error": "ffmpeg",
                        "stage": "video",
                    })
                }
                VideoProcessError::ChannelClosed(_) => json!({
                    "error": "channel",
                    "stage": "internal",
                }),
                VideoProcessError::IoError(_) => json!({
                    "error": "io",
                    "stage": "internal"
                }),
            };
            match &mut map {
                Self::Object(map) => map.insert("message".into(), Self::String(message)),
                _ => unreachable!("all variants result in a map"),
            };

            map
        }
    }

    let done = match value {
        Ok(id) => json!({
            "success": true,
            "video_id": id.clone(),
        }),
        Err(err) => {
            let err: &VideoProcessError = err;
            json!({
                "success": false,
                "error": serde_json::Value::from(err),
            })
        }
    };

    done.serialize(serializer)
}

pub async fn submit_job(
    info: JobInfo,
    permit: mpsc::Permit<'_, QueuedJobInfo>,
    job_tracker: &JobTracker,
) {
    let id = info.id;

    let (tx, rx) = watch::channel(Default::default());

    job_tracker.upsert_async(id, rx).await;
    permit.send(QueuedJobInfo { info, tx });
}

async fn run_ffmpeg(job: Arc<JobInfo>, output_path: Arc<Path>) -> Result<File, FFmpegProcessError> {
    let mut cmd = Command::new("ffmpeg");
    cmd.arg("-i")
        .arg(&*job.image_path)
        .arg("-i")
        .arg(&*job.audio_path);

    let (image_width, image_height) = match job.frame.fit {
        Fit::Resize => {
            let f = clamp_resize(
                job.frame.image_size.0,
                job.frame.image_size.1,
                job.image_size.0,
                job.image_size.1,
            );
            let scaled_w = job.image_size.0 as f64 * f;
            let scaled_h = job.image_size.1 as f64 * f;
            (scaled_w as u32, scaled_h as u32)
        }
        Fit::Stretch => job.frame.image_size,
    };

    let (image_x, image_y) = (
        (job.frame.frame_size.0 - image_width) / 2,
        (job.frame.frame_size.1 - image_height) / 2,
    );

    let (mut output_w, mut output_h) = (
        job.frame.frame_size.0 + job.frame.x,
        job.frame.frame_size.1 + job.frame.y,
    );

    let mut filter = String::new();

    if job.frame.enable {
        let mut has_watermark = false;
        if let Some(path) = job.frame.watermark.as_ref() {
            cmd.arg("-i").arg(path);
            let path = path.clone();
            let (w, h) = spawn_blocking(move || image_dimensions(path)).await??;
            output_w = output_w.max(w);
            output_h = output_h.max(h);
            has_watermark = true;
        }
        filter += &format!(
	        "color=color={}:size={output_w}x{output_h}[bg];[0]scale={image_width}x{image_height}:flags=lanczos[image];color=color={}:size={}x{}[frame_bg];[frame_bg][image]overlay={image_x}:{image_y}[frame];[bg][frame]overlay={}:{},loop=-1,setpts={}/TB[full];{}",
	        &job.frame.void_color,
	        &job.frame.frame_color,
	        job.frame.frame_size.0,
	        job.frame.frame_size.1,
	        job.frame.x,
	        job.frame.y,
	        job.audio_length,
	        if has_watermark {
	            "[full][2]overlay=0:0[output]"
	        } else {
	            "[full]null[output]"
	        }
	    );
    } else {
        filter += &format!("[0]loop=-1,setpts={}/TB[output]", job.audio_length);
    }

    debug!("filtergraph: {filter}");

    cmd.arg("-hide_banner")
        .arg("-filter_complex")
        .arg(filter)
        .arg("-c:v")
        .arg("libx264")
        .arg("-frames:v")
        .arg("1")
        .arg("-pix_fmt")
        .arg("yuv444p")
        .arg("-crf")
        .arg("0")
        .arg("-c:a")
        .arg("copy")
        .arg("-map")
        .arg("[output]:v")
        .arg("-map")
        .arg("1:a")
        .arg("-map_metadata")
        .arg("1")
        .arg("-f")
        .arg("matroska")
        .arg("-");

    let out = File::create_new(&output_path).await?;
    let cloned_fd = out.try_clone().await?;
    let mut child = cmd
        .stdout(out.into_std().await)
        .spawn()
        .map_err(FFmpegProcessError::SpawnError)?;
    let status = child.wait().await?;

    if status.success() {
        debug!("output: {}", output_path.display());
        Ok(cloned_fd)
    } else {
        Err(FFmpegProcessError::FfmpegError(status))
    }
}

async fn upload(
    file: File,
    size: u64,
    meta: &Metadata,
    auth: &TokenClaim,
) -> Result<String, YTUploadError> {
    let client = reqwest::ClientBuilder::new()
        .redirect(reqwest::redirect::Policy::none())
        .build()?;

    let bearer = format!("Bearer {}", auth.access_token);

    let privacy: &str = meta.privacy.into();

    let json = json!({
        "snippet": {
            "title": meta.title.as_deref(),
            "description": &meta.description,
            "tags": meta.tags.as_slice(),
            "categoryId": meta.category,
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": meta.made_for_kids,
        }
    });

    debug!("uploading with metadata: {meta:?}, body: {json}");

    let url = format!(
        "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,id,status&notifySubscribers={}",
        if meta.notify_subs { "True" } else { "False" } // thanks google
    );
    let res = client
        .post(url)
        .header(header::AUTHORIZATION, &bearer)
        .header("X-Upload-Content-Type", "video/x-matroska")
        .header("X-Upload-Content-Length", size)
        .header("Slug", &meta.filename)
        .json(&json)
        .send()
        .await?;

    let status = res.status();
    if !status.is_success() {
        let err: GoogleErrorResponse = res.json().await?;
        error!("error while uploading: {err}");
        debug!("{err:?}");
        return Err(err.into());
    }

    let location = res
        .headers()
        .get(header::LOCATION)
        .ok_or(YTUploadError::Other("expected location heaader".into()))?
        .to_str()
        .map_err(|e| YTUploadError::Other(e.to_string().into()))?;

    debug!("resumable upload uri: {location}");

    let res = client
        .post(location)
        .header(header::AUTHORIZATION, &bearer)
        .header(header::CONTENT_TYPE, "video/x-matroska")
        .header(header::CONTENT_LENGTH, size)
        .body(reqwest::Body::wrap_stream(ReaderStream::new(file)))
        .send()
        .await?;

    let parsed: UploadResponseResult = res.json().await?; // we can be opaque over parsing errors at this point
    debug!("upload response {parsed:?}");

    let data = match parsed {
        UploadResponseResult::Ok(v) => v,
        UploadResponseResult::Err(err) => return Err(err.into()),
    };

    debug!("uploaded: {data:?}");

    Ok(data.id)
}

async fn process_job(info: Arc<JobInfo>, tx: &StatusSender) -> Result<String, VideoProcessError> {
    tx.send(StatusUpdate::Processing)?;
    info!("processing");

    let ffmpeg_info = info.clone();
    let output_path = info.output_path.clone();
    let start = Instant::now();
    let max = Duration::from_millis(info.limits.processing.time);
    let mut file = match timeout(max, run_ffmpeg(ffmpeg_info, output_path)).await {
        Ok(value) => value?,
        Err(_) => {
            let elapsed = start.elapsed();
            warn!("processing timed out at {elapsed:?}");
            return Err(FFmpegProcessError::TimeLimitExceeded {
                value: elapsed,
                max,
            }
            .into());
        }
    };
    let size = file.seek(SeekFrom::End(0)).await?;
    file.seek(SeekFrom::Start(0)).await?;
    let elapsed = start.elapsed();
    debug!(
        "processing done in {elapsed:?}, output {}",
        humansize::format_size(size, humansize::DECIMAL)
    );

    tx.send(StatusUpdate::Uploading)?;
    info!("uploading");

    let upload_start = Instant::now();
    let id = upload(file, size, &info.meta, &info.auth).await?;
    let elapsed = upload_start.elapsed();
    debug!(
        "upload done in {elapsed:?}, output {}",
        humansize::format_size(size, humansize::DECIMAL)
    );

    Ok(id)
}

pub async fn ffmpeg_task(
    mut job_input: JobReceiver,
    job_tracker: Arc<JobTracker>,
    token: CancellationToken,
) {
    let tt = TaskTracker::new();

    while let Some(job) = select! {
        v = job_input.recv() => v,
        _ = token.cancelled() => return
    } {
        let QueuedJobInfo { info, tx } = job;
        let id = info.id;
        tx.send(StatusUpdate::Done(
            async {
                let info = Arc::new(info);
                let result = process_job(info.clone(), &tx).await;

                let image_removed = tokio::fs::remove_file(&info.image_path).await.is_ok();
                let audio_removed = tokio::fs::remove_file(&info.audio_path).await.is_ok();
                let video_removed = tokio::fs::remove_file(&info.output_path).await.is_ok();
                info!(%image_removed, %audio_removed, %video_removed, "cleanup");

                result.map_err(Arc::new)
            }
            .instrument(info_span!("processing", %id))
            .await,
        ))
        .expect("a receiver is kept in the tracker at this point");
        drop(tx);
        debug!(%id, "job done");
        let job_tracker = job_tracker.clone();
        let token = token.child_token();
        tt.spawn(async move {
            select! {
                _ = sleep(Duration::from_secs(15 * 60)) => {},
                _ = token.cancelled() => {}
            };
            job_tracker
                .remove_async(&id)
                .await
                .expect("entry got removed before job ended");
            debug!(%id, "dropped job");
        });
    }

    info!("finished dropping everything");
    tt.wait().await;
}

pub fn clamp_resize(
    target_width: u32,
    target_height: u32,
    image_width: u32,
    image_height: u32,
) -> f64 {
    let scale_ratio = target_width as f64 / image_width as f64;
    let new_height = image_height as f64 * scale_ratio;
    let height_ratio = target_height as f64 / new_height;
    if height_ratio < 1.0 {
        scale_ratio * height_ratio
    } else {
        scale_ratio
    }
}
