import { NextRequest, NextResponse } from 'next/server';
import { getYouTubeCategoryId } from '@/types/video-options';

// Note: This API route handles the YouTube upload part.
// The video creation happens on the client-side using the VideoCreator class.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const videoFile = formData.get('video') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const accessToken = formData.get('accessToken') as string;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const optionsString = formData.get('options') as string;

    // Parse options with defaults
    let options;
    try {
      options = optionsString ? JSON.parse(optionsString) : {};
    } catch (error) {
      console.error('Error parsing options:', error);
      options = {};
    }

    // Debug logging
    console.log('Upload request received:', {
      hasVideo: !!videoFile,
      videoSize: videoFile?.size,
      title: title,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      hasThumbnail: !!thumbnailFile,
      thumbnailSize: thumbnailFile?.size
    });

    // Validate required fields
    if (!videoFile || !title || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: video, title, or access token' },
        { status: 400 }
      );
    }

    // Upload to YouTube with options
    const youtubeResponse = await uploadToYouTube(videoFile, {
      title,
      description: description || 'Created with Musngr',
      tags: options.tags || ['music', 'audio', 'musngr'],
      privacyStatus: options.privacy || 'public',
      categoryId: getYouTubeCategoryId(options.category || 'music'),
      madeForKids: options.madeForKids || false,
      embeddable: options.embeddable !== false,
      publicStatsViewable: options.publicStatsViewable !== false,
      commentsEnabled: options.commentsEnabled !== false,
      language: options.language || 'en'
    }, accessToken, thumbnailFile);

    return NextResponse.json({
      success: true,
      url: `https://www.youtube.com/watch?v=${youtubeResponse.id}`,
      videoId: youtubeResponse.id
    });

  } catch (error) {
    console.error('Error uploading video:', error);

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Determine the appropriate status code and error type
    let statusCode = 500;
    let errorType = 'upload_error';

    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      statusCode = 401;
      errorType = 'auth_error';
    } else if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      statusCode = 403;
      errorType = 'permission_error';
    } else if (errorMessage.includes('quota')) {
      statusCode = 429;
      errorType = 'quota_error';
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload video to YouTube',
        details: errorMessage,
        errorType: errorType,
        debug: error
      },
      { status: statusCode }
    );
  }
}

// Video creation now happens on the client-side

async function uploadToYouTube(
  videoFile: File,
  metadata: {
    title: string;
    description: string;
    tags: string[];
    privacyStatus: string;
    categoryId: string;
    madeForKids: boolean;
    embeddable: boolean;
    publicStatsViewable: boolean;
    commentsEnabled: boolean;
    language: string;
  },
  accessToken: string,
  thumbnailFile?: File | null
) {
  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      categoryId: metadata.categoryId,
      defaultLanguage: metadata.language,
      defaultAudioLanguage: metadata.language
    },
    status: {
      privacyStatus: metadata.privacyStatus,
      selfDeclaredMadeForKids: metadata.madeForKids,
      embeddable: metadata.embeddable,
      publicStatsViewable: metadata.publicStatsViewable
    },
  };

  // Create form data for YouTube upload
  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(videoMetadata)], { type: 'application/json' }));
  formData.append('video', videoFile);

  const response = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YouTube upload failed:', {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText,
      headers: Object.fromEntries(response.headers.entries())
    });
    throw new Error(`YouTube upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const videoData = await response.json();

  // Upload custom thumbnail if provided
  if (thumbnailFile && videoData.id) {
    try {
      await uploadThumbnailToYouTube(videoData.id, thumbnailFile, accessToken);
      console.log('Thumbnail uploaded successfully for video:', videoData.id);
    } catch (error) {
      console.error('Failed to upload thumbnail:', error);
      // Don't fail the entire upload if thumbnail fails
    }
  }

  return videoData;
}

async function uploadThumbnailToYouTube(
  videoId: string,
  thumbnailFile: File,
  accessToken: string
) {
  const formData = new FormData();
  formData.append('media', thumbnailFile);

  const response = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Thumbnail upload failed:', {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText,
    });
    throw new Error(`Thumbnail upload failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}
