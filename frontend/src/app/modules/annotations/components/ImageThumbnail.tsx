"use client";

import { memo } from "react";
import { AnnotationImage } from "@/app/types/annotations";
import { Shapes, Trash2 } from "lucide-react";
import { swalConfirm, swalError, swalSuccess } from "@/app/lib/utils/swal";

interface ImageThumbnailProps {
  image: AnnotationImage;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

const ImageThumbnail = memo(function ImageThumbnail({
  image,
  isSelected,
  onSelect,
  onDelete,
}: ImageThumbnailProps) {
  const handleDelete = async () => {
    const confirmed = await swalConfirm({
      title: "Delete image?",
      text: `This will permanently delete \"${image.name}\" and its annotations.`,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    try {
      onDelete(image.id);
      await swalSuccess({ title: "Image deleted" });
    } catch {
      await swalError({ title: "Delete failed", text: "Please try again." });
    }
  };

  return (
    <div
      className={`
        group relative flex-shrink-0 w-24 rounded-xl overflow-hidden cursor-pointer
        border-2 transition-all duration-200
        ${isSelected ? "border-primary shadow-md shadow-primary/20 scale-[1.03]" : "border-border hover:border-primary/50"}
      `}
      onClick={() => onSelect(image.id)}
      title={image.name}
    >
      {/* Image */}
      <div className="aspect-square w-full bg-muted">
        <img
          src={image.image_url}
          alt={image.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Polygon count badge */}
      {image.polygon_count > 0 && (
        <div className="absolute top-1 right-1 flex items-center gap-0.5 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          <Shapes size={8} />
          <span>{image.polygon_count}</span>
        </div>
      )}

      {/* Delete button (appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          void handleDelete();
        }}
        className="
          absolute bottom-1 right-1 w-6 h-6 rounded-lg
          bg-destructive text-white flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          hover:bg-destructive/80
        "
        title="Delete image"
      >
        <Trash2 size={11} />
      </button>

      {/* Selected ring overlay */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-inset ring-primary rounded-xl pointer-events-none" />
      )}
    </div>
  );
});

export default ImageThumbnail;
