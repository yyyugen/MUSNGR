"use client";

import { useState } from "react";
import { PrivacyStatus, VideoSize, VideoCategory } from "@/types/video-options";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface OptionsSectionProps {
  isAdvanced?: boolean;
  // Basic options props
  privacy?: PrivacyStatus;
  onPrivacyChange?: (privacy: PrivacyStatus) => void;
  notifySubscribers?: boolean;
  onNotifySubscribersChange?: (value: boolean) => void;
  madeForKids?: boolean;
  onMadeForKidsChange?: (value: boolean) => void;
  embeddable?: boolean;
  onEmbeddableChange?: (value: boolean) => void;
  publicStatsViewable?: boolean;
  onPublicStatsViewableChange?: (value: boolean) => void;
  commentsEnabled?: boolean;
  onCommentsEnabledChange?: (value: boolean) => void;
  includeWatermark?: boolean;
  onIncludeWatermarkChange?: (value: boolean) => void;
  // Advanced options props
  videoSize?: VideoSize;
  onVideoSizeChange?: (size: VideoSize) => void;
  category?: VideoCategory;
  onCategoryChange?: (category: VideoCategory) => void;
  tags?: string[];
  onTagsChange?: (tags: string[]) => void;
  language?: string;
  onLanguageChange?: (language: string) => void;
  // Thumbnail options
  customThumbnail?: File;
  onCustomThumbnailChange?: (file: File | undefined) => void;
}

export function OptionsSection({
  isAdvanced = false,
  // Basic options
  privacy = 'public',
  onPrivacyChange,
  notifySubscribers = false,
  onNotifySubscribersChange,
  madeForKids = false,
  onMadeForKidsChange,
  embeddable = true,
  onEmbeddableChange,
  publicStatsViewable = true,
  onPublicStatsViewableChange,
  commentsEnabled = true,
  onCommentsEnabledChange,
  includeWatermark = false,
  onIncludeWatermarkChange,
  // Advanced options
  videoSize = '1920x1080',
  onVideoSizeChange,
  category = 'music',
  onCategoryChange,
  tags = [],
  onTagsChange,
  language = 'en',
  onLanguageChange,
  // Thumbnail options
  customThumbnail,
  onCustomThumbnailChange,
}: OptionsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState("");

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4">
          <span>{isAdvanced ? "Advanced options" : "Basic options"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {isAdvanced ? (
            <div className="space-y-4">
              <div>
                <Label>Video Size</Label>
                <Select value={videoSize} onValueChange={(value) => onVideoSizeChange?.(value as VideoSize)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select video size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1920x1080">1920×1080 (16:9) - Full HD</SelectItem>
                    <SelectItem value="1280x720">1280×720 (16:9) - HD</SelectItem>
                    <SelectItem value="3840x2160">3840×2160 (16:9) - 4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(value) => onCategoryChange?.(value as VideoCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="music">Music</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="howto">How-to & Style</SelectItem>
                    <SelectItem value="news">News & Politics</SelectItem>
                    <SelectItem value="nonprofit">Nonprofits & Activism</SelectItem>
                    <SelectItem value="people">People & Blogs</SelectItem>
                    <SelectItem value="pets">Pets & Animals</SelectItem>
                    <SelectItem value="science">Science & Technology</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="travel">Travel & Events</SelectItem>
                    <SelectItem value="autos">Autos & Vehicles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Language</Label>
                <Select value={language} onValueChange={(value) => onLanguageChange?.(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newTag.trim() && !tags.includes(newTag.trim())) {
                            onTagsChange?.([...tags, newTag.trim()]);
                            setNewTag('');
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (newTag.trim() && !tags.includes(newTag.trim())) {
                          onTagsChange?.([...tags, newTag.trim()]);
                          setNewTag('');
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => onTagsChange?.(tags.filter((_, i) => i !== index))}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>Custom Thumbnail (Optional)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validate file size (YouTube limit is 2MB)
                      if (file.size > 2 * 1024 * 1024) {
                        alert('Thumbnail file must be under 2MB');
                        return;
                      }
                      onCustomThumbnailChange?.(file);
                      console.log('Thumbnail selected:', file.name);
                    } else {
                      onCustomThumbnailChange?.(undefined);
                    }
                  }}
                  className="mt-1"
                />
                {customThumbnail && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Thumbnail selected: {customThumbnail.name}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 1280x720 pixels, under 2MB
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>License</Label>
                  <Select defaultValue="youtube">
                    <SelectTrigger>
                      <SelectValue placeholder="Select license" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">Standard YouTube License</SelectItem>
                      <SelectItem value="creativeCommon">Creative Commons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recording Date (Optional)</Label>
                  <Input
                    type="date"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Privacy</Label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: 'public', label: 'Public' },
                    { value: 'private', label: 'Private' },
                    { value: 'unlisted', label: 'Unlisted' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={privacy === option.value ? "default" : "outline"}
                      className={
                        privacy === option.value
                          ? "bg-black text-white hover:bg-black/90"
                          : ""
                      }
                      onClick={() => onPrivacyChange?.(option.value as PrivacyStatus)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              {!isAdvanced && (
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                  <p className="font-medium mb-1">🎵 Quick Start:</p>
                  <ul className="text-xs space-y-1">
                    <li>• <strong>Public:</strong> Anyone can search for and view</li>
                    <li>• <strong>Unlisted:</strong> Only people with the link can view</li>
                    <li>• <strong>Private:</strong> Only you can view</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifySubscribers}
                onCheckedChange={(checked) =>
                  onNotifySubscribersChange?.(checked as boolean)
                }
              />
              <label htmlFor="notify" className="text-sm">
                Notify subscribers about this upload
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="kids"
                checked={madeForKids}
                onCheckedChange={(checked) =>
                  onMadeForKidsChange?.(checked as boolean)
                }
              />
              <label htmlFor="kids" className="text-sm">
                Made For Kids?
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="embeddable"
                checked={embeddable}
                onCheckedChange={(checked) =>
                  onEmbeddableChange?.(checked as boolean)
                }
              />
              <label htmlFor="embeddable" className="text-sm">
                Allow embedding
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="public-stats"
                checked={publicStatsViewable}
                onCheckedChange={(checked) =>
                  onPublicStatsViewableChange?.(checked as boolean)
                }
              />
              <label htmlFor="public-stats" className="text-sm">
                Publish to subscriptions feed and notify subscribers
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comments"
                checked={commentsEnabled}
                onCheckedChange={(checked) =>
                  onCommentsEnabledChange?.(checked as boolean)
                }
              />
              <label htmlFor="comments" className="text-sm">
                Allow comments
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="watermark"
                checked={includeWatermark}
                onCheckedChange={(checked) =>
                  onIncludeWatermarkChange?.(checked as boolean)
                }
              />
              <label htmlFor="watermark" className="text-sm">
                Include Musngr watermark
              </label>
            </div>
          </div>

          {isAdvanced && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Pro Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Use relevant tags to help people discover your video</li>
                <li>• Choose the right category for better recommendations</li>
                <li>• Custom thumbnails can increase click-through rates</li>
                <li>• Consider your audience when setting privacy options</li>
              </ul>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
