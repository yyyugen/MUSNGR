"use client";

import { useEffect, useState } from "react";
import { Activity, Eye, ThumbsUp, Upload, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface YouTubeStats {
  viewCount: string;
  subscriberCount: string;
  videoCount: string;
  totalLikes: string;
  engagementRate: string;
}

export function StatsCards() {
  const [stats, setStats] = useState<YouTubeStats | null>(null);
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

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/youtube/analytics');
      const data = await response.json();

      if (!response.ok) {
        if (data.needsReauth) {
          setError("Please re-authenticate to view YouTube analytics");
        } else {
          throw new Error(data.error || 'Failed to fetch analytics data');
        }
        return;
      }

      setStats(data.channelStats);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid gap-4 grid-cols-1">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchStats}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const statsData = [
    {
      name: "Total Views",
      value: formatNumber(stats?.viewCount || '0'),
      icon: Eye,
      description: "lifetime views",
    },
    {
      name: "Total Uploads",
      value: formatNumber(stats?.videoCount || '0'),
      icon: Upload,
      description: "videos published",
    },
    {
      name: "Engagement Rate",
      value: `${stats?.engagementRate || '0'}%`,
      icon: Activity,
      description: "likes per view",
    },
    {
      name: "Total Likes",
      value: formatNumber(stats?.totalLikes || '0'),
      icon: ThumbsUp,
      description: "across all videos",
    },
  ];

  return (
    <section className="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold sm:text-2xl text-gray-900 dark:text-white">{stat.value}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
