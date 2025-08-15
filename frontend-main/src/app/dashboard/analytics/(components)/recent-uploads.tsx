"use client";

import { useEffect, useState } from "react";
import { Eye, MoreVertical, ThumbsUp, ExternalLink, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface RecentVideo {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  thumbnail: string;
}

export function RecentUploads() {
  const [videos, setVideos] = useState<RecentVideo[]>([]);
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const fetchRecentVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/youtube/analytics');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch recent videos');
      }

      setVideos(data.recentVideos || []);
    } catch (err) {
      console.error('Error fetching recent videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recent videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentVideos();
  }, []);

  if (loading) {
    return (
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Upload Date</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead className="hidden sm:table-cell">Comments</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRecentVideos} variant="outline">
          Retry
        </Button>
      </section>
    );
  }

  if (videos.length === 0) {
    return (
      <section className="text-center py-8">
        <p className="text-muted-foreground">No recent videos found. Upload some videos to see them here!</p>
      </section>
    );
  }

  return (
    <section>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Upload Date</TableHead>
            <TableHead>Views</TableHead>
            <TableHead>Likes</TableHead>
            <TableHead className="hidden sm:table-cell">Comments</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow key={video.id}>
              <TableCell className="font-medium max-w-xs">
                <div className="truncate" title={video.title}>
                  {video.title}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDate(video.publishedAt)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{formatNumber(video.viewCount)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-medium">{formatNumber(video.likeCount)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="text-sm">
                  <span className="text-gray-900 dark:text-white font-medium">{formatNumber(video.commentCount)}</span>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on YouTube
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://studio.youtube.com/video/${video.id}/analytics`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View analytics
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a
                        href={`https://studio.youtube.com/video/${video.id}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Edit details
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
