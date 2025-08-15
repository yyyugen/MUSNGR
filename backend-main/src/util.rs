use std::io::BufReader;
use std::path::Path;
use std::sync::Arc;

use axum::extract::multipart::Field;
use futures_util::TryStreamExt;
use image::{ImageDecoder, ImageFormat, ImageReader};
use tokio::fs::File;
use tokio::io::{AsyncReadExt, AsyncSeekExt};
use tokio_util::io::StreamReader;
use tracing::{error, warn};
use ulid::Ulid;

use crate::config::Config;
use crate::error::UploadError;

pub async fn take_upload<'a>(
    field: &mut Field<'a>,
    file: &mut File,
    subject: &'static str,
    limit: u64,
) -> Result<u64, UploadError> {
    let mut reader = StreamReader::new(field.map_err(std::io::Error::other)).take(limit + 1);
    let len = tokio::io::copy(&mut reader, file).await?;
    if len > limit {
        Err(UploadError::FileTooLarge {
            subject,
            max: limit,
        })
    } else {
        file.seek(std::io::SeekFrom::Start(0)).await?;
        Ok(len)
    }
}

pub async fn remove_failed_upload<T, E>(
    result: Result<T, E>,
    file: &mut File,
    path: impl AsRef<std::path::Path>,
) -> Result<T, E> {
    match result {
        Ok(v) => Ok(v),
        Err(err) => {
            warn!(file=%"audio", "removing failed upload");
            async {
                file.set_len(0).await?;
                tokio::fs::remove_file(path).await?;
                Ok(())
            }
            .await
            .unwrap_or_else(|err: std::io::Error| error!("failed to remove failed upload: {err}"));

            Err(err)
        }
    }
}

pub fn get_file_info(
    field: &Field,
    config: &Config,
    id: Ulid,
    kind: &str,
) -> Result<(String, Arc<std::path::Path>), UploadError> {
    let file_name = field
        .file_name()
        .ok_or(UploadError::InvalidFileName(String::new()))?
        .to_owned();
    let extension = std::path::Path::new(&file_name)
        .extension()
        .ok_or_else(|| UploadError::InvalidFileName(file_name.to_string()))?;
    let output_path = config
        .temp_dir
        .join(format!("{kind}_{id}.{}", extension.to_string_lossy()))
        .into();

    Ok((file_name, output_path))
}

pub fn decode_image(
    image_name: impl AsRef<Path>,
    file: std::fs::File,
) -> Result<((u32, u32), u64), UploadError> {
    let image_format = mime_guess::from_path(image_name)
        .first()
        .ok_or(UploadError::BadRequest("unknown image extension"))?;
    let mut image_reader = ImageReader::new(BufReader::new(file));
    image_reader.set_format(
        ImageFormat::from_mime_type(image_format)
            .ok_or(UploadError::BadRequest("unsupported image mime type"))?,
    );

    let decoder = image_reader.into_decoder()?;

    Ok((decoder.dimensions(), decoder.total_bytes()))
}
