import { YOUTUBE_API_CONFIG, YOUTUBE_API_ENDPOINTS } from '@/config/youtube';

interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  privacyStatus: 'private' | 'unlisted' | 'public';
}

export class YouTubeService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async uploadVideo(videoFile: File, metadata: VideoMetadata) {
    try {
      // First, create the video metadata
      const videoMetadata = {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
        },
        status: {
          privacyStatus: metadata.privacyStatus,
        },
      };

      // Create form data for the upload
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(videoMetadata)], { type: 'application/json' }));
      formData.append('video', videoFile);

      // Upload the video
      const response = await fetch(`${YOUTUBE_API_ENDPOINTS.upload}?part=snippet,status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload video');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  async getChannelInfo() {
    try {
      const response = await fetch(`${YOUTUBE_API_ENDPOINTS.channels}?part=snippet&mine=true`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get channel info');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting channel info:', error);
      throw error;
    }
  }
} 