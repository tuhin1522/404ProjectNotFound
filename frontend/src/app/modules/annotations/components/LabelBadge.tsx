import React, { useState, useEffect, useRef } from "react";
import { Polygon } from "@/app/types/annotations";
import { useAnnotationStore } from "../store/useAnnotationStore";

interface LabelBadgeProps {
  polygon: Polygon;
  zoom: number;
  pan: { x: number; y: number };
  canvasW: number;
  canvasH: number;
}

// Temp IDs are generated via Date.now() and are always > 1 trillion.
// Real DB IDs are sequential integers, so this threshold safely distinguishes them.
const TEMP_ID_THRESHOLD = 1_000_000_000_000;

export function LabelBadge({ polygon, zoom, pan, canvasW, canvasH }: LabelBadgeProps) {
  const { updatePolygon, selectPolygon, selectedPolygonId } = useAnnotationStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(polygon.label);

  // Local state for smooth dragging before saving to backend
  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(
    polygon.label_position || null
  );

  // Use a ref to hold the latest localPos so we can read it in the
  // pointerup closure without triggering re-renders or breaking React rules.
  const localPosRef = useRef(localPos);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    localPosRef.current = localPos;
  }, [localPos]);

  useEffect(() => {
    setLocalPos(polygon.label_position || null);
    setDraftName(polygon.label);
  }, [polygon.label_position, polygon.label]);

  // Calculate default position if no custom position is saved
  const getDefaultPosition = () => {
    if (polygon.points.length === 0) return { x: 0, y: 0 };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;

    polygon.points.forEach((p) => {
      const ix = p.x * canvasW;
      const iy = p.y * canvasH;
      if (ix < minX) minX = ix;
      if (ix > maxX) maxX = ix;
      if (iy < minY) minY = iy;
    });

    // Centered above bounding box top edge
    return { x: (minX + maxX) / 2, y: minY - 12 };
  };

  const getScreenPosition = (imgPos: { x: number; y: number }) => {
    let sx = imgPos.x - canvasW / 2;
    let sy = imgPos.y - canvasH / 2;
    sx = sx * zoom;
    sy = sy * zoom;
    sx = sx + (canvasW / 2 + pan.x);
    sy = sy + (canvasH / 2 + pan.y);
    return { x: sx, y: sy };
  };

  const currentImgPos = localPos || getDefaultPosition();
  const screenPos = getScreenPosition(currentImgPos);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    selectPolygon(polygon.id);

    if (isEditing) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startImgPos = { ...currentImgPos };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      isDraggingRef.current = true;
      const dxImg = (moveEvent.clientX - startX) / zoom;
      const dyImg = (moveEvent.clientY - startY) / zoom;

      const newPos = {
        x: startImgPos.x + dxImg,
        y: startImgPos.y + dyImg,
      };
      setLocalPos(newPos);
      localPosRef.current = newPos;
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);

      // Only save if we actually dragged, and only if this is a real (non-temp) polygon
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        const finalPos = localPosRef.current;
        if (finalPos && polygon.id < TEMP_ID_THRESHOLD) {
          updatePolygon(polygon.id, { label_position: finalPos });
        }
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

  if (!polygon.label) return null;

  return (
    <div
      className={`absolute z-20 flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold text-white shadow-lg transition-all duration-150 cursor-grab active:cursor-grabbing select-none hover:scale-105 hover:brightness-110 ${
        selectedPolygonId === polygon.id
          ? "ring-2 ring-white/80 scale-105"
          : ""
      }`}
      style={{
        left: screenPos.x,
        top: screenPos.y,
        backgroundColor: polygon.color,
        transform: "translate(-50%, -100%)",
        touchAction: "none",
        boxShadow: `0 2px 8px ${polygon.color}66`,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          className="bg-black/20 text-white outline-none border-b border-white/50 focus:border-white px-1 w-20"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              if (polygon.id < TEMP_ID_THRESHOLD) {
                await updatePolygon(polygon.id, { label: draftName });
              }
            }
            if (e.key === "Escape") {
              setIsEditing(false);
              setDraftName(polygon.label);
            }
          }}
          onBlur={async () => {
            setIsEditing(false);
            if (draftName !== polygon.label && polygon.id < TEMP_ID_THRESHOLD) {
              await updatePolygon(polygon.id, { label: draftName });
            }
          }}
        />
      ) : (
        <span>{polygon.label}</span>
      )}
    </div>
  );
}
