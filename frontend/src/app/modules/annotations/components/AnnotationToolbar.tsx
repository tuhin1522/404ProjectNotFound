"use client";

import { useState, useEffect } from "react";
import { 
  Pencil, RotateCcw, Check, Palette, Tag, Undo2, Redo2, 
  ZoomIn, ZoomOut, Expand, Maximize, ChevronLeft, ChevronRight, Crop, Square
} from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";

const PRESET_COLORS = [
  "#6366f1", // indigo
  "#22c55e", // green
  "#ef4444", // red
  "#f59e0b", // amber
  "#0ea5e9", // sky
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#f97316", // orange
];

export default function AnnotationToolbar() {
  const {
    currentPolygonPoints,
    redoStack,
    currentColor,
    currentLabel,
    selectedImageId,
    setColor,
    setLabel,
    undoLastPoint,
    redoLastPoint,
    clearCurrentPolygon,
    saveCurrentPolygon,
    // New controls
    toolMode,
    setToolMode,
    zoom,
    setZoom,
    setPan,
    selectPrevImage,
    selectNextImage,
    images,
  } = useAnnotationStore();

  const [labelInput, setLabelInput] = useState(currentLabel);
  useEffect(() => {
    setLabelInput(currentLabel);
  }, [currentLabel]);

  const isDrawing = currentPolygonPoints.length > 0;
  const canUndo = currentPolygonPoints.length > 0;
  const canRedo = redoStack.length > 0;
  const canSave = currentPolygonPoints.length >= 3;

  const handleSave = async () => {
    setLabel(labelInput);
    await saveCurrentPolygon(labelInput);
    setLabelInput("");
  };

  const handleCancel = () => {
    clearCurrentPolygon();
    setLabelInput("");
    setLabel("");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Top row: View Controls & Image Navigation */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={selectPrevImage}
            disabled={images.length <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Image"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={selectNextImage}
            disabled={images.length <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Image"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border">
          <button
            onClick={() => setToolMode("draw")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === "draw" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pencil size={13} />
            Draw
          </button>
          <button
            onClick={() => setToolMode("box")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === "box" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Box mode (draw a rectangular bounding box)"
          >
            <Square size={13} />
            Box
          </button>
          <button
            onClick={() => setToolMode("crop")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              toolMode === "crop" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
            title="Crop mode (draw a polygon to visually mask the image)"
          >
            <Crop size={13} />
            Crop
          </button>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(z => Math.max(0.1, z - 0.2))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-medium w-12 text-center text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(z => Math.min(10, z + 0.2))}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Reset Zoom (1:1)"
          >
            <Maximize size={14} />
          </button>
          <button
            onClick={() => {
              setZoom(1); 
              setPan({ x: 0, y: 0 });
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Fit to Screen"
          >
            <Expand size={14} />
          </button>
        </div>
      </div>

      {/* Bottom row: Drawing Tools */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl">
        {/* Drawing status */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {toolMode === "crop" ? (
            <Crop size={14} className={isDrawing ? "text-primary animate-pulse" : "text-muted-foreground"} />
          ) : toolMode === "box" ? (
            <Square size={14} className={isDrawing ? "text-primary animate-pulse" : "text-muted-foreground"} />
          ) : (
            <Pencil size={14} className={isDrawing ? "text-primary animate-pulse" : "text-muted-foreground"} />
          )}
          <span className={isDrawing ? "text-primary" : "text-muted-foreground"}>
            {isDrawing
              ? `${toolMode === "crop" ? "Cropping" : toolMode === "box" ? "Drawing Box" : "Drawing"}… ${currentPolygonPoints.length} pt${currentPolygonPoints.length !== 1 ? "s" : ""}`
              : selectedImageId
              ? `Click on image to start ${toolMode === "crop" ? "crop mask" : toolMode === "box" ? "box" : "polygon"}`
              : "Select an image first"}
          </span>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undoLastPoint}
            disabled={!canUndo}
            title="Undo last point (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redoLastPoint}
            disabled={!canRedo}
            title="Redo last point (Ctrl+Shift+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 size={14} />
          </button>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Color Palette */}
        <div className="flex items-center gap-2">
          <Palette size={13} className="text-muted-foreground" />
          <div className="flex items-center gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setColor(color)}
                className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ring-offset-1 ${
                  currentColor === color ? "ring-2 ring-foreground scale-110" : ""
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {/* Custom color picker */}
            <label className="relative w-5 h-5 rounded-full overflow-hidden cursor-pointer border border-border flex-shrink-0">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-8 h-8 -m-1"
              />
              <div className="w-full h-full" style={{ backgroundColor: currentColor }} />
            </label>
          </div>
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Label input */}
        <div className="flex items-center gap-2 flex-1 min-w-32">
          <Tag size={13} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Label (optional)"
            value={labelInput}
            onChange={(e) => {
              setLabelInput(e.target.value);
              setLabel(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) handleSave();
              if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                e.preventDefault();
                undoLastPoint();
              }
              if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
                e.preventDefault();
                redoLastPoint();
              }
            }}
            className="text-xs bg-transparent border-b border-border focus:border-primary outline-none text-foreground placeholder:text-muted-foreground w-full py-0.5 transition-colors"
          />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {isDrawing && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw size={12} />
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title={canSave ? "Save polygon" : "Need at least 3 points"}
          >
            <Check size={12} />
            Save ({currentPolygonPoints.length}/3+)
          </button>
        </div>
      </div>
    </div>
  );
}
