"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import ImageThumbnail from "./ImageThumbnail";
import ImageUploader from "./ImageUploader";

export default function ImageGallery() {
  const { images, selectedImageId, selectImage, deleteImage } =
    useAnnotationStore();
  const stripRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    stripRef.current?.scrollBy({ left: dir === "left" ? -120 : 120, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload zone */}
      <ImageUploader />

      {/* Image strip */}
      {images.length > 0 && (
        <div className="relative flex items-center gap-1">
          {/* Left scroll */}
          <button
            onClick={() => scroll("left")}
            className="flex-shrink-0 w-7 h-7 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Scrollable strip */}
          <div
            ref={stripRef}
            className="flex gap-2 overflow-x-auto flex-1 pb-1 scroll-smooth"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((img) => (
              <ImageThumbnail
                key={img.id}
                image={img}
                isSelected={selectedImageId === img.id}
                onSelect={selectImage}
                onDelete={deleteImage}
              />
            ))}
          </div>

          {/* Right scroll */}
          <button
            onClick={() => scroll("right")}
            className="flex-shrink-0 w-7 h-7 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Count label */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} image{images.length !== 1 ? "s" : ""} · click to select
        </p>
      )}
    </div>
  );
}
