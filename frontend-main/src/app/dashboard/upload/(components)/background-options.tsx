"use client";

import { useState, useEffect } from "react";
import { BackgroundImageGenerator } from "@/lib/background-generator";
import { ID3Extractor } from "@/lib/id3-extractor";
import { BackgroundStyle, FontFamily, FontSize, TextAlignment } from "@/types/video-options";

import { ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface BackgroundOptionsProps {
  backgroundText: string;
  onBackgroundTextChange: (value: string) => void;
  audioFile?: File | null;
  onBackgroundImageGenerated?: (imageBlob: Blob) => void;
}

export function BackgroundOptions({
  backgroundText,
  onBackgroundTextChange,
  audioFile,
  onBackgroundImageGenerated,
}: BackgroundOptionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [backgroundType, setBackgroundType] = useState("none");
  const [backgroundSettings, setBackgroundSettings] = useState({
    background: "white-black" as BackgroundStyle,
    font: "segoe" as FontFamily,
    fontSize: "18" as FontSize,
    alignment: "bottom" as TextAlignment,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [id3Image, setId3Image] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generator] = useState(() => new BackgroundImageGenerator());

  // Extract ID3 image when audio file changes
  useEffect(() => {
    if (audioFile && backgroundType === "id3") {
      extractID3Image();
    }
  }, [audioFile, backgroundType]);

  // Generate preview when settings change
  useEffect(() => {
    if (backgroundType === "create" && backgroundText.trim()) {
      generatePreview();
    }
  }, [backgroundText, backgroundSettings, backgroundType]);

  const extractID3Image = async () => {
    if (!audioFile) return;

    try {
      const imageUrl = await ID3Extractor.extractAlbumArtwork(audioFile);
      setId3Image(imageUrl);

      if (imageUrl) {
        // Convert the image URL to a blob for the video creation process
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        onBackgroundImageGenerated?.(blob);
      }
    } catch (error) {
      console.error('Error extracting ID3 image:', error);
      setId3Image(null);
    }
  };

  const generatePreview = async () => {
    if (!backgroundText.trim()) {
      setPreviewImage(null);
      return;
    }

    try {
      const dataUrl = await generator.getPreviewDataUrl({
        text: backgroundText,
        style: backgroundSettings.background,
        font: backgroundSettings.font,
        fontSize: backgroundSettings.fontSize,
        alignment: backgroundSettings.alignment,
        width: 1920,
        height: 1080
      });
      setPreviewImage(dataUrl);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const generateBackgroundImage = async () => {
    if (!backgroundText.trim()) return;

    setIsGenerating(true);
    try {
      const blob = await generator.generateBackground({
        text: backgroundText,
        style: backgroundSettings.background,
        font: backgroundSettings.font,
        fontSize: backgroundSettings.fontSize,
        alignment: backgroundSettings.alignment,
        width: 1920,
        height: 1080
      });

      onBackgroundImageGenerated?.(blob);

      // Show success message or update UI
      console.log('Background image generated successfully');
    } catch (error) {
      console.error('Error generating background image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4">
          <span>
            {backgroundType === "none"
              ? "No background image"
              : backgroundType === "create"
              ? "Create background image"
              : "Image from ID3 tag"}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer"
              onClick={() => setBackgroundType("none")}
            >
              <span>No background image</span>
              {backgroundType === "none" && (
                <ChevronDown className="h-4 w-4 rotate-[270deg]" />
              )}
            </div>
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer"
              onClick={() => setBackgroundType("create")}
            >
              <span>Create background image</span>
              {backgroundType === "create" && (
                <ChevronDown className="h-4 w-4 rotate-[270deg]" />
              )}
            </div>
            <div
              className="flex items-center justify-between p-2 rounded cursor-pointer"
              onClick={() => setBackgroundType("id3")}
            >
              <span>Image from ID3 tag</span>
              {backgroundType === "id3" && (
                <ChevronDown className="h-4 w-4 rotate-[270deg]" />
              )}
            </div>
          </div>

          {backgroundType === "create" && (
            <div className="space-y-4 pt-4">
              <div>
                <Label>Background Image Text</Label>
                <Input
                  value={backgroundText}
                  onChange={(e) => onBackgroundTextChange(e.target.value)}
                />
              </div>
              <div>
                <Label>Background</Label>
                <Select
                  value={backgroundSettings.background}
                  onValueChange={(value) =>
                    setBackgroundSettings((prev) => ({
                      ...prev,
                      background: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white-black">
                      White Text / Black Background
                    </SelectItem>
                    <SelectItem value="black-white">
                      Black Text / White Background
                    </SelectItem>
                    <SelectItem value="gradient-blue">
                      White Text / Blue Gradient
                    </SelectItem>
                    <SelectItem value="gradient-purple">
                      White Text / Purple Gradient
                    </SelectItem>
                    <SelectItem value="gradient-sunset">
                      White Text / Sunset Gradient
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Font</Label>
                <Select
                  value={backgroundSettings.font}
                  onValueChange={(value) =>
                    setBackgroundSettings((prev) => ({ ...prev, font: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="segoe">Segoe UI</SelectItem>
                    <SelectItem value="arial">Arial</SelectItem>
                    <SelectItem value="helvetica">Helvetica</SelectItem>
                    <SelectItem value="times">Times New Roman</SelectItem>
                    <SelectItem value="courier">Courier New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Max Font Size</Label>
                <Select
                  value={backgroundSettings.fontSize}
                  onValueChange={(value) =>
                    setBackgroundSettings((prev) => ({
                      ...prev,
                      fontSize: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12pt</SelectItem>
                    <SelectItem value="14">14pt</SelectItem>
                    <SelectItem value="16">16pt</SelectItem>
                    <SelectItem value="18">18pt</SelectItem>
                    <SelectItem value="20">20pt</SelectItem>
                    <SelectItem value="24">24pt</SelectItem>
                    <SelectItem value="28">28pt</SelectItem>
                    <SelectItem value="32">32pt</SelectItem>
                    <SelectItem value="36">36pt</SelectItem>
                    <SelectItem value="48">48pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vertical Alignment</Label>
                <Select
                  value={backgroundSettings.alignment}
                  onValueChange={(value) =>
                    setBackgroundSettings((prev) => ({
                      ...prev,
                      alignment: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select alignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="middle">Middle</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preview Section */}
              {previewImage && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={previewImage}
                      alt="Background preview"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={generateBackgroundImage}
                disabled={!backgroundText.trim() || isGenerating}
              >
                {isGenerating ? "Generating..." : "Create Background Image"}
              </Button>
            </div>
          )}

          {backgroundType === "id3" && (
            <div className="pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Extract album artwork from audio file&apos;s ID3 tag
              </p>

              {!audioFile && (
                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                  Please upload an audio file first to extract album artwork.
                </div>
              )}

              {audioFile && !id3Image && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <p className="font-medium mb-1">🚧 ID3 Extraction Coming Soon!</p>
                  <p>Album artwork extraction is being developed. For now, use the "Create background image" option to generate custom backgrounds with text.</p>
                </div>
              )}

              {id3Image && (
                <div className="space-y-2">
                  <Label>Extracted Album Artwork</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={id3Image}
                      alt="Album artwork"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <p className="text-xs text-green-600">
                    ✅ Album artwork extracted successfully and ready to use!
                  </p>
                </div>
              )}

              {audioFile && (
                <Button
                  className="w-full"
                  onClick={extractID3Image}
                  variant="outline"
                  disabled
                >
                  Extract Album Artwork (Coming Soon)
                </Button>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
