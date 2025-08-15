"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { YouTubeService } from "@/services/youtube";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { VideoCreator } from "@/lib/video-creator";
import { DropZone } from "./upload/(components)/drop-zone";
import { OptionsSection } from "./upload/(components)/options-section";
import { BackgroundOptions } from "./upload/(components)/background-options";
import { useVideoOptions } from "@/hooks/use-video-options";
import { ID3Extractor } from "@/lib/id3-extractor";


export default function Dashboard() {
  const { data: session, status } = useSession();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [generatedBackgroundImage, setGeneratedBackgroundImage] = useState<Blob | null>(null);
  const [authError, setAuthError] = useState<boolean>(false);

  // Video options management
  const videoOptions = useVideoOptions();

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl mb-4">Sign in to upload to YouTube</h2>
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const handleReAuthenticate = async () => {
    try {
      await signOut({ redirect: false });
      setAuthError(false);
      toast.info("Signed out. Please sign in again to refresh your YouTube permissions.");
      await signIn('google');
    } catch (error) {
      console.error('Re-authentication error:', error);
      toast.error('Failed to re-authenticate. Please try again.');
    }
  };

  const handleFileSelect = async (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      if (file.type.startsWith("audio/")) {
        setAudioFile(file);

        // Auto-suggest title and description from ID3 tags
        if (!title) {
          try {
            const suggestedTitle = await ID3Extractor.generateSuggestedTitle(file);
            setTitle(suggestedTitle);
          } catch (error) {
            console.error('Error generating suggested title:', error);
          }
        }

        if (!description) {
          try {
            const suggestedDescription = await ID3Extractor.generateSuggestedDescription(file);
            setDescription(suggestedDescription);
          } catch (error) {
            console.error('Error generating suggested description:', error);
          }
        }
      } else if (file.type.startsWith("image/")) {
        setImageFile(file);
      }
    });
  };

  const handleCreateVideo = async () => {
    if (!audioFile) {
      toast.error("Please upload an audio file");
      return;
    }

    if (!imageFile && !generatedBackgroundImage) {
      toast.error("Please upload an image file or generate a background image");
      return;
    }

    if (!session?.accessToken) {
      toast.error("Please sign in to upload to YouTube");
      return;
    }

    // Check if there's a refresh token error
    if (session.error === "RefreshAccessTokenError") {
      setAuthError(true);
      toast.error("Your session has expired. Please sign out and sign back in.");
      return;
    }

    setIsUploading(true);
    setVideoProgress(0);

    try {
      // Step 1: Create video on client-side
      toast.info("Creating video from audio and image...");
      const videoCreator = new VideoCreator();

      // Use either uploaded image or generated background
      const imageToUse = imageFile || (generatedBackgroundImage ? new File([generatedBackgroundImage], 'background.png', { type: 'image/png' }) : null);

      if (!imageToUse) {
        throw new Error("No image available for video creation");
      }

      const videoBlob = await videoCreator.createVideoFromAudioAndImage(
        audioFile,
        imageToUse,
        (progress) => {
          setVideoProgress(progress * 50); // First 50% for video creation
        }
      );

      // Step 2: Upload to YouTube
      toast.info("Uploading video to YouTube...");
      setVideoProgress(50);

      const formData = new FormData();
      formData.append('video', videoBlob, 'video.webm');
      formData.append('title', title || 'Untitled Video');
      formData.append('description', description);
      formData.append('accessToken', session.accessToken as string);

      // Add custom thumbnail if provided
      if (videoOptions.options.advanced.customThumbnail) {
        formData.append('thumbnail', videoOptions.options.advanced.customThumbnail);
      }

      // Add video options
      const options = videoOptions.getFormattedOptions();
      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/create-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        setVideoProgress(100);
        toast.success("Video uploaded to YouTube! 🎉");
        setAuthError(false); // Clear any previous auth errors

        // Store the video URL to display on the page
        setUploadedVideoUrl(data.url);
      } else {
        console.error('YouTube upload error details:', data);

        // Handle specific error types with user-friendly messages
        if (data.error && data.error.includes('401') || data.error && data.error.includes('Unauthorized')) {
          setAuthError(true);
          throw new Error('YouTube authentication expired. Please sign out and sign back in to refresh your permissions.');
        } else if (data.error && data.error.includes('403')) {
          throw new Error('YouTube upload permission denied. Please check your YouTube channel permissions.');
        } else if (data.error && data.error.includes('quota')) {
          throw new Error('YouTube API quota exceeded. Please try again later.');
        } else {
          const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error || 'Unknown error';
          throw new Error(`YouTube upload failed: ${errorMsg}`);
        }
      }

      // Cleanup
      videoCreator.cleanup();

    } catch (error) {
      console.error('Video creation/upload error:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create and upload video to YouTube";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setVideoProgress(0);
    }
  };



  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Upload Files</h1>



        {/* Authentication Error Alert */}
        {authError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800 mb-1">YouTube Authentication Expired</h3>
                <p className="text-sm text-red-700 mb-3">
                  Your YouTube access token has expired. Please sign out and sign back in to refresh your permissions.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleReAuthenticate}
                variant="destructive"
                size="sm"
              >
                Sign Out & Re-authenticate
              </Button>
              <Button
                onClick={() => setAuthError(false)}
                variant="outline"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          1. Select an Audio File (up to 25 MB)
          <br />
          2. Select an Image (1920x1080px will be full screen)
        </p>
        <DropZone
          onFileSelect={handleFileSelect}
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          maxFiles={2}
          maxSize={25}
        />
        <div className="mt-4 space-y-2">
          {audioFile && (
            <div className="p-2 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">✅ Audio: {audioFile.name}</p>
            </div>
          )}
          {imageFile && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">✅ Image: {imageFile.name}</p>
            </div>
          )}
          {!audioFile && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">❌ No audio file uploaded</p>
            </div>
          )}
          {!imageFile && !generatedBackgroundImage && (
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm text-gray-600">❌ No image file uploaded or background generated</p>
            </div>
          )}
          {generatedBackgroundImage && (
            <div className="p-2 bg-purple-50 border border-purple-200 rounded">
              <p className="text-sm text-purple-800">✅ Background image generated and ready!</p>
            </div>
          )}
        </div>
        <div className="grid lg:grid-cols-2 gap-4 mt-8">
          <div>
            <BackgroundOptions
              backgroundText={videoOptions.options.background.text}
              onBackgroundTextChange={videoOptions.updateBackgroundText}
              audioFile={audioFile}
              onBackgroundImageGenerated={setGeneratedBackgroundImage}
            />
          </div>
          <div className="space-y-4">
            <OptionsSection
              privacy={videoOptions.options.basic.privacy}
              onPrivacyChange={videoOptions.updatePrivacy}
              notifySubscribers={videoOptions.options.basic.notifySubscribers}
              onNotifySubscribersChange={(value) => videoOptions.updateBasicOption('notifySubscribers', value)}
              madeForKids={videoOptions.options.basic.madeForKids}
              onMadeForKidsChange={(value) => videoOptions.updateBasicOption('madeForKids', value)}
              embeddable={videoOptions.options.basic.embeddable}
              onEmbeddableChange={(value) => videoOptions.updateBasicOption('embeddable', value)}
              publicStatsViewable={videoOptions.options.basic.publicStatsViewable}
              onPublicStatsViewableChange={(value) => videoOptions.updateBasicOption('publicStatsViewable', value)}
              commentsEnabled={videoOptions.options.basic.commentsEnabled}
              onCommentsEnabledChange={(value) => videoOptions.updateBasicOption('commentsEnabled', value)}
              includeWatermark={videoOptions.options.basic.includeWatermark}
              onIncludeWatermarkChange={(value) => videoOptions.updateBasicOption('includeWatermark', value)}
            />
            <OptionsSection
              isAdvanced
              videoSize={videoOptions.options.advanced.videoSize}
              onVideoSizeChange={videoOptions.updateVideoSize}
              category={videoOptions.options.advanced.category}
              onCategoryChange={videoOptions.updateCategory}
              customThumbnail={videoOptions.options.advanced.customThumbnail}
              onCustomThumbnailChange={videoOptions.updateCustomThumbnail}
              tags={videoOptions.options.advanced.tags}
              onTagsChange={videoOptions.updateTags}
              language={videoOptions.options.advanced.language}
              onLanguageChange={(value) => videoOptions.updateAdvancedOption('language', value)}
            />

            {/* Progress indicator */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {videoProgress < 50 ? "Creating video..." : "Uploading to YouTube..."}
                  </span>
                  <span>{Math.round(videoProgress)}%</span>
                </div>
                <Progress value={videoProgress} className="w-full" />
              </div>
            )}

            <Button
              onClick={handleCreateVideo}
              disabled={isUploading || !audioFile || (!imageFile && !generatedBackgroundImage)}
              className="w-full"
            >
              {isUploading ? "Processing..." : "Create & Upload Video"}
            </Button>

            {/* Display Video URL after successful upload */}
            {uploadedVideoUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 Video Uploaded Successfully!
                </h3>
                <p className="text-sm text-green-700 mb-3">
                  Your video has been uploaded to YouTube. Here's the link:
                </p>
                <div className="mb-3">
                  <a
                    href={uploadedVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-gray-700 underline break-all text-sm font-medium"
                  >
                    {uploadedVideoUrl}
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uploadedVideoUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-green-300 rounded bg-white text-sm"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedVideoUrl);
                      toast.success("Link copied to clipboard!");
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={() => window.open(uploadedVideoUrl, '_blank')}
                    size="sm"
                  >
                    Watch
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
