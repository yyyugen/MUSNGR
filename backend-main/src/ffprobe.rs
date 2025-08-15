use std::ffi::OsStr;
use std::process::Stdio;

use serde::Deserialize;
use thiserror::Error;
use tokio::process::Command;
use tracing::debug;

#[derive(Error, Debug)]
pub enum FfprobeError {
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error("failed to parse metadata: {0}")]
    ParseError(#[from] serde_json::Error),
    #[error("no audio streams found")]
    NoStreams,
}

#[derive(Deserialize, Debug)]
#[allow(unused)]
struct ProbeStream {
    index: i64,
    codec_name: String,
    codec_type: String,
    start_time: Option<String>,
    duration: String,
}

#[derive(Deserialize, Debug)]
#[allow(unused)]
struct ProbeFormat {
    start_time: Option<String>,
    duration: String,
}

#[derive(Deserialize, Debug)]
#[allow(unused)]
struct Probe {
    streams: Vec<ProbeStream>,
    format: ProbeFormat,
}

pub async fn get_duration_ffprobe(path: impl AsRef<OsStr>) -> Result<f64, FfprobeError> {
    let mut cmd = Command::new("ffprobe");
    cmd.arg("-hide_banner")
        .arg("-show_format")
        .arg("-show_streams")
        .arg("-of")
        .arg("json")
        .arg("-i")
        .arg(path)
        .stdout(Stdio::piped());

    let child = cmd.spawn()?;
    let out = child.wait_with_output().await?;
    let probe: Probe = serde_json::from_slice(&out.stdout)?;

    let mut duration = None;

    for stream in probe.streams.into_iter() {
        if stream.codec_type == "audio" {
            debug!("found audio stream");
            let d: f64 = stream.duration.parse().expect("ffprobe output to be valid");
            let s: f64 = stream
                .start_time
                .map(|s| s.parse().expect("ffprobe output to be valid"))
                .unwrap_or(0.0);

            debug!("duration: {d}, start time: {s}");

            duration = Some(s + d);
            break;
        }
    }

    duration.ok_or(FfprobeError::NoStreams)
}
