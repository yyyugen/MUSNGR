import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log('Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      hasError: !!session?.error,
      error: session?.error
    });

    if (!session) {
      return NextResponse.json(
        { error: 'No session found. Please sign in.' },
        { status: 401 }
      );
    }

    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        {
          error: 'Authentication expired. Please sign out and sign in again.',
          needsReauth: true
        },
        { status: 401 }
      );
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { error: 'No access token found. Please sign out and sign in again.' },
        { status: 401 }
      );
    }

    console.log('Fetching YouTube channel data...');

    // Get channel information
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const channelUrl = apiKey
      ? `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,status&mine=true&key=${apiKey}`
      : 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings,status&mine=true';

    console.log('Making request to:', channelUrl.replace(apiKey || '', '[API_KEY]'));

    const channelResponse = await fetch(channelUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('YouTube API error:', {
        status: channelResponse.status,
        statusText: channelResponse.statusText,
        errorText: errorText,
      });

      if (channelResponse.status === 401) {
        return NextResponse.json(
          {
            error: 'YouTube authentication failed. Please sign out and sign in again.',
            needsReauth: true
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: `Failed to fetch channel information: ${channelResponse.statusText}` },
        { status: channelResponse.status }
      );
    }

    const channelData = await channelResponse.json();
    console.log('Channel data received:', {
      itemsCount: channelData.items?.length || 0,
      hasItems: !!channelData.items?.length
    });

    // Get channel analytics (if available)
    let analyticsData = null;
    try {
      const analyticsResponse = await fetch(
        'https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=2023-01-01&endDate=2024-12-31&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (analyticsResponse.ok) {
        analyticsData = await analyticsResponse.json();
      }
    } catch (error) {
      console.log('Analytics data not available:', error);
    }

    return NextResponse.json({
      success: true,
      channel: channelData,
      analytics: analyticsData,
    });

  } catch (error) {
    console.error('Error fetching YouTube channel data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
