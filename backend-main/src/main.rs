#![feature(generic_arg_infer, duration_constructors, duration_millis_float)]

mod app;
mod auth;
mod config;
mod error;
mod ffmpeg;
mod ffprobe;
mod util;

use std::net::SocketAddr;
use std::sync::Arc;

use app::MAX_DESC;
use color_eyre::eyre::{self, bail, Context};
use ffmpeg::JobTracker;
use image::image_dimensions;
use jwt_simple::algorithms::{Ed25519KeyPair, EdDSAKeyPairLike};
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use tokio_util::sync::CancellationToken;
use tracing::level_filters::LevelFilter;
use tracing::{debug, info};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::{util::SubscriberInitExt, EnvFilter};

use crate::app::AppState;
use crate::config::Config;
use crate::ffmpeg::ffmpeg_task;

#[allow(unused)]
fn to_secret(v: &Ed25519KeyPair) -> [u8; 32] {
    let a: &ed25519_compact::KeyPair = v.key_pair().as_ref();
    unsafe { a.sk[..32].try_into().unwrap_unchecked() }
}

fn from_secret(v: [u8; 32]) -> Ed25519KeyPair {
    let seed = ed25519_compact::Seed::new(v);
    let kp = ed25519_compact::KeyPair::from_seed(seed);
    unsafe { Ed25519KeyPair::from_bytes(&*kp).unwrap_unchecked() }
}

#[tokio::main]
async fn main() -> eyre::Result<()> {
    color_eyre::install()?;
    tracing_subscriber::registry()
        .with(
            EnvFilter::builder()
                .with_default_directive(LevelFilter::INFO.into())
                .from_env_lossy(),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    debug!("warning: you're running with debug logging on! sensitive information may be logged.");

    if which::which("ffmpeg").is_err() {
        bail!("ffmpeg not in path! make sure it's installed and in $PATH");
    }

    debug!("loading config");

    let config: &'static Config = Box::leak(Box::new(
        config::load()
            .await
            .context("couldn't load configuration")?,
    ));

    if config.description_watermark.len() > MAX_DESC - 3 {
        bail!(
            "description watermark is too long! (max: {}, actual: {})",
            MAX_DESC - 3,
            config.description_watermark.len()
        );
    }

    if let Some(path) = config.frame.watermark.as_ref() {
        image_dimensions(path)
            .context("coulnd't load watermark image! make sure it's a valid image file.")?;
    }

    if !tokio::fs::try_exists(&config.temp_dir)
        .await
        .with_context(|| format!("couldn't check if temp_dir {:?} exists", &config.temp_dir))?
    {
        debug!("creating temporary directory");
        tokio::fs::create_dir_all(&config.temp_dir)
            .await
            .with_context(|| format!("couldn't create temp_dir {:?}", &config.temp_dir))?;
    }

    let socket_addr = SocketAddr::new(config.http.host, config.http.port);

    let cancellation_token = CancellationToken::new();
    let axum_token = cancellation_token.child_token();
    let ffmpeg_token = cancellation_token.child_token();

    let (job_sender, rx) = mpsc::channel(config.limits.processing.queue_size);
    let job_tracker = Arc::<JobTracker>::default();
    let ffmpeg_task = tokio::spawn(ffmpeg_task(rx, job_tracker.clone(), ffmpeg_token));

    let app = app::new(AppState {
        config,
        job_sender,
        job_tracker,
        cancellation_token: cancellation_token.clone(),
        keypair: from_secret(config.jwt_key.0),
        reqwest: Default::default(),
    });

    let listener = TcpListener::bind(socket_addr)
        .await
        .with_context(|| format!("couldn't listen on {}", socket_addr))?;
    let local_addr = listener
        .local_addr()
        .context("couldn't get socket address")?;
    info!("listening on http://{}", local_addr);

    axum::serve(listener, app)
        .with_graceful_shutdown(async move { axum_token.cancelled().await })
        .await
        .context("failed to serve app")?;

    ffmpeg_task.await.context("ffmpeg task failed")?;

    Ok(())
}
