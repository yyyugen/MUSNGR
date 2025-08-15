use std::borrow::Cow;
use std::sync::Arc;
use std::time::Duration;

use axum::extract::multipart::Multipart;
use axum::extract::ws::{Message, WebSocket};
use axum::extract::{Path, Request, State, WebSocketUpgrade};
use axum::http::{Response, StatusCode};
use axum::middleware::{from_fn, Next};
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Extension, Json, Router};
use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::CookieJar;
use jwt_simple::claims::Claims;
use jwt_simple::prelude::{Ed25519KeyPair, EdDSAKeyPairLike, EdDSAPublicKeyLike};
use serde_json::json;
use time::OffsetDateTime;
use tokio::fs::File;
use tokio::sync::mpsc::error::TrySendError;
use tokio::task::spawn_blocking;
use tokio_util::sync::CancellationToken;
use tower_http::trace::TraceLayer;
use tracing::{debug, info, info_span, trace, Span};
use ulid::Ulid;

use crate::auth::{OauthRefreshResponseResult, TokenClaim};
use crate::config::{Config, ImageSizeLimits};
use crate::error::{UploadError, WsError};
use crate::ffmpeg::*;
use crate::ffprobe::get_duration_ffprobe;
use crate::util::{decode_image, get_file_info, remove_failed_upload, take_upload};

#[derive(Clone)]
pub struct AppState {
    pub config: &'static Config,
    pub job_sender: JobSender,
    pub job_tracker: Arc<JobTracker>,
    pub cancellation_token: CancellationToken,
    pub keypair: Ed25519KeyPair,
    pub reqwest: reqwest::Client,
}

//pub const HEADROOM: u64 = 500_000;
pub const MAX_TITLE: usize = 100;
pub const MAX_DESC: usize = 5000;

async fn request_id(mut request: Request, next: Next) -> impl IntoResponse {
    request.extensions_mut().insert(Ulid::new());
    next.run(request).await
}

async fn upload(
    Extension(id): Extension<Ulid>,
    State(AppState {
        config,
        job_sender,
        cancellation_token,
        job_tracker,
        keypair,
        reqwest: client,
        ..
    }): State<AppState>,
    mut cookies: CookieJar,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, UploadError> {
    let claim_cookie = match cookies.get("token") {
        Some(cookie) => cookie.value(),
        None => return Err(UploadError::Unauthorized),
    };

    let claims = keypair
        .public_key()
        .verify_token::<TokenClaim>(claim_cookie, None)
        .map_err(|_| UploadError::InvalidJWT("signature"))?;

    let mut image_file = None;
    let mut audio_file = None;
    let mut title_field = None;
    let mut desc_field = None;
    let mut privacy = Privacy::default();
    let mut tags = Vec::new();
    let mut category = 10; // Music
    let mut made_for_kids = false;
    let mut notify_subs = false;

    while let Some(mut field) = multipart.next_field().await? {
        let field_name = field
            .name()
            .ok_or(UploadError::BadRequest("field name undefined"))?;

        match field_name {
            "image" => {
                let (file_name, output_path) = get_file_info(&field, &config, id, "image")?;

                let mut file = File::create_new(&output_path).await?;
                remove_failed_upload(
                    take_upload(
                        &mut field,
                        &mut file,
                        "image",
                        config.limits.upload.max_image,
                    )
                    .await,
                    &mut file,
                    &*output_path,
                )
                .await?;
                image_file = Some((file_name, output_path, file));
            }
            "audio" => {
                let (file_name, output_path) = get_file_info(&field, &config, id, "audio")?;

                let mut file = File::create_new(&output_path).await?;
                remove_failed_upload(
                    take_upload(
                        &mut field,
                        &mut file,
                        "audio",
                        config.limits.upload.max_audio,
                    )
                    .await,
                    &mut file,
                    &*output_path,
                )
                .await?;
                audio_file = Some((file_name, output_path, file));
            }
            "title" => {
                let text = field.text().await?;
                title_field = (text.len() <= MAX_TITLE).then_some(text);
            }
            "description" => {
                let text = field.text().await?;
                desc_field = (text.len() <= MAX_DESC - config.description_watermark.len() - 3)
                    .then_some(text);
            }
            "privacy" => {
                let text = field.text().await?;
                if text.is_empty() {
                    continue;
                }
                privacy = text
                    .parse()
                    .map_err(|_| UploadError::BadRequest("inalid privacy value"))?;
            }
            "tags" => {
                let text = field.text().await?;
                if text.is_empty() {
                    continue;
                }
                // A list of keyword tags associated with the video. Tags may contain spaces. The property value has a maximum length of 500 characters. Note the following rules regarding the way the character limit is calculated:
                // - The property value is a list, and commas between items in the list count toward the limit.
                // - If a tag contains a space, the API server handles the tag value as though it were wrapped in quotation marks, and the quotation marks count toward the character limit. So, for the purposes of character limits, the tag Foo-Baz contains seven characters, but the tag Foo Baz contains nine characters.

                // character count including separator + (separator count + 1) * 2
                let len = text.len() + (text.chars().filter(|x| *x == '\n').count() + 1) * 2;
                if len < 500 {
                    tags = text.split('\n').map(String::from).collect();
                } else {
                    return Err(UploadError::BadRequest("tags too long"));
                }
            }
            "category" => {
                let text = field.text().await?;
                if text.is_empty() {
                    continue;
                }
                category = text
                    .parse()
                    .ok()
                    .and_then(|n| CATEGORY_IDS.contains(&n).then_some(n))
                    .ok_or(UploadError::BadRequest("invalid category number"))?;
            }
            "made_for_kids" => {
                let text = field.text().await?;
                made_for_kids = text == "on";
            }
            "notify_subs" => {
                let text = field.text().await?;
                notify_subs = text == "on";
            }
            v => {
                trace!("unknown field {v:?}");
            }
        };
    }

    let (image_name, image_path, image_fd) =
        image_file.ok_or(UploadError::BadRequest("no image file"))?;

    let (audio_name, audio_path, audio_fd) =
        audio_file.ok_or(UploadError::BadRequest("no audio file"))?;
    drop(audio_fd);
    let meta_filename = audio_name.clone();

    let length_limits = config.limits.audio;
    let time = get_duration_ffprobe(&*audio_path).await?;
    if !time.is_normal() && time != 0.0 {
        return Err(UploadError::AudioMisc {
            code: "invalid_duration",
            message: "duration is not a valid number",
        });
    }

    if !(length_limits.min..=length_limits.max).contains(&time) {
        return Err(UploadError::AudioLength {
            expected: length_limits,
            value: time,
        });
    }

    let image_limits = config.limits.image;
    let ImageSizeLimits {
        min_resolution: (min_width, min_height),
        max_resolution: (max_width, max_height),
        max_decoded,
    } = image_limits;
    let image_fd = image_fd.into_std().await;
    let ((width, height), decoded_size) =
        spawn_blocking(move || decode_image(image_name, image_fd)).await??;

    #[allow(clippy::manual_range_contains)] // it is worse
    if width < min_width || width > max_width || height < min_height || height > max_height {
        return Err(UploadError::ImageDimensions {
            value: (width, height),
            expected: image_limits,
        });
    } else if decoded_size > max_decoded {
        return Err(UploadError::FileTooLarge {
            subject: "image_decoded",
            max: max_decoded,
        });
    }

    let permit = match job_sender.try_reserve() {
        Ok(v) => v,
        Err(TrySendError::Full(_)) => {
            return Err(UploadError::QueueFull(config.limits.processing.queue_size))
        }
        Err(TrySendError::Closed(_)) => {
            cancellation_token.cancel();
            return Err(UploadError::ChannelClosed);
        }
    };

    let mut c = claims.custom;

    // check if it's going to expire and regen token
    let now = OffsetDateTime::now_utc();
    if now
        > c.expires_at // ideally do saturating_sub but `time` is kinda stupid
            - Duration::from_millis(config.limits.processing.time)
                * config.limits.processing.queue_size as u32
    {
        let res = client
            .post(config.auth.token_uri.as_str())
            .form(&[
                ("grant_type", "refresh_token"),
                ("client_id", &config.auth.client_id),
                ("client_secret", &config.auth.client_secret),
                ("refresh_token", &c.refresh_token),
            ])
            .send()
            .await?;
        let bytes = res.bytes().await?;
        let parsed: OauthRefreshResponseResult = serde_json::from_slice(&bytes)?;
        drop(bytes);
        let data = Result::from(parsed)?;

        c.access_token = data.access_token;
        c.expires_at = OffsetDateTime::now_utc()
            + Duration::from_secs((data.expires_in as u64).saturating_sub(60));
        let new_claims =
            Claims::with_custom_claims(c.clone(), jwt_simple::prelude::Duration::from_days(90));
        match keypair.sign(new_claims) {
            Ok(token) => {
                // new token
                let cookie = Cookie::build(("token", token))
                    .same_site(SameSite::Strict)
                    .secure(true)
                    .expires(OffsetDateTime::now_utc() + Duration::from_days(90))
                    .build();
                cookies = cookies.add(cookie);
            }
            Err(err) => return Err(UploadError::Other(Cow::Owned(err.to_string()))),
        }
    }

    let description = match desc_field {
        Some(desc) => format!("{}\n\n{}", &desc, &config.description_watermark),
        None => config.description_watermark.clone(),
    };

    let job_info = JobInfo {
        id,
        image_path,
        image_size: (width, height),

        audio_path,
        audio_length: time,
        output_path: config.temp_dir.join(format!("output_{id}.mkv")).into(),
        frame: Arc::new(config.frame.clone()),
        limits: Arc::new(config.limits),
        meta: Metadata {
            filename: meta_filename,
            title: title_field,
            description,
            privacy,
            tags,
            category,
            made_for_kids,
            notify_subs,
        },
        auth: c,
    };

    submit_job(job_info, permit, &job_tracker).await;

    info!("job submitted");

    let url = match config.http.instance_url.clone() {
        Some(mut url) => {
            let mut sm = url.path_segments_mut();
            match sm.as_mut() {
                Ok(seg) => {
                    seg.push("ws");
                    seg.push(&id.to_string());
                    drop(sm);
                    url.to_string()
                }
                Err(()) => {
                    drop(sm);
                    format!("{url}/ws/{id}")
                }
            }
        }
        None => {
            format!("/ws/{id}")
        }
    };

    Ok((
        StatusCode::ACCEPTED,
        cookies,
        Json(json!({
            "error": false,
            "ws_url": url,
            "id": id
        })),
    ))
}

pub async fn status(
    State(AppState { job_tracker, .. }): State<AppState>,
    Path(id): Path<Ulid>,
    ws: WebSocketUpgrade,
) -> Result<impl IntoResponse, WsError> {
    let job_entry = job_tracker.get_async(&id).await.ok_or(WsError::NoId(id))?;
    let rx = StatusReceiver::clone(job_entry.get());
    drop(job_entry);

    Ok(ws.on_upgrade(move |socket| handle_ws(socket, rx)))
}

async fn handle_ws(mut socket: WebSocket, mut rx: StatusReceiver) {
    loop {
        if rx.changed().await.is_err() {
            debug!("channel closed");
            break;
        };
        // Sorry for this horror
        // The Ref<'_, T> type is weird
        let json =
            serde_json::to_string(&*rx.borrow_and_update()).expect("serialization should work");
        if socket.send(Message::Text(json)).await.is_err() {
            break;
        };
    }

    let _ = socket.close().await;
}

async fn limits(
    State(AppState {
        config, job_sender, ..
    }): State<AppState>,
) -> Json<serde_json::Value> {
    Json(json!({
        "limits": config.limits,
        "queue_slots": job_sender.capacity(),
        "max_description": MAX_DESC - config.description_watermark.len() - 3
    }))
}

pub fn new(state: AppState) -> Router<()> {
    Router::new()
        .route("/upload", post(upload))
        .route("/ws/:id", get(status))
        .route("/oauth", get(crate::auth::oauth))
        .route("/oauth_prompt", get(crate::auth::oauth_prompt))
        .route("/limits", get(limits))
        .with_state(state)
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(|request: &Request<_>| {
                    let id = request
                        .extensions()
                        .get::<Ulid>()
                        .cloned()
                        .unwrap_or_default();
                    info_span!(
                        "request",
                        method = ?request.method(),
                        path = ?request.uri().path(),
                        %id
                    )
                })
                .on_response(|response: &Response<_>, duration: Duration, span: &Span| {
                    let _ = span.enter();
                    let status = response.status();
                    info!(?status, ?duration, "response");
                }),
        )
        .layer(from_fn(request_id))
        .layer(axum::extract::DefaultBodyLimit::disable())
}
