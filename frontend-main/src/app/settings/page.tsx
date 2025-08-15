"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  getNotificationPreferences,
  setNotificationPreferences,
  NotificationPreferences
} from "@/lib/notification-preferences";

import {
  Bell,
  CreditCard,
  Globe,
  Headphones,
  Music,
  Palette,
  Share2,
  Shield,
  Sliders,
  User,
  Video,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("account");
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    setNotificationPrefs(getNotificationPreferences());
  }, []);

  const updateNotificationPref = (key: keyof NotificationPreferences, value: boolean) => {
    if (!notificationPrefs) return;

    const updated = { ...notificationPrefs, [key]: value };
    setNotificationPrefs(updated);
    setNotificationPreferences({ [key]: value });
  };

  const settingsTabs = [
    { id: "account", label: "Account", icon: User },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "audio", label: "Audio", icon: Headphones },
    { id: "video", label: "Video", icon: Video },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "advanced", label: "Advanced", icon: Sliders },
  ];

  return (
    <div className="mx-auto py-10 flex gap-6">
      {/* Settings Sidebar */}
      <aside className="md:w-64 hidden md:block">
        <nav className="space-y-2">
          {settingsTabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="mr-2 h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="md:hidden">
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="w-full h-full" />
                <span className="sr-only">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details and public profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/avatars/01.png" alt="@username" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <Button>Change Avatar</Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="musiclover123" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue="Anna Musician" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="anna@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your privacy and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Visibility</Label>
                  <Select defaultValue="public">
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="activity-status">Show Activity Status</Label>
                  <Switch id="activity-status" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="search-visibility">
                    Appear in Search Results
                  </Label>
                  <Switch id="search-visibility" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-video-uploads">Video Upload Completion</Label>
                      <Switch
                        id="email-video-uploads"
                        checked={notificationPrefs?.emailVideoUploads ?? true}
                        onCheckedChange={(checked) => updateNotificationPref('emailVideoUploads', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-new-followers">New Followers</Label>
                      <Switch
                        id="email-new-followers"
                        checked={notificationPrefs?.emailNewFollowers ?? false}
                        onCheckedChange={(checked) => updateNotificationPref('emailNewFollowers', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-new-likes">New Likes</Label>
                      <Switch
                        id="email-new-likes"
                        checked={notificationPrefs?.emailNewLikes ?? false}
                        onCheckedChange={(checked) => updateNotificationPref('emailNewLikes', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-new-comments">New Comments</Label>
                      <Switch
                        id="email-new-comments"
                        checked={notificationPrefs?.emailNewComments ?? false}
                        onCheckedChange={(checked) => updateNotificationPref('emailNewComments', checked)}
                      />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Push Notifications</Label>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-new-messages">New Messages</Label>
                      <Switch id="push-new-messages" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-mentions">Mentions</Label>
                      <Switch id="push-mentions" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-event-reminders">
                        Event Reminders
                      </Label>
                      <Switch id="push-event-reminders" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of your Musngr experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <RadioGroup defaultValue="system">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system">System</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Slider defaultValue={[16]} max={24} min={12} step={1} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-motion">Reduce Motion</Label>
                  <Switch id="reduce-motion" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language and Region</CardTitle>
                <CardDescription>
                  Set your preferred language and regional settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select defaultValue="us">
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time (ET)</SelectItem>
                      <SelectItem value="cst">Central Time (CT)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                      <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Customize your audio playback and recording preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Playback Quality</Label>
                  <Select defaultValue="high">
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (96 kbps)</SelectItem>
                      <SelectItem value="medium">Medium (192 kbps)</SelectItem>
                      <SelectItem value="high">High (320 kbps)</SelectItem>
                      <SelectItem value="lossless">Lossless (FLAC)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Volume Normalization</Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="volume-normalization" />
                    <Label htmlFor="volume-normalization">Enable</Label>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Microphone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">System Default</SelectItem>
                      <SelectItem value="mic1">External Microphone</SelectItem>
                      <SelectItem value="mic2">Headset Microphone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Input Gain</Label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
                <CardDescription>
                  Adjust your video streaming and recording preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Video Quality</Label>
                  <Select defaultValue="1080p">
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="1440p">1440p QHD</SelectItem>
                      <SelectItem value="2160p">2160p 4K UHD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frame Rate</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frame rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="60">60 FPS</SelectItem>
                      <SelectItem value="120">120 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Camera</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">System Default</SelectItem>
                      <SelectItem value="cam1">External Webcam</SelectItem>
                      <SelectItem value="cam2">Built-in Camera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-enhance">Auto Enhance Video</Label>
                  <Switch id="auto-enhance" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>
                  Connect your Musngr account with other services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Music className="h-8 w-8" />
                    <div>
                      <p className="font-medium">Spotify</p>
                      <p className="text-sm text-muted-foreground">
                        Share your listening activity
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Video className="h-8 w-8" />
                    <div>
                      <p className="font-medium">YouTube</p>
                      <p className="text-sm text-muted-foreground">
                        Sync your uploads and playlists
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Share2 className="h-8 w-8" />
                    <div>
                      <p className="font-medium">Social Media</p>
                      <p className="text-sm text-muted-foreground">
                        Share your content across platforms
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and payment details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Current Plan</h3>
                  <p className="text-sm">Free Tier</p>
                  <Button>Upgrade to Pro</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Payment Method</h3>
                  <p className="text-sm">No payment method on file</p>
                  <Button variant="outline">Add Payment Method</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Billing History</h3>
                  <p className="text-sm text-muted-foreground">
                    You have no billing history
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced options for your Musngr account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Data Usage</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue placeholder="Select data usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic</SelectItem>
                      <SelectItem value="low">Low Data Usage</SelectItem>
                      <SelectItem value="high">
                        High Quality (More Data)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="beta-features">Enable Beta Features</Label>
                  <Switch id="beta-features" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your Musngr data
                  </p>
                  <Button variant="outline">Request Data Export</Button>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your Musngr account and all associated
                    data
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
