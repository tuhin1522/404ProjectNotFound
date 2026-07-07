"use client";

import { useRef, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Upload, Shapes, Trash2 } from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";

export default function BottomFilmstrip() {
  const {
    images,
    selectedImageId,
    selectImage,
    deleteImage,
    uploadImage,
    isImagesLoading,
    imagesError,
    selectPrevImage,
    selectNextImage,
  } = useAnnotationStore();

  const stripRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const scroll = (dir: "left" | "right") => {
    stripRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadImage]);

  const selectedIndex = images.findIndex(img => img.id === selectedImageId);

  return (
    <footer className="flex-shrink-0 h-24 bg-[#0d0d0d] border-t border-[#1e1e1e] flex items-center px-2 gap-2">
      {/* Navigation arrows */}
      <button
        onClick={() => selectPrevImage()}
        disabled={images.length <= 1 || selectedIndex <= 0}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] hover:text-white hover:border-[#3a3a3a] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        title="Previous image (←)"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Upload button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-[#2a2a2a] hover:border-indigo-500/40 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-1 text-[#444] hover:text-indigo-400 transition-all group"
        title="Upload Images"
      >
        {isUploading ? (
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Upload size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium">Upload</span>
          </>
        )}
      </button>

      {/* Loading / error states */}
      {isImagesLoading && (
        <div className="flex items-center gap-2 text-[11px] text-[#444]">
          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          Loading…
        </div>
      )}
      {imagesError && !isImagesLoading && (
        <p className="text-[11px] text-red-400">{imagesError}</p>
      )}

      {/* Scrollable filmstrip */}
      <div
        ref={stripRef}
        className="flex gap-2 overflow-x-auto flex-1 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((img, idx) => {
          const isSelected = selectedImageId === img.id;
          return (
            <div
              key={img.id}
              onClick={() => selectImage(img.id)}
              title={img.name}
              className={`
                group relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden cursor-pointer
                border-2 transition-all duration-200
                ${isSelected
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/30 scale-[1.04]"
                  : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:scale-[1.02]"
                }
              `}
            >
              <img
                src={img.image_url}
                alt={img.name}
                className="w-full h-full object-cover"
              />

              {/* Index badge */}
              <div className={`absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded leading-none ${
                isSelected ? "bg-indigo-500 text-white" : "bg-black/60 text-[#888]"
              }`}>
                {idx + 1}
              </div>

              {/* Annotation count badge */}
              {img.polygon_count > 0 && (
                <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/70 text-[#ccc] text-[8px] font-bold px-1 py-0.5 rounded leading-none">
                  <Shapes size={7} />
                  <span>{img.polygon_count}</span>
                </div>
              )}

              {/* Delete on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-md bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                title="Delete image"
              >
                <Trash2 size={9} className="text-white" />
              </button>

              {/* Selected ring */}
              {isSelected && (
                <div className="absolute inset-0 ring-2 ring-inset ring-indigo-500 rounded-xl pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => selectNextImage()}
        disabled={images.length <= 1 || selectedIndex >= images.length - 1}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#555] hover:text-white hover:border-[#3a3a3a] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        title="Next image (→)"
      >
        <ChevronRight size={14} />
      </button>

      {/* Image count */}
      {images.length > 0 && (
        <div className="flex-shrink-0 text-[10px] text-[#444] text-center min-w-[36px]">
          <span className="text-[#777] font-bold">{selectedIndex + 1}</span>
          <span className="text-[#333]">/{images.length}</span>
        </div>
      )}
    </footer>
  );
}
