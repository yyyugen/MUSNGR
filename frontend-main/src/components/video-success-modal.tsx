'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink, Share2, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VideoSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle: string;
  videoId: string;
}

export function VideoSuccessModal({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
  videoId,
}: VideoSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      toast.success('Video link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const shareVideo = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: `Check out my video: ${videoTitle}`,
          url: videoUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const openVideo = () => {
    window.open(videoUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out my video: ${videoTitle}`);
    const body = encodeURIComponent(
      `Hi!\n\nI just created a video using Musngr and wanted to share it with you:\n\n${videoTitle}\n${videoUrl}\n\nEnjoy!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <DialogTitle>Video Upload Successful! 🎉</DialogTitle>
          </div>
          <DialogDescription>
            Your video has been successfully uploaded to YouTube. Share it with the world!
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="video-title" className="text-sm font-medium">
              Video Title
            </Label>
            <Input
              id="video-title"
              value={videoTitle}
              readOnly
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="video-url" className="text-sm font-medium">
              Video Link
            </Label>
            <div className="flex mt-1">
              <Input
                id="video-url"
                value={videoUrl}
                readOnly
                className="rounded-r-none"
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-l-none border-l-0"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={openVideo} className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Watch Video
            </Button>
            <Button onClick={shareVideo} variant="outline" className="w-full">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Button onClick={shareViaEmail} variant="outline" className="w-full">
            <Mail className="h-4 w-4 mr-2" />
            Share via Email
          </Button>
          
          <div className="text-sm text-muted-foreground text-center pt-2 border-t">
            <p>📧 We've also sent you an email with the video link!</p>
            <p className="text-xs mt-1">Video ID: {videoId}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
