import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Overview } from "../analytics/(components)/overview";
import { TopVideos } from "../analytics/(components)/top-videos";
import { StatsCards } from "../analytics/(components)/stats-cards";
import { RecentUploads } from "../analytics/(components)/recent-uploads";
import { YouTubeAccount } from "../analytics/(components)/youtube-account";

export default function Dashboard() {
  return (
    <section className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
      </div>

      {/* YouTube Account Settings */}
      <YouTubeAccount />

      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your video performance over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Videos</CardTitle>
            <CardDescription>Your most viewed videos</CardDescription>
          </CardHeader>
          <CardContent>
            <TopVideos />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>A list of your recent video uploads</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentUploads />
        </CardContent>
      </Card>
    </section>
  );
}
