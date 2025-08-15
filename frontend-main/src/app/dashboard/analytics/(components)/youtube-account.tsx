"use client";

import { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Eye, 
  Clock, 
  Video, 
  ExternalLink, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface YouTubeChannelData {
  channel: {
    items: Array<{
      id: string;
      snippet: {
        title: string;
        description: string;
        thumbnails: {
          default: { url: string };
          medium: { url: string };
          high: { url: string };
        };
        country?: string;
        publishedAt: string;
      };
      statistics: {
        viewCount: string;
        subscriberCount: string;
        videoCount: string;
      };
      brandingSettings?: {
        channel?: {
          title: string;
          description: string;
          keywords?: string;
        };
      };
      status: {
        privacyStatus: string;
        isLinked: boolean;
        longUploadsStatus: string;
      };
    }>;
  };
  analytics?: any;
}

export function YouTubeAccount() {
  const { data: session } = useSession();
  const [channelData, setChannelData] = useState<YouTubeChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsReauth, setNeedsReauth] = useState(false);

  const fetchChannelData = async () => {
    if (!session) {
      setError("Please sign in to view YouTube channel data");
      setLoading(false);
      return;
    }

    if (session.error === "RefreshAccessTokenError") {
      setError("Authentication expired. Please sign out and sign in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/youtube/channel');
      const data = await response.json();

      if (!response.ok) {
        if (data.needsReauth) {
          setError("Authentication expired. Please sign out and sign in again to refresh your YouTube permissions.");
          setNeedsReauth(true);
          toast.error('YouTube authentication expired. Please sign in again.');
        } else {
          throw new Error(data.error || 'Failed to fetch channel data');
        }
        return;
      }

      setChannelData(data);
      toast.success('YouTube channel data loaded successfully');
    } catch (err) {
      console.error('Error fetching channel data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load channel data');
      toast.error('Failed to load YouTube channel data');
    } finally {
      setLoading(false);
    }
  };

  const handleReAuthenticate = async () => {
    try {
      await signOut({ redirect: false });
      toast.info("Signed out. Please sign in again to refresh your YouTube permissions.");
      await signIn('google');
    } catch (error) {
      console.error('Re-authentication error:', error);
      toast.error('Failed to re-authenticate. Please try again.');
    }
  };

  useEffect(() => {
    fetchChannelData();
  }, [session]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading YouTube Account...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            YouTube Account Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2">
            {needsReauth ? (
              <Button onClick={handleReAuthenticate} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sign Out & Re-authenticate
              </Button>
            ) : (
              <Button onClick={fetchChannelData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!channelData?.channel?.items?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-600">
            <AlertCircle className="h-5 w-5" />
            No YouTube Channel Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No YouTube channel is associated with your account. You may need to create a channel first.
          </p>
          <Button asChild>
            <a href="https://www.youtube.com/create_channel" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Create YouTube Channel
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const channel = channelData.channel.items[0];
  const stats = channel.statistics;

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-red-100 text-red-800';
      case 'unlisted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          YouTube Account Settings
        </CardTitle>
        <CardDescription>
          Your connected YouTube channel information and settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Profile */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium?.url} 
              alt={channel.snippet.title} 
            />
            <AvatarFallback>{channel.snippet.title.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{channel.snippet.title}</h3>
              <Badge className={getStatusColor(channel.status.privacyStatus)}>
                {channel.status.privacyStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {channel.snippet.description || "No channel description"}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Channel ID: {channel.id}</span>
              {channel.snippet.country && (
                <span>Country: {channel.snippet.country}</span>
              )}
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <a 
              href={`https://www.youtube.com/channel/${channel.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Channel
            </a>
          </Button>
        </div>

        <Separator />

        {/* Channel Statistics */}
        <div>
          <h4 className="font-medium mb-3">Channel Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subscribers</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(stats.subscriberCount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Eye className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(stats.viewCount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Video className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(stats.videoCount)}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Channel Status */}
        <div>
          <h4 className="font-medium mb-3">Channel Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Channel Linked</span>
              <Badge variant={channel.status.isLinked ? "default" : "destructive"}>
                {channel.status.isLinked ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Long Uploads</span>
              <Badge variant={channel.status.longUploadsStatus === "allowed" ? "default" : "secondary"}>
                {channel.status.longUploadsStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Privacy Status</span>
              <Badge className={getStatusColor(channel.status.privacyStatus)}>
                {channel.status.privacyStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={fetchChannelData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button asChild variant="outline" size="sm">
            <a 
              href="https://studio.youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              YouTube Studio
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
