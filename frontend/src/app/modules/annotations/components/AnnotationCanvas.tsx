"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  memo,
} from "react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import { Point, Polygon } from "@/app/types/annotations";

// ─── Utilities ────────────────────────────────────────────────────────────────

function toCanvas(pt: Point, w: number, h: number): [number, number] {
  return [pt.x * w, pt.y * h];
}

function toRelative(x: number, y: number, w: number, h: number): Point {
  return {
    x: Math.min(1, Math.max(0, x / w)),
    y: Math.min(1, Math.max(0, y / h)),
  };
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const CLOSE_THRESHOLD = 12; // px

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function applyClipPolygon(ctx: CanvasRenderingContext2D, points: Point[], w: number, h: number) {
  if (points.length < 3) return;
  const canvasPoints = points.map((p) => toCanvas(p, w, h));
  ctx.beginPath();
  ctx.moveTo(canvasPoints[0][0], canvasPoints[0][1]);
  for (let i = 1; i < canvasPoints.length; i++) {
    ctx.lineTo(canvasPoints[i][0], canvasPoints[i][1]);
  }
  ctx.closePath();
  ctx.clip();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  w: number,
  h: number,
  color: string,
  isHighlighted = false,
  isClosed = true,
  isCrop = false
) {
  if (points.length < 2) return;
  ctx.save();

  const canvasPoints = points.map((p) => toCanvas(p, w, h));

  ctx.beginPath();
  ctx.moveTo(canvasPoints[0][0], canvasPoints[0][1]);
  for (let i = 1; i < canvasPoints.length; i++) {
    ctx.lineTo(canvasPoints[i][0], canvasPoints[i][1]);
  }
  if (isClosed) ctx.closePath();

  if (isCrop) {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = 5;
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (isClosed) {
    ctx.fillStyle = color + (isHighlighted ? "55" : "33"); 
    ctx.fill();
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = isHighlighted ? 2.5 : 1.8;
  ctx.lineJoin = "round";
  ctx.stroke();

  canvasPoints.forEach(([x, y], i) => {
    ctx.beginPath();
    ctx.arc(x, y, isHighlighted ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? color : "#ffffff";
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });

  ctx.restore();
}

function drawInProgress(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mouse: { x: number; y: number } | null,
  w: number,
  h: number,
  color: string,
  isCrop: boolean
) {
  if (points.length === 0) return;

  const canvasPoints = points.map((p) => toCanvas(p, w, h));

  if (mouse) {
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = isCrop ? "#ffffff" : color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const last = canvasPoints[canvasPoints.length - 1];
    ctx.moveTo(last[0], last[1]);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
    if (isCrop) {
      ctx.strokeStyle = "#000000";
      ctx.lineDashOffset = 5;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawPolygon(ctx, points, w, h, isCrop ? "#ffffff" : color, false, false, isCrop);

  if (points.length >= 3 && mouse) {
    const [fx, fy] = toCanvas(points[0], w, h);
    const isNearFirst = dist(mouse.x, mouse.y, fx, fy) < CLOSE_THRESHOLD;
    ctx.save();
    ctx.beginPath();
    ctx.arc(fx, fy, CLOSE_THRESHOLD, 0, Math.PI * 2);
    ctx.strokeStyle = isCrop ? "#ffffff" : color;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.globalAlpha = isNearFirst ? 0.9 : 0.35;
    ctx.stroke();
    ctx.restore();
  }
}

function drawInProgressBox(
  ctx: CanvasRenderingContext2D,
  startPoint: Point,
  endMouse: { x: number; y: number },
  w: number,
  h: number,
  color: string
) {
  ctx.save();
  const [sx, sy] = toCanvas(startPoint, w, h);
  
  ctx.fillStyle = color + "33";
  ctx.fillRect(sx, sy, endMouse.x - sx, endMouse.y - sy);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(sx, sy, endMouse.x - sx, endMouse.y - sy);
  ctx.restore();
}

// ─── Main Canvas Component ────────────────────────────────────────────────────

const AnnotationCanvas = memo(function AnnotationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  const mouseScreenRef = useRef<{ x: number; y: number } | null>(null);
  const mouseImgRef = useRef<{ x: number; y: number } | null>(null);
  
  const animFrameRef = useRef<number>(0);

  // Panning & Box Drawing state
  const isPanningRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const isBoxDrawingRef = useRef(false);
  const boxStartRef = useRef<Point | null>(null);

  const {
    images,
    selectedImageId,
    currentPolygonPoints,
    currentColor,
    selectedPolygonId,
    toolMode,
    zoom,
    pan,
    setPan,
    addPointToCurrentPolygon,
    undoLastPoint,
    redoLastPoint,
    saveCurrentPolygon,
    clearCurrentPolygon,
  } = useAnnotationStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);

  // ─── Canvas sizing ──────────────────────────────────────────────────────────
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const { width, height } = container.getBoundingClientRect();
    if (width !== canvasSize.w || height !== canvasSize.h) {
      canvas.width = width;
      canvas.height = height;
      setCanvasSize({ w: width, h: height });
    }
  }, [canvasSize]);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resize]);

  // ─── Image loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedImage) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedImage.image_url;
    img.onload = () => {
      imgRef.current = img;
    };
  }, [selectedImage?.image_url]);

  // ─── Render loop ────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width: w, height: h } = canvas;
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (imgRef.current) {
      ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      ctx.save();
      const polygons = selectedImage?.polygons ?? [];
      const cropPolygons = polygons.filter(p => p.label === "__crop__");
      
      if (cropPolygons.length > 0) {
        applyClipPolygon(ctx, cropPolygons[0].points, w, h);
      }
      
      ctx.drawImage(imgRef.current, 0, 0, w, h);
      ctx.restore();

      polygons.forEach((poly: Polygon) => {
        drawPolygon(
          ctx,
          poly.points,
          w,
          h,
          poly.color || "#6366f1",
          selectedPolygonId === poly.id,
          true,
          poly.label === "__crop__"
        );
      });

      // Draw in-progress polygon
      if (toolMode !== "box" && currentPolygonPoints.length > 0) {
        drawInProgress(
          ctx, 
          currentPolygonPoints, 
          mouseImgRef.current, 
          w, h, 
          currentColor, 
          toolMode === "crop"
        );
      }

      // Draw in-progress box
      if (toolMode === "box" && isBoxDrawingRef.current && boxStartRef.current && mouseImgRef.current) {
        drawInProgressBox(
          ctx,
          boxStartRef.current,
          mouseImgRef.current,
          w, h,
          currentColor
        );
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, [selectedImage, currentPolygonPoints, currentColor, selectedPolygonId, pan, zoom, toolMode]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [render]);

  // ─── Global keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undoLastPoint();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "Z" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redoLastPoint();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoLastPoint, redoLastPoint]);

  // ─── Interaction Helpers ────────────────────────────────────────────────────
  
  const screenToImage = (sx: number, sy: number, canvasW: number, canvasH: number) => {
    let ix = sx - (canvasW / 2 + pan.x);
    let iy = sy - (canvasH / 2 + pan.y);
    
    ix = ix / zoom;
    iy = iy / zoom;
    
    ix = ix + canvasW / 2;
    iy = iy + canvasH / 2;
    
    return { x: ix, y: iy };
  };

  const getRelativePoint = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    
    const imgPos = screenToImage(sx, sy, canvas.width, canvas.height);
    const rel = toRelative(imgPos.x, imgPos.y, canvas.width, canvas.height);
    return { rel, imgPos, sx, sy, w: canvas.width, h: canvas.height };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey) {
      e.preventDefault();
      isPanningRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (toolMode === "box" && selectedImageId && !isPanningRef.current) {
      const { rel } = getRelativePoint(e);
      isBoxDrawingRef.current = true;
      boxStartRef.current = rel;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanningRef.current && dragStartRef.current) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }

    const { imgPos, sx, sy } = getRelativePoint(e);
    mouseImgRef.current = imgPos;
    mouseScreenRef.current = { x: sx, y: sy };
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey || isPanningRef.current) {
      isPanningRef.current = false;
      dragStartRef.current = null;
      return;
    }

    // Box completion
    if (toolMode === "box" && isBoxDrawingRef.current && boxStartRef.current) {
      isBoxDrawingRef.current = false;
      const { rel: endRel } = getRelativePoint(e);
      const startRel = boxStartRef.current;
      boxStartRef.current = null;

      // Only save if it's an actual box (not a click without drag)
      if (Math.abs(endRel.x - startRel.x) > 0.01 && Math.abs(endRel.y - startRel.y) > 0.01) {
        clearCurrentPolygon();
        // Create 4-point polygon (TL, TR, BR, BL)
        addPointToCurrentPolygon({ x: startRel.x, y: startRel.y });
        addPointToCurrentPolygon({ x: endRel.x, y: startRel.y });
        addPointToCurrentPolygon({ x: endRel.x, y: endRel.y });
        addPointToCurrentPolygon({ x: startRel.x, y: endRel.y });
        await saveCurrentPolygon();
      }
    }
  };

  const handleMouseLeave = () => {
    mouseImgRef.current = null;
    mouseScreenRef.current = null;
    isPanningRef.current = false;
    dragStartRef.current = null;
    isBoxDrawingRef.current = false;
    boxStartRef.current = null;
  };

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Ignore clicks if panning or box mode
    if (e.button === 1 || e.shiftKey || toolMode === "box") return;
    
    if (!selectedImageId) return;
    const canvas = canvasRef.current!;
    const { rel, imgPos, w, h } = getRelativePoint(e);

    // Check if close to first point (close polygon)
    if (currentPolygonPoints.length >= 3) {
      const [fx, fy] = toCanvas(currentPolygonPoints[0], w, h);
      if (dist(imgPos.x, imgPos.y, fx, fy) < CLOSE_THRESHOLD / zoom) {
        await saveCurrentPolygon(toolMode === "crop" ? "__crop__" : undefined);
        return;
      }
    }

    addPointToCurrentPolygon(rel);
  };

  const handleDoubleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey || toolMode === "box") return;
    if (currentPolygonPoints.length >= 3) {
      await saveCurrentPolygon(toolMode === "crop" ? "__crop__" : undefined);
    }
  };

  // ─── Cursor style ───────────────────────────────────────────────────────────
  const getCursor = (): string => {
    if (!selectedImageId) return "default";
    if (isPanningRef.current) return "grabbing";
    
    if (toolMode !== "box" && currentPolygonPoints.length >= 3 && mouseImgRef.current && canvasRef.current) {
      const [fx, fy] = toCanvas(currentPolygonPoints[0], canvasRef.current.width, canvasRef.current.height);
      if (dist(mouseImgRef.current.x, mouseImgRef.current.y, fx, fy) < CLOSE_THRESHOLD / zoom) {
        return "cell";
      }
    }
    return toolMode === "box" ? "crosshair" : toolMode === "crop" ? "crosshair" : "crosshair";
  };

  // ─── Empty states ────────────────────────────────────────────────────────────
  if (!selectedImageId) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-muted/20 border-2 border-dashed border-border rounded-xl"
      >
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground">No image selected</p>
          <p className="text-sm text-muted-foreground mt-1">Upload and select an image to start annotating</p>
        </div>
      </div>
    );
  }

  // NOTE: Increased height and reduced width slightly by adding constraints
  return (
    <div
      ref={containerRef}
      className="flex-1 relative bg-black/5 rounded-xl overflow-hidden border border-border min-h-[700px] max-w-7xl mx-auto h-fit w-full"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: getCursor() }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
      />

      {toolMode !== "box" && currentPolygonPoints.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border text-xs px-3 py-1.5 rounded-full text-muted-foreground pointer-events-none shadow-lg">
          {currentPolygonPoints.length < 3
            ? `Add ${3 - currentPolygonPoints.length} more point${3 - currentPolygonPoints.length !== 1 ? "s" : ""} to close`
            : "Click first point or double-click to complete"}
        </div>
      )}
      
      {toolMode === "box" && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border text-xs px-3 py-1.5 rounded-full text-muted-foreground pointer-events-none shadow-lg">
          Click and drag to draw a box
        </div>
      )}

      {/* Pan hint overlay */}
      <div className="absolute top-3 left-3 bg-card/60 backdrop-blur-sm text-[10px] px-2 py-1 rounded-md text-muted-foreground pointer-events-none flex flex-col gap-1">
        <span>Shift + Drag to pan</span>
      </div>
    </div>
  );
});

export default AnnotationCanvas;
