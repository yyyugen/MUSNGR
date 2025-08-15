use std::env;
use std::fmt::Display;
use std::net::{IpAddr, Ipv6Addr};
use std::path::PathBuf;

use color_eyre::eyre::{bail, Context, Result};
use rand::RngCore;
use serde::de::Visitor;
use serde::{Deserialize, Deserializer, Serialize, Serializer};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tracing::{error, info, instrument};
use url::Url;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
pub struct HttpConfig {
    pub host: IpAddr,
    pub port: u16,
    /// full url including any prefixes to the application, for oauth.
    pub site_url: Url,
    /// full url including any prefixes to this instance of *this instance*
    /// of the application, required for load-balancing.
    /// if not set, handled by client
    pub instance_url: Option<Url>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
pub struct OauthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub token_uri: Url,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(default)]
pub struct ImageSizeLimits {
    pub min_resolution: (u32, u32),
    pub max_resolution: (u32, u32),
    pub max_decoded: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(default)]
pub struct UploadLimits {
    pub max_image: u64,
    pub max_audio: u64,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(default)]
pub struct AudioLengthLimits {
    pub min: f64,
    pub max: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
#[serde(default)]
pub struct ProcessingLimits {
    /// should **not** take more than an hour to clear
    /// because google doesn't give auth tokens that long
    pub queue_size: usize,
    /// milliseconds
    pub time: u64,
}

#[derive(Serialize, Deserialize, Default, Debug, Clone, Copy)]
#[serde(default)]
pub struct LimitsConfig {
    pub image: ImageSizeLimits,
    pub audio: AudioLengthLimits,
    pub upload: UploadLimits,
    pub processing: ProcessingLimits,
}

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
#[serde(rename_all = "lowercase")]
pub enum Fit {
    #[default]
    Resize,
    Stretch,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
pub struct FrameConfig {
    pub enable: bool,
    pub watermark: Option<PathBuf>,
    pub x: u32,
    pub y: u32,
    pub frame_size: (u32, u32),
    pub image_size: (u32, u32),
    pub frame_color: String,
    pub void_color: String,
    pub fit: Fit,
}

#[derive(Debug, Clone)]
pub struct HexBytes<const LEN: usize>(pub [u8; LEN]);

impl<const LEN: usize> Serialize for HexBytes<LEN> {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        hex::encode(self.0).serialize(serializer)
    }
}

impl<'de, const LEN: usize> Deserialize<'de> for HexBytes<LEN> {
    fn deserialize<D>(deserializer: D) -> std::result::Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct HexBytesVisitor<const LEN: usize>;
        impl<'de, const LEN: usize> Visitor<'de> for HexBytesVisitor<LEN> {
            type Value = HexBytes<LEN>;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                write!(formatter, "a hex string of length {}", LEN * 2)
            }

            fn visit_str<E>(self, v: &str) -> std::result::Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if v.len() != LEN * 2 {
                    return Err(E::invalid_length(v.len(), &self));
                }

                let mut slice = [0u8; LEN];

                if hex::decode_to_slice(v, &mut slice).is_err() {
                    return Err(E::invalid_value(serde::de::Unexpected::Str(v), &self));
                };

                Ok(HexBytes(slice))
            }
        }

        deserializer.deserialize_str(HexBytesVisitor::<LEN>)
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(default)]
pub struct Config {
    pub http: HttpConfig,
    //pub db_url: Url,
    pub auth: OauthConfig,
    pub limits: LimitsConfig,
    pub temp_dir: PathBuf,
    pub frame: FrameConfig,
    pub jwt_key: HexBytes<32>,
    pub description_watermark: String,
}

impl Default for Config {
    fn default() -> Self {
        let mut jwt_key = HexBytes([0u8; _]);
        rand::thread_rng().fill_bytes(&mut jwt_key.0);

        Self {
            http: Default::default(),
            //db_url: Url::parse("postgres:///musngr?host=%2Frun%2Fpostgresql&user=musngr").unwrap(),
            auth: Default::default(),
            limits: Default::default(),
            temp_dir: PathBuf::from("temp"),
            frame: Default::default(),
            jwt_key,
            description_watermark: String::new(),
        }
    }
}

impl Default for OauthConfig {
    fn default() -> Self {
        Self {
            client_id: "YOUR-CLIENT-ID-HERE".into(),
            client_secret: "YOUR-CLIENT-SECRET-HERE".into(),
            token_uri: Url::parse("https://oauth2.googleapis.com/token").unwrap(),
        }
    }
}

impl Default for FrameConfig {
    fn default() -> Self {
        Self {
            enable: false,
            watermark: None,
            x: 0,
            y: 0,
            frame_size: (1920, 1080),
            image_size: (1280, 720),
            frame_color: "black".into(),
            void_color: "black".into(),
            fit: Default::default(),
        }
    }
}

impl Default for HttpConfig {
    fn default() -> Self {
        Self {
            host: IpAddr::V6(Ipv6Addr::UNSPECIFIED),
            port: 3000,
            site_url: Url::parse("https://testmusngr.netlify.app/").unwrap(),
            instance_url: None,
        }
    }
}

impl Default for ProcessingLimits {
    fn default() -> Self {
        Self {
            queue_size: 10,
            time: 300000,
        }
    }
}

impl Default for UploadLimits {
    fn default() -> Self {
        Self {
            max_image: 10_000_000,
            max_audio: 100_000_000,
        }
    }
}

impl Default for ImageSizeLimits {
    fn default() -> Self {
        Self {
            min_resolution: (100, 100),
            max_resolution: (10000, 10000),
            max_decoded: 40_000_000,
        }
    }
}

impl Default for AudioLengthLimits {
    fn default() -> Self {
        Self {
            min: 0.0,
            max: 7200.0,
        }
    }
}

impl Display for ImageSizeLimits {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "min: {:?}, max: {:?}",
            self.min_resolution, self.max_resolution
        )
    }
}

impl Display for AudioLengthLimits {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "min: {}s, max: {}s", self.min, self.max)
    }
}

#[instrument(name = "config")]
pub async fn load() -> Result<Config> {
    let config_file = env::var(format!(
        "{}_CONFIG",
        env!("CARGO_BIN_NAME").to_uppercase().replace('-', "_")
    ))
    .unwrap_or(String::from("config.toml"));
    match tokio::fs::OpenOptions::new()
        .read(true)
        .open(&config_file)
        .await
    {
        Ok(mut file) => {
            let mut buf = String::new();
            file.read_to_string(&mut buf)
                .await
                .context("couldn't read configuration file")?;
            toml::from_str(&buf).context("couldn't parse configuration")
        }
        Err(err) => match err.kind() {
            std::io::ErrorKind::NotFound => {
                let config = Config::default();
                info!("configuration file doesn't exist, creating");
                match tokio::fs::OpenOptions::new()
                    .write(true)
                    .create(true)
                    .truncate(true)
                    .open(&config_file)
                    .await
                {
                    Ok(mut file) => file
                        .write_all(
                            toml::to_string_pretty(&config)
                                .context("couldn't serialize configuration")?
                                .as_bytes(),
                        )
                        .await
                        .unwrap_or_else(|err| error!("couldn't write configuration: {}", err)),
                    Err(err) => {
                        error!("couldn't open file {:?} for writing: {}", &config_file, err)
                    }
                }
                Ok(config)
            }
            _ => bail!("couldn't open config file: {}", err),
        },
    }
}
