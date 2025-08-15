use std::borrow::Cow;
use std::time::Duration;

use axum::extract::{Query, State};
use axum::response::{IntoResponse, Redirect};
use axum_extra::extract::cookie::{Cookie, SameSite};
use axum_extra::extract::CookieJar;
use base64::Engine;
use jwt_simple::claims::Claims;
use jwt_simple::prelude::EdDSAKeyPairLike;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use thiserror::Error;
use time::OffsetDateTime;
use tracing::{debug, error};
use url::Url;

use crate::app::AppState;

macro_rules! define_scopes {
    // https://users.rust-lang.org/t/how-to-create-a-string-from-macro-arguments-separated-by-commas/55121/2
    [$a: literal $(, $b:literal)*] => {
        const SCOPES: &'static [&'static str] = &[$a $(, $b)*];
        const SCOPES_STR: &'static str = concat!($a $(, " ", $b)*);
    };
}

define_scopes!["openid", "https://www.googleapis.com/auth/youtube.upload"];

fn lazy_parse_jwt<T: DeserializeOwned>(a: &str) -> Option<T> {
    serde_json::from_str(
        &String::from_utf8(
            base64::prelude::BASE64_URL_SAFE_NO_PAD
                .decode(a.split('.').nth(1)?)
                .ok()?,
        )
        .ok()?,
    )
    .ok()?
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TokenClaim {
    pub scope: Vec<String>,
    pub access_token: String,
    pub expires_at: OffsetDateTime,
    pub refresh_token: String,
    pub user_id: String,
}

#[derive(Deserialize, Debug)]
pub struct OauthTokenResponseSuccess {
    pub access_token: String,
    pub expires_in: f64,
    pub refresh_token: String,
    pub scope: String,
    // token_type is always Bearer
    pub id_token: String,
}

#[derive(Deserialize, Debug, Error)]
#[error("failed to exchange token: {error}")]
pub struct OauthTokenResponseError {
    pub error: String,
    pub error_subtype: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum OauthTokenResponseResult {
    Ok(OauthTokenResponseSuccess),
    Err(OauthTokenResponseError),
}

impl From<OauthTokenResponseResult> for Result<OauthTokenResponseSuccess, OauthTokenResponseError> {
    fn from(value: OauthTokenResponseResult) -> Self {
        match value {
            OauthTokenResponseResult::Ok(v) => Self::Ok(v),
            OauthTokenResponseResult::Err(e) => Self::Err(e),
        }
    }
}

#[derive(Deserialize, Debug)]
pub struct OauthRefreshResponseSuccess {
    pub access_token: String,
    pub expires_in: f64,
    //scope: String, // unnecessary
    // token_type is always Bearer
}

#[derive(Serialize, Deserialize, Debug, Error)]
#[error("failed to refresh token: {error}")]
pub struct OauthRefreshResponseError {
    pub error: String,
    pub error_subtype: Option<String>,
    pub error_message: Option<String>,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum OauthRefreshResponseResult {
    Ok(OauthRefreshResponseSuccess),
    Err(OauthRefreshResponseError),
}

impl From<OauthRefreshResponseResult>
    for Result<OauthRefreshResponseSuccess, OauthRefreshResponseError>
{
    fn from(value: OauthRefreshResponseResult) -> Self {
        match value {
            OauthRefreshResponseResult::Ok(v) => Self::Ok(v),
            OauthRefreshResponseResult::Err(e) => Self::Err(e),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
pub struct OauthQuery {
    code: Option<String>,
    error: Option<String>,
}

#[derive(Error, Debug)]
pub enum OauthCallbackError {
    #[error("bad request")]
    BadRequest,
    #[error("oauth flow error: {0}")]
    OauthFlowError(String),
    #[error("failed to contact oauth servers: {0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("failed token response")]
    TokenResponseParseError, // shouldn't happen
    #[error(transparent)]
    GrantError(#[from] OauthTokenResponseError),
    #[error("invalid scope")]
    InvalidScope,
    #[error("internal server error: {0}")]
    Internal(Cow<'static, str>),
}

impl IntoResponse for OauthCallbackError {
    fn into_response(self) -> axum::response::Response {
        let message = self.to_string();
        error!("error handling request: {message}");

        match self {
            Self::BadRequest => Redirect::to("/?error=bad_request"),
            Self::OauthFlowError(error) => {
                Redirect::to(&format!("/?error=oauth_flow&kind={error}"))
            }
            Self::GrantError(error) => Redirect::to(&format!(
                "/?error=grant&kind={error}{}{}",
                error
                    .error_subtype
                    .as_ref()
                    .map(|st| format!("&error_subtype={st}"))
                    .unwrap_or_default(),
                error
                    .error_message
                    .as_ref()
                    .map(|msg| format!("&error_message={msg}"))
                    .unwrap_or_default()
            )),
            Self::ReqwestError(_) | Self::Internal(_) => Redirect::to("/?error=internal"),
            Self::TokenResponseParseError => Redirect::to("/?error=token_response_parse"),
            Self::InvalidScope => Redirect::to("/?error=invalid_scope"),
        }
        .into_response()
    }
}

#[axum::debug_handler]
pub async fn oauth(
    State(AppState {
        keypair,
        reqwest: client,
        config,
        ..
    }): State<AppState>,
    Query(query): Query<OauthQuery>,
    mut cookies: CookieJar,
) -> Result<impl IntoResponse, OauthCallbackError> {
    let code = match query.code {
        Some(v) => v,
        None => {
            return Err(match query.error {
                Some(error) => OauthCallbackError::OauthFlowError(error),
                None => OauthCallbackError::BadRequest,
            })
        }
    };

    let redirect_url = config
        .http
        .site_url
        .join("oauth")
        .expect("expected valid url")
        .to_string();

    let res = client
        .post(config.auth.token_uri.clone())
        .form(&[
            ("grant_type", "authorization_code"), // keep as first because rust magic
            ("code", &code),
            ("client_id", &config.auth.client_id),
            ("client_secret", &config.auth.client_secret),
            ("redirect_uri", &redirect_url),
        ])
        .send()
        .await?;

    let bytes = res.bytes().await?;
    let parsed: OauthTokenResponseResult = match serde_json::from_slice(&bytes) {
        Ok(v) => v,
        Err(e) => {
            error!("failed to parse response json: {e}");
            return Err(OauthCallbackError::TokenResponseParseError);
        }
    };
    drop(bytes);
    debug!("token response: {parsed:?}");
    let data: OauthTokenResponseSuccess = Result::from(parsed)?;
    let scope: Vec<String> = data.scope.split(' ').map(String::from).collect();

    if SCOPES // of these scopes,
        .iter()
        .any(
            |a| // if any
            !scope.iter().any(|b| a == b), // are not fouund in the vector
        )
    {
        return Err(OauthCallbackError::InvalidScope);
    }

    #[derive(Deserialize)]
    struct Sub {
        sub: String,
    }
    let id: Option<Sub> = lazy_parse_jwt(&data.id_token);
    let user_id = match id {
        Some(Sub { sub }) => sub,
        None => return Err(OauthCallbackError::TokenResponseParseError),
    };

    let claims = Claims::with_custom_claims(
        TokenClaim {
            scope,
            refresh_token: data.refresh_token,
            access_token: data.access_token,
            expires_at: OffsetDateTime::now_utc()
                + Duration::from_secs((data.expires_in as u64).saturating_sub(60)),
            user_id,
        },
        jwt_simple::prelude::Duration::from_days(90),
    );
    let token = match keypair.sign(claims) {
        Ok(v) => v,
        Err(err) => return Err(OauthCallbackError::Internal(err.to_string().into())),
    };

    let cookie = Cookie::build(("token", token))
        .same_site(SameSite::Strict)
        .secure(true)
        .expires(OffsetDateTime::now_utc() + Duration::from_days(90))
        .build();
    cookies = cookies.add(cookie);
    Ok((cookies, Redirect::to("/?auth=1")))
}

pub async fn oauth_prompt(State(AppState { config, .. }): State<AppState>) -> impl IntoResponse {
    let redirect_url = config
        .http
        .site_url
        .join("oauth")
        .expect("expected valid url");

    let mut url = Url::parse("https://accounts.google.com/o/oauth2/v2/auth")
        .expect("hardcoded url to be valid");
    let mut query = url.query_pairs_mut();
    query.append_pair("access_type", "offline");
    query.append_pair("prompt", "consent");
    query.append_pair("include_granted_scopes", "false");
    query.append_pair("response_type", "code");
    query.append_pair("scope", SCOPES_STR);
    query.append_pair("redirect_uri", redirect_url.as_str());
    query.append_pair("client_id", &config.auth.client_id);
    drop(query);

    Redirect::to(url.as_str())
}
