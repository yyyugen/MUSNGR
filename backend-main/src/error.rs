use std::borrow::Cow;
use std::num::ParseIntError;

use axum::extract::multipart::MultipartError;
use axum::http::{header::ToStrError, StatusCode};
use axum::response::{IntoResponse, Response};
use axum::Json;
use axum_extra::extract::cookie::Cookie;
use axum_extra::extract::cookie::{Expiration, SameSite};
use axum_extra::extract::CookieJar;
use image::ImageError;
use serde_json::json;
use thiserror::Error;
use time::OffsetDateTime;
use tokio::task::JoinError;
use tracing::{debug, error};
use ulid::Ulid;

use crate::auth::OauthRefreshResponseError;
use crate::config::*;
use crate::ffprobe::FfprobeError;

#[derive(Debug, Error)]
pub enum UploadError {
    #[error("Application is shutting down")]
    ChannelClosed,
    #[error("Queue is full (max: {0})")]
    QueueFull(usize),
    #[error(transparent)]
    JoinError(#[from] JoinError),
    #[error(transparent)]
    MultipartError(#[from] MultipartError),
    #[error("Bad Request: {0}")]
    BadRequest(&'static str),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("File Too Large (max {max})")]
    FileTooLarge { subject: &'static str, max: u64 },
    #[error("Invalid file name: {0:?}")]
    InvalidFileName(String),
    /*#[error("Content-Length too high (expected {expected}, got {value})")]
    ContentLength { expected: u64, value: u64 },*/
    #[error(transparent)]
    ToStrError(#[from] ToStrError),
    #[error(transparent)]
    ParseIntError(#[from] ParseIntError),
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error(transparent)]
    ImageParseError(#[from] ImageError),
    #[error("Invalid image dimensions (expected {expected}, got {value:?})")]
    ImageDimensions {
        expected: ImageSizeLimits,
        value: (u32, u32),
    },
    #[error(transparent)]
    AudioParseError(#[from] FfprobeError),
    #[error("{message}")]
    AudioMisc {
        code: &'static str,
        message: &'static str,
    },
    #[error("Invalid audio length (expected {expected}, got {value})")]
    AudioLength {
        expected: AudioLengthLimits,
        value: f64,
    },
    #[error("Invalid token: {0}")]
    InvalidJWT(&'static str),
    #[error("failed to contact oauth servers: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error(transparent)]
    RefreshError(#[from] OauthRefreshResponseError),
    #[error("failed to parse api response")]
    JsonParseError(#[from] serde_json::Error),
    #[error("internal server error: {0}")]
    Other(Cow<'static, str>),
}

impl IntoResponse for UploadError {
    fn into_response(self) -> Response {
        let message = self.to_string();
        error!("error handling request: {message}");
        debug!("{self:?}");

        match self {
            Self::MultipartError(_)
            | Self::BadRequest(_)
            | Self::ToStrError(_)
            | Self::ParseIntError(_) => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "error": "bad_request",
                    "message": message,
                })),
            )
                .into_response(),
            Self::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "error": "unauthorized",
                    "message": message,
                })),
            )
                .into_response(),
            /*Self::ContentLength { expected, value } => (
                StatusCode::PAYLOAD_TOO_LARGE,
                Json(json!({
                    "error": "content_length",
                    "expected": expected,
                    "value": value,
                    "message": message,
                })),
            )
                .into_response(),*/
            Self::FileTooLarge { subject, max } => (
                StatusCode::PAYLOAD_TOO_LARGE,
                Json(json!({
                    "error": "too_large",
                    "subject": subject,
                    "max": max,
                    "message": message,
                })),
            )
                .into_response(),
            Self::InvalidFileName(name) => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "error": "invalid_file_name",
                    "file": name,
                    "message": message,
                })),
            )
                .into_response(),
            Self::ImageParseError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "parse",
                    "subject": "image",
                    "message": message,
                })),
            )
                .into_response(),
            Self::AudioParseError(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "parse",
                    "subject": "audio",
                    "message": message,
                })),
            )
                .into_response(),
            Self::ImageDimensions { expected, value } => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "error": "limits",
                    "subject": "image_dimensions",
                    "expected": expected,
                    "value": value,
                    "message": message,
                })),
            )
                .into_response(),
            Self::AudioLength { expected, value } => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "error": "limits",
                    "subject": "audio_length",
                    "expected": expected,
                    "value": value,
                    "message": message,
                })),
            )
                .into_response(),
            Self::AudioMisc { code, .. } => (
                StatusCode::BAD_REQUEST,
                Json(json!({
                    "error": "audio_misc",
                    "subject": code,
                    "message": message,
                })),
            )
                .into_response(),
            Self::ChannelClosed => (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(json!({
                    "error": "shutting_down",
                    "message": message,
                })),
            )
                .into_response(),
            Self::QueueFull(max) => (
                StatusCode::SERVICE_UNAVAILABLE,
                Json(json!({
                    "error": "queue_full",
                    "max": max,
                    "message": message,
                })),
            )
                .into_response(),
            Self::IoError(_)
            | Self::JoinError(_)
            | Self::ReqwestError(_)
            | Self::JsonParseError(_)
            | Self::Other(_) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "error": "internal_error",
                    "message": message,
                })),
            )
                .into_response(),
            Self::InvalidJWT(reason) => {
                let c = Cookie::build(("token", ""))
                    .expires(Expiration::DateTime(OffsetDateTime::UNIX_EPOCH))
                    .secure(true)
                    .same_site(SameSite::Strict)
                    .build();
                (
                    StatusCode::UNAUTHORIZED,
                    CookieJar::new().add(c),
                    Json(json!({
                        "error": "invalid_jwt",
                        "reason": reason,
                        "message": message,
                    })),
                )
                    .into_response()
            }
            Self::RefreshError(e) => {
                let c = Cookie::build(("token", ""))
                    .expires(Expiration::DateTime(OffsetDateTime::UNIX_EPOCH))
                    .secure(true)
                    .same_site(SameSite::Strict)
                    .build();
                (
                    StatusCode::UNAUTHORIZED,
                    CookieJar::new().add(c),
                    Json(json!({
                        "error": "oauth_error",
                        "original": e,
                        "message": message,
                    })),
                )
                    .into_response()
            }
        }
    }
}

#[derive(Debug, Error)]
pub enum WsError {
    #[error("No job found with id {0}")]
    NoId(Ulid),
}

impl IntoResponse for WsError {
    fn into_response(self) -> Response {
        let message = self.to_string();
        error!("error handling websocket: {message}");

        match self {
            Self::NoId(id) => (
                StatusCode::NOT_FOUND,
                Json(json!({
                    "error": "not_found",
                    "id": id,
                    "message": message,
                })),
            ),
        }
        .into_response()
    }
}
