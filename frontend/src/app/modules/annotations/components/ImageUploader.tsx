"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, ImagePlus, X, AlertCircle } from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

export default function ImageUploader() {
  const { uploadImage } = useAnnotationStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, WebP, and GIF images are accepted.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `Image must be under ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setError(null);

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        validFiles.push(file);
      }

      setIsUploading(true);
      try {
        // Upload all files sequentially
        for (const file of validFiles) {
          await uploadImage(file);
        }
      } catch (e: any) {
        setError(e?.response?.data?.image?.[0] ?? "Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [uploadImage]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          group relative flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-xl p-6 cursor-pointer
          transition-all duration-200 text-center
          ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}
          ${isUploading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <>
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium">Uploading…</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImagePlus size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Drop images here or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPEG, PNG, WebP, GIF · Max {MAX_SIZE_MB} MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
