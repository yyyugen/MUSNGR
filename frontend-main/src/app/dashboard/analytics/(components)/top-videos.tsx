"use client";

import { useEffect, useState } from "react";
import { Eye, ThumbsUp, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TopVideo {
  id: string;
  title: string;
  viewCount: string;
  likeCount: string;
  thumbnail: string;
}

export function TopVideos() {
  const [videos, setVideos] = useState<TopVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatNumber = (num: string) => {
    const number = parseInt(num);
    if (isNaN(number)) return '0';
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toLocaleString();
  };

  const fetchTopVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/youtube/analytics');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch top videos');
      }

      setVideos(data.topVideos || []);
    } catch (err) {
      console.error('Error fetching top videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load top videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopVideos();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-2">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2">
              <div className="aspect-video w-full sm:w-[120px] rounded-lg bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="flex items-center gap-4">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-4">
        <Card className="p-4">
          <CardContent className="text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="space-y-4">
        <Card className="p-4">
          <CardContent className="text-center">
            <p className="text-muted-foreground">No videos found. Upload some videos to see your top performers!</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {videos.map((video) => (
        <Card key={video.id} className="p-2 hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2">
            <div className="relative group">
              <img
                src={video.thumbnail || "/images/block/placeholder-video.svg?height=80&width=120"}
                alt={video.title}
                className="aspect-video w-full sm:w-[120px] rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/block/placeholder-video.svg?height=80&width=120";
                }}
              />
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg"
              >
                <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-medium leading-none line-clamp-2">{video.title}</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-gray-900 dark:text-white font-medium">{formatNumber(video.viewCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-gray-900 dark:text-white font-medium">{formatNumber(video.likeCount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
