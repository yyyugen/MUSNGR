"use client";

import { Upload } from "lucide-react";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DropZoneProps {
  onFileSelect: (files: FileList) => void;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export function DropZone({
  onFileSelect,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  maxFiles = 4,
  maxSize = 4,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const { files } = e.dataTransfer;
      console.log(files);
      if (files && files.length > 0) {
        if (files.length > maxFiles) {
          alert(`You can only upload up to ${maxFiles} files`);
          return;
        }

        const oversizedFiles = Array.from(files).filter(
          (file) => file.size > maxSize * 1024 * 1024
        );
        if (oversizedFiles.length > 0) {
          alert(`Files must be less than ${maxSize}MB each`);
          return;
        }

        onFileSelect(files);
      }
    },
    [maxFiles, maxSize, onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files) {
        onFileSelect(files);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-1/2 space-y-2">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-10"
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="h-20 resize-none"
        />
      </div>
      <div
        className={`w-full lg:w-1/2 relative flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-accent hover:text-accent-foreground"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={handleChange}
        />
        <Upload className="mb-2 h-6 w-6" />
        <p className="text-xs text-center">
          Drag &apos;n&apos; drop files here, or click to select files
        </p>
        <p className="text-xs text-muted-foreground text-center">
          You can upload {maxFiles} files (up to {maxSize} MB each)
        </p>
      </div>
    </div>
  );
}
