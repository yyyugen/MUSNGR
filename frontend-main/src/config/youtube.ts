export const YOUTUBE_API_CONFIG = {
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/yt-analytics.readonly'
  ],
  apiKey: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
};

export const YOUTUBE_API_ENDPOINTS = {
  upload: 'https://www.googleapis.com/upload/youtube/v3/videos',
  videos: 'https://www.googleapis.com/youtube/v3/videos',
  channels: 'https://www.googleapis.com/youtube/v3/channels',
  analytics: 'https://youtubeanalytics.googleapis.com/v2/reports',
  playlists: 'https://www.googleapis.com/youtube/v3/playlists',
  search: 'https://www.googleapis.com/youtube/v3/search',
};