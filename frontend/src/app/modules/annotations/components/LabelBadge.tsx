import React, { useState, useEffect, useRef } from "react";
import { Polygon } from "@/app/types/annotations";
import { useAnnotationStore } from "../store/useAnnotationStore";

interface LabelBadgeProps {
  polygon: Polygon;
  zoom: number;
  pan: { x: number; y: number };
  box: { ox: number; oy: number; w: number; h: number };
  dpr: number;
  canvasW: number;
  canvasH: number;
}

const TEMP_ID_THRESHOLD = 1_000_000_000_000;

export function LabelBadge({ polygon, zoom, pan, box, dpr, canvasW, canvasH }: LabelBadgeProps) {
  const { updatePolygon, selectPolygon, selectedPolygonId } = useAnnotationStore();

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(polygon.label);

  const [localPos, setLocalPos] = useState<{ x: number; y: number } | null>(() =>
    polygon.label_position || null
  );

  const localPosRef = useRef(localPos);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    localPosRef.current = localPos;
  }, [localPos]);

  const getDefaultPosition = () => {
    if (polygon.points.length === 0) return { x: 0, y: 0 };
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    polygon.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
    });
    return { x: (minX + maxX) / 2, y: minY - 0.02 };
  };

  const getScreenPosition = (relPos: { x: number; y: number }) => {
    if (!box) return { x: 0, y: 0 };
    
    // 1. Get position in canvas internal coordinates before pan/zoom
    const ix = box.ox + relPos.x * box.w;
    const iy = box.oy + relPos.y * box.h;

    // 2. Apply pan and zoom
    let sx = ix - canvasW / 2;
    let sy = iy - canvasH / 2;
    sx = sx * zoom;
    sy = sy * zoom;
    sx = sx + (canvasW / 2 + pan.x);
    sy = sy + (canvasH / 2 + pan.y);

    // 3. Convert from canvas internal coordinates to CSS coordinates
    return { x: sx / dpr, y: sy / dpr };
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
      if (!box) return;
      
      // Convert dx/dy in CSS pixels to relative coordinates
      const dxCSS = moveEvent.clientX - startX;
      const dyCSS = moveEvent.clientY - startY;

      // CSS -> internal pixels
      const dxInternal = dxCSS * dpr;
      const dyInternal = dyCSS * dpr;

      // Remove zoom
      const dxUnzoomed = dxInternal / zoom;
      const dyUnzoomed = dyInternal / zoom;

      // Remove box scale (to relative 0-1)
      const dxRel = dxUnzoomed / box.w;
      const dyRel = dyUnzoomed / box.h;

      const newPos = {
        x: startImgPos.x + dxRel,
        y: startImgPos.y + dyRel,
      };
      setLocalPos(newPos);
      localPosRef.current = newPos;
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
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
        selectedPolygonId === polygon.id ? "ring-2 ring-white/80 scale-105" : ""
      }`}
      style={{
        left: screenPos.x,
        top: screenPos.y,
        backgroundColor: polygon.color || "#6366f1",
        transform: "translate(-50%, -100%)",
        touchAction: "none",
        boxShadow: `0 2px 8px ${polygon.color || "#6366f1"}66`,
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
