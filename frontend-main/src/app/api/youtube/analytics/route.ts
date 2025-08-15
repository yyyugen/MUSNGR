import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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

    console.log('Fetching YouTube analytics data...');

    // Get channel statistics first
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('YouTube Channel API error:', {
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
        { error: `Failed to fetch channel statistics: ${channelResponse.statusText}` },
        { status: channelResponse.status }
      );
    }

    const channelData = await channelResponse.json();
    const channelStats = channelData.items?.[0]?.statistics;

    // Get recent videos
    const videosResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=50',
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    let recentVideos = [];
    if (videosResponse.ok) {
      const videosData = await videosResponse.json();
      recentVideos = videosData.items || [];
    }

    // Get detailed video statistics for recent videos
    const videoIds = recentVideos.map((video: any) => video.id.videoId).slice(0, 20).join(',');
    let videoStats = [];
    
    if (videoIds) {
      const videoStatsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (videoStatsResponse.ok) {
        const videoStatsData = await videoStatsResponse.json();
        videoStats = videoStatsData.items || [];
      }
    }

    // Try to get analytics data (may not be available for all accounts)
    let analyticsData = null;
    try {
      // Use current date as end date and exactly 28 days back as start date (YouTube's default)
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      const startDate = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log(`Fetching analytics data from ${startDate} to ${endDate}`);

      const analyticsResponse = await fetch(
        `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,likes,subscribersGained&dimensions=day`,
        {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/json',
          },
        }
      );

      if (analyticsResponse.ok) {
        analyticsData = await analyticsResponse.json();
        console.log('Analytics data retrieved successfully:', {
          hasRows: !!analyticsData.rows,
          rowCount: analyticsData.rows?.length || 0
        });
      } else {
        const errorText = await analyticsResponse.text();
        console.log('Analytics API not available or insufficient permissions:', {
          status: analyticsResponse.status,
          error: errorText
        });
      }
    } catch (error) {
      console.log('Analytics data not available:', error);
    }

    // Calculate engagement rate
    let engagementRate = 0;
    if (channelStats && channelStats.viewCount && channelStats.subscriberCount) {
      const totalLikes = videoStats.reduce((sum: number, video: any) => 
        sum + parseInt(video.statistics?.likeCount || '0'), 0);
      const totalViews = parseInt(channelStats.viewCount);
      engagementRate = totalViews > 0 ? (totalLikes / totalViews) * 100 : 0;
    }

    // Calculate total likes
    const totalLikes = videoStats.reduce((sum: number, video: any) => 
      sum + parseInt(video.statistics?.likeCount || '0'), 0);

    return NextResponse.json({
      success: true,
      channelStats: {
        viewCount: channelStats?.viewCount || '0',
        subscriberCount: channelStats?.subscriberCount || '0',
        videoCount: channelStats?.videoCount || '0',
        totalLikes: totalLikes.toString(),
        engagementRate: engagementRate.toFixed(1)
      },
      recentVideos: videoStats.slice(0, 10).map((video: any) => ({
        id: video.id,
        title: video.snippet?.title || 'Untitled',
        publishedAt: video.snippet?.publishedAt,
        viewCount: video.statistics?.viewCount || '0',
        likeCount: video.statistics?.likeCount || '0',
        commentCount: video.statistics?.commentCount || '0',
        thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url
      })),
      topVideos: videoStats
        .sort((a: any, b: any) => parseInt(b.statistics?.viewCount || '0') - parseInt(a.statistics?.viewCount || '0'))
        .slice(0, 4)
        .map((video: any) => ({
          id: video.id,
          title: video.snippet?.title || 'Untitled',
          viewCount: video.statistics?.viewCount || '0',
          likeCount: video.statistics?.likeCount || '0',
          thumbnail: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url
        })),
      analytics: analyticsData
    });

  } catch (error) {
    console.error('Error fetching YouTube analytics data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
