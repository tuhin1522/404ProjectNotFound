"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Shapes, Tag, Edit2, Check, X } from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import { Polygon } from "@/app/types/annotations";

function PolygonItem({
  polygon,
  isSelected,
  onSelect,
  onDelete,
  onUpdate,
}: {
  polygon: Polygon;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, payload: { label?: string }) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(polygon.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    } else {
      setEditLabel(polygon.label || "");
    }
  }, [isEditing, polygon.label]);

  const handleSave = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (editLabel.trim() !== (polygon.label || "")) {
      await onUpdate(polygon.id, { label: editLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditLabel(polygon.label || "");
  };

  return (
    <div
      onClick={() => {
        if (!isEditing) onSelect(isSelected ? -1 : polygon.id);
      }}
      className={`
        group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
        transition-all duration-150 border
        ${isSelected ? "border-primary/60 bg-primary/5" : "border-transparent hover:bg-muted/50"}
      `}
    >
      {/* Color swatch */}
      <div
        className="w-3 h-3 rounded-sm flex-shrink-0 ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: polygon.color || "#6366f1" }}
      />

      {/* Label + points count */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave(e);
              if (e.key === "Escape") handleCancel(e);
            }}
            className="w-full text-xs bg-background border border-primary outline-none rounded px-1 py-0.5 text-foreground"
            placeholder="Label"
          />
        ) : (
          <p className="text-xs font-medium text-foreground truncate" title={polygon.label || "Unlabelled"}>
            {polygon.label || <span className="text-muted-foreground italic">Unlabelled</span>}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">
          {polygon.points.length} points
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="p-1 text-success hover:text-success/80 transition-colors"
              title="Save"
            >
              <Check size={13} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Cancel"
            >
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Edit label"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(polygon.id);
              }}
              className="p-1 text-destructive hover:text-destructive/80 transition-colors"
              title="Delete polygon"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AnnotationSidebar() {
  const {
    images,
    selectedImageId,
    selectedPolygonId,
    selectPolygon,
    updatePolygon,
    deletePolygon,
    clearAllPolygons,
  } = useAnnotationStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);
  const polygons = selectedImage?.polygons ?? [];

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Shapes size={14} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Polygons</span>
          {polygons.length > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
              {polygons.length}
            </span>
          )}
        </div>

        {polygons.length > 0 && (
          <button
            onClick={clearAllPolygons}
            className="text-[10px] text-destructive hover:text-destructive/80 font-medium transition-colors"
            title="Clear all polygons"
          >
            Clear all
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {!selectedImageId ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
            <Tag size={20} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Select an image to see its polygons</p>
          </div>
        ) : polygons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4 py-8">
            <Shapes size={20} className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No polygons yet. Start drawing on the canvas!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {polygons.map((polygon) => (
              <PolygonItem
                key={polygon.id}
                polygon={polygon}
                isSelected={selectedPolygonId === polygon.id}
                onSelect={(id) => selectPolygon(id === selectedPolygonId ? null : id)}
                onDelete={deletePolygon}
                onUpdate={updatePolygon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
