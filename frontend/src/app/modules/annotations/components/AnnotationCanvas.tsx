"use client";

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  memo,
} from "react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import { Point, Polygon } from "@/app/types/annotations";
import { LabelBadge } from "./LabelBadge";
import { downloadUtils } from "@/app/lib/utils/downloadUtils";
import { sharedCanvasRef } from "@/app/(protected)/annotate/page";

// ─── Utilities ────────────────────────────────────────────────────────────────

type ImageBox = { ox: number; oy: number; w: number; h: number };

function getImageBox(cw: number, ch: number, iw: number, ih: number): ImageBox {
  if (!cw || !ch || !iw || !ih) return { ox: 0, oy: 0, w: cw || 0, h: ch || 0 };
  const imgRatio = iw / ih;
  const canvasRatio = cw / ch;
  let w = cw, h = ch, ox = 0, oy = 0;
  if (imgRatio > canvasRatio) {
    h = cw / imgRatio;
    oy = (ch - h) / 2;
  } else {
    w = ch * imgRatio;
    ox = (cw - w) / 2;
  }
  return { ox, oy, w, h };
}

function toCanvas(pt: Point, box: ImageBox): [number, number] {
  return [box.ox + pt.x * box.w, box.oy + pt.y * box.h];
}

function toRelative(x: number, y: number, box: ImageBox): Point {
  return {
    x: Math.min(1, Math.max(0, (x - box.ox) / box.w)),
    y: Math.min(1, Math.max(0, (y - box.oy) / box.h)),
  };
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

const CLOSE_THRESHOLD = 12; // px

// ─── Draw helpers ─────────────────────────────────────────────────────────────

function applyClipPolygon(ctx: CanvasRenderingContext2D, points: Point[], box: ImageBox) {
  if (points.length < 3) return;
  const canvasPoints = points.map((p) => toCanvas(p, box));
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
  box: ImageBox,
  color: string,
  isHighlighted = false,
  isClosed = true,
  isCrop = false
) {
  if (points.length < 2) return;
  ctx.save();

  const canvasPoints = points.map((p) => toCanvas(p, box));

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

// ─── Ellipse Draw Helpers ─────────────────────────────────────────────────────

function drawEllipse(
  ctx: CanvasRenderingContext2D,
  points: Point[], // [center, radii]
  box: ImageBox,
  color: string,
  isHighlighted = false
) {
  if (points.length !== 2) return;
  ctx.save();

  const [cx, cy] = toCanvas(points[0], box);
  const rx = Math.abs(points[1].x * box.w - (points[0].x * box.w));
  const ry = Math.abs(points[1].y * box.h - (points[0].y * box.h));

  if (rx < 2 || ry < 2) { ctx.restore(); return; }

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);

  ctx.fillStyle = color + (isHighlighted ? "55" : "33");
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = isHighlighted ? 2.5 : 1.8;
  ctx.stroke();

  // Draw center + resize handle
  ctx.beginPath();
  ctx.arc(cx, cy, isHighlighted ? 4 : 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  if (isHighlighted) {
    // Draw bounding box handles
    [[cx + rx, cy], [cx - rx, cy], [cx, cy + ry], [cx, cy - ry]].forEach(([hx, hy]) => {
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  ctx.restore();
}

function drawInProgressEllipse(
  ctx: CanvasRenderingContext2D,
  start: Point,
  mouse: { x: number; y: number },
  box: ImageBox,
  color: string
) {
  ctx.save();
  const [sx, sy] = toCanvas(start, box);
  const cx = (sx + mouse.x) / 2;
  const cy = (sy + mouse.y) / 2;
  const rx = Math.abs(mouse.x - sx) / 2;
  const ry = Math.abs(mouse.y - sy) / 2;

  if (rx < 2 || ry < 2) { ctx.restore(); return; }

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = color + "33";
  ctx.fill();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

function drawInProgress(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  mouse: { x: number; y: number } | null,
  box: ImageBox,
  color: string,
  isCrop: boolean
) {
  if (points.length === 0) return;

  const canvasPoints = points.map((p) => toCanvas(p, box));

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

  drawPolygon(ctx, points, box, isCrop ? "#ffffff" : color, false, false, isCrop);

  if (points.length >= 3 && mouse) {
    const [fx, fy] = toCanvas(points[0], box);
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
  box: ImageBox,
  color: string
) {
  ctx.save();
  const [sx, sy] = toCanvas(startPoint, box);

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

  // Panning state
  const isPanningRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  // Box Drawing state
  const isBoxDrawingRef = useRef(false);
  const boxStartRef = useRef<Point | null>(null);

  // Ellipse Drawing state
  const isEllipseDrawingRef = useRef(false);
  const ellipseStartRef = useRef<Point | null>(null);
  const ellipseStartScreenRef = useRef<{ x: number; y: number } | null>(null);

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
    clearCurrentPolygon,
    saveCurrentPolygon,
    selectPolygon,
    deletePolygon,
    hiddenPolygonIds,
    setZoom,
  } = useAnnotationStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);

  const setCanvasElement = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    sharedCanvasRef.current = node;
  }, []);

  // Expose canvasRef to shared module reference
  useEffect(() => {
    sharedCanvasRef.current = canvasRef.current;
  }, []);

  const resize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const { width, height } = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const newW = Math.floor(width * dpr);
    const newH = Math.floor(height * dpr);
    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
    }
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
  }, []);

  useLayoutEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    const handleViewportChange = () => {
      requestAnimationFrame(resize);
    };
    window.addEventListener("resize", handleViewportChange);
    document.addEventListener("fullscreenchange", handleViewportChange);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleViewportChange);
      document.removeEventListener("fullscreenchange", handleViewportChange);
    };
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
      resize();
    };
  }, [selectedImage?.image_url, resize]);

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

      const imgW = imgRef.current.naturalWidth;
      const imgH = imgRef.current.naturalHeight;
      const box = getImageBox(w, h, imgW, imgH);

      ctx.save();
      const polygons = selectedImage?.polygons ?? [];
      const cropPolygons = polygons.filter(p => p.label === "__crop__");

      if (cropPolygons.length > 0) {
        applyClipPolygon(ctx, cropPolygons[0].points, box);
      }

      ctx.drawImage(imgRef.current, box.ox, box.oy, box.w, box.h);
      ctx.restore();

      polygons.forEach((poly: Polygon) => {
        if (hiddenPolygonIds.has(poly.id)) return; // respect visibility

        const shapeType = downloadUtils.inferShapeType(poly.points.length);
        if (shapeType === "ellipse") {
          drawEllipse(
            ctx,
            poly.points,
            box,
            poly.color || "#6366f1",
            selectedPolygonId === poly.id
          );
        } else {
          drawPolygon(
            ctx,
            poly.points,
            box,
            poly.color || "#6366f1",
            selectedPolygonId === poly.id,
            true,
            poly.label === "__crop__"
          );
        }
      });

      // Draw in-progress polygon / crop
      if (toolMode === "draw" || toolMode === "crop") {
        if (currentPolygonPoints.length > 0) {
          drawInProgress(
            ctx,
            currentPolygonPoints,
            mouseImgRef.current,
            box,
            currentColor,
            toolMode === "crop"
          );
        }
      }

      // Draw in-progress box
      if (toolMode === "box" && isBoxDrawingRef.current && boxStartRef.current && mouseImgRef.current) {
        drawInProgressBox(ctx, boxStartRef.current, mouseImgRef.current, box, currentColor);
      }

      // Draw in-progress ellipse
      if (toolMode === "ellipse" && isEllipseDrawingRef.current && ellipseStartRef.current && mouseImgRef.current) {
        drawInProgressEllipse(ctx, ellipseStartRef.current, mouseImgRef.current, box, currentColor);
      }
    }

    animFrameRef.current = requestAnimationFrame(render);
  }, [selectedImage, currentPolygonPoints, currentColor, selectedPolygonId, pan, zoom, toolMode, hiddenPolygonIds]);

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
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const store = useAnnotationStore.getState();
        if (store.currentPolygonPoints.length >= 2) store.saveCurrentPolygon();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        // Download trigger — handled by TopToolbar via keyboard in future
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (currentPolygonPoints.length >= 3) saveCurrentPolygon();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        clearCurrentPolygon();
        selectPolygon(null);
        isEllipseDrawingRef.current = false;
        ellipseStartRef.current = null;
        isBoxDrawingRef.current = false;
        boxStartRef.current = null;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedPolygonId) {
          e.preventDefault();
          deletePolygon(selectedPolygonId);
        }
      }
      if (e.key === "Tab") {
        e.preventDefault();
        if (selectedImage?.polygons && selectedImage.polygons.length > 0) {
          const polys = selectedImage.polygons;
          if (!selectedPolygonId) {
            selectPolygon(polys[0].id);
          } else {
            const idx = polys.findIndex(p => p.id === selectedPolygonId);
            if (idx !== -1) selectPolygon(polys[(idx + 1) % polys.length].id);
          }
        }
      }
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom(z => Math.min(10, parseFloat((z + 0.25).toFixed(2))));
      }
      if (e.key === "-") {
        e.preventDefault();
        setZoom(z => Math.max(0.1, parseFloat((z - 0.25).toFixed(2))));
      }
      if (e.code === "Space") {
        e.preventDefault();
        isPanningRef.current = true;
      }
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const store = useAnnotationStore.getState();
        if (e.key === "p" || e.key === "P") store.setToolMode("draw");
        if (e.key === "b" || e.key === "B") store.setToolMode("box");
        if (e.key === "e" || e.key === "E") store.setToolMode("ellipse");
        if (e.key === "c" || e.key === "C") store.setToolMode("crop");
        if (e.key === "h" || e.key === "H") store.setToolMode("pan");
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isPanningRef.current = false;
        dragStartRef.current = null;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [undoLastPoint, redoLastPoint, currentPolygonPoints, saveCurrentPolygon, clearCurrentPolygon, selectPolygon, deletePolygon, selectedPolygonId, selectedImage, setZoom]);

  // ─── Wheel Zoom ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.min(10, Math.max(0.1, parseFloat((z + delta).toFixed(2)))));
    };
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [setZoom]);

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
    const dpr = window.devicePixelRatio || 1;
    const sx = (e.clientX - rect.left) * dpr;
    const sy = (e.clientY - rect.top) * dpr;
    const imgPos = screenToImage(sx, sy, canvas.width, canvas.height);
    
    const imgW = imgRef.current ? imgRef.current.naturalWidth : canvas.width;
    const imgH = imgRef.current ? imgRef.current.naturalHeight : canvas.height;
    const box = getImageBox(canvas.width, canvas.height, imgW, imgH);
    
    const rel = toRelative(imgPos.x, imgPos.y, box);
    return { rel, imgPos, sx, sy, box };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Middle button or Space held = pan
    if (e.button === 1 || e.shiftKey || toolMode === "pan" || isPanningRef.current) {
      e.preventDefault();
      isPanningRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (toolMode === "box" && selectedImageId) {
      const { rel } = getRelativePoint(e);
      isBoxDrawingRef.current = true;
      boxStartRef.current = rel;
    }

    if (toolMode === "ellipse" && selectedImageId) {
      const { rel, sx, sy } = getRelativePoint(e);
      isEllipseDrawingRef.current = true;
      ellipseStartRef.current = rel;
      ellipseStartScreenRef.current = { x: sx, y: sy };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanningRef.current && dragStartRef.current) {
      const dpr = window.devicePixelRatio || 1;
      const dx = (e.clientX - dragStartRef.current.x) * dpr;
      const dy = (e.clientY - dragStartRef.current.y) * dpr;
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }

    const { imgPos, sx, sy } = getRelativePoint(e);
    mouseImgRef.current = imgPos;
    mouseScreenRef.current = { x: sx, y: sy };
  };

  const handleMouseUp = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey || (toolMode === "pan" && isPanningRef.current)) {
      isPanningRef.current = false;
      dragStartRef.current = null;
      return;
    }
    if (isPanningRef.current) {
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

      if (Math.abs(endRel.x - startRel.x) > 0.01 && Math.abs(endRel.y - startRel.y) > 0.01) {
        clearCurrentPolygon();
        addPointToCurrentPolygon({ x: startRel.x, y: startRel.y });
        addPointToCurrentPolygon({ x: endRel.x, y: startRel.y });
        addPointToCurrentPolygon({ x: endRel.x, y: endRel.y });
        addPointToCurrentPolygon({ x: startRel.x, y: endRel.y });
        await saveCurrentPolygon();
      }
    }

    // Ellipse completion
    if (toolMode === "ellipse" && isEllipseDrawingRef.current && ellipseStartRef.current) {
      isEllipseDrawingRef.current = false;
      const { rel: endRel } = getRelativePoint(e);
      const startRel = ellipseStartRef.current;
      ellipseStartRef.current = null;
      ellipseStartScreenRef.current = null;

      if (Math.abs(endRel.x - startRel.x) > 0.01 && Math.abs(endRel.y - startRel.y) > 0.01) {
        // Encode ellipse as [center, radii limit]
        const cx = (startRel.x + endRel.x) / 2;
        const cy = (startRel.y + endRel.y) / 2;
        const rx = Math.abs(endRel.x - startRel.x) / 2;
        const ry = Math.abs(endRel.y - startRel.y) / 2;
        clearCurrentPolygon();
        addPointToCurrentPolygon({ x: cx, y: cy });      // center
        addPointToCurrentPolygon({ x: cx + rx, y: cy + ry }); // radii encoded
        await saveCurrentPolygon();
      }
    }
  };

  const handleMouseLeave = () => {
    mouseImgRef.current = null;
    mouseScreenRef.current = null;
    if (toolMode !== "pan") {
      isPanningRef.current = false;
      dragStartRef.current = null;
    }
    isBoxDrawingRef.current = false;
    boxStartRef.current = null;
    // Don't reset ellipse on leave, keep drawing
  };

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey || toolMode === "box" || toolMode === "ellipse" || toolMode === "pan") return;
    if (!selectedImageId) return;

    const canvas = canvasRef.current!;
    const { rel, imgPos, box } = getRelativePoint(e);

    // Check if close to first point (close polygon)
    if (currentPolygonPoints.length >= 3) {
      const [fx, fy] = toCanvas(currentPolygonPoints[0], box);
      if (dist(imgPos.x, imgPos.y, fx, fy) < CLOSE_THRESHOLD / zoom) {
        await saveCurrentPolygon(toolMode === "crop" ? "__crop__" : undefined);
        return;
      }
    }

    addPointToCurrentPolygon(rel);
  };

  const handleDoubleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || e.shiftKey || toolMode === "box" || toolMode === "ellipse" || toolMode === "pan") return;
    if (currentPolygonPoints.length >= 3) {
      await saveCurrentPolygon(toolMode === "crop" ? "__crop__" : undefined);
    }
  };

  // ─── Cursor style ───────────────────────────────────────────────────────────
  const getCursor = (): string => {
    if (!selectedImageId) return "default";
    if (toolMode === "pan" || isPanningRef.current) return dragStartRef.current ? "grabbing" : "grab";
    if (toolMode === "box" || toolMode === "ellipse") return "crosshair";
    if (toolMode === "crop") return "crosshair";

    if (currentPolygonPoints.length >= 3 && mouseImgRef.current && canvasRef.current && imgRef.current) {
      const imgW = imgRef.current.width;
      const imgH = imgRef.current.height;
      const box = getImageBox(canvasRef.current.width, canvasRef.current.height, imgW, imgH);
      const [fx, fy] = toCanvas(currentPolygonPoints[0], box);
      if (dist(mouseImgRef.current.x, mouseImgRef.current.y, fx, fy) < CLOSE_THRESHOLD / zoom) {
        return "cell";
      }
    }
    return "crosshair";
  };

  // ─── Status hint ────────────────────────────────────────────────────────────
  const getStatusHint = () => {
    if (!selectedImageId) return null;
    if (toolMode === "draw" && currentPolygonPoints.length > 0) {
      return currentPolygonPoints.length < 3
        ? `Add ${3 - currentPolygonPoints.length} more point${3 - currentPolygonPoints.length !== 1 ? "s" : ""} to close`
        : "Click first point or double-click to complete";
    }
    if (toolMode === "box") return "Click and drag to draw a box";
    if (toolMode === "ellipse") return isEllipseDrawingRef.current ? "Release to place ellipse" : "Click and drag to draw an ellipse";
    if (toolMode === "crop" && currentPolygonPoints.length > 0) return "Draw crop mask polygon";
    if (toolMode === "pan") return "Click and drag to pan";
    return null;
  };

  // ─── Empty states ────────────────────────────────────────────────────────────
  if (!selectedImageId) {
    return (
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-[#141414]"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-600 dark:text-[#444]">No image selected</p>
          <p className="text-xs text-gray-500 dark:text-[#333] mt-1">Upload images using the button above or the filmstrip below</p>
        </div>
      </div>
    );
  }

  const hint = getStatusHint();

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const canvasW = canvasRef.current?.width || 0;
  const canvasH = canvasRef.current?.height || 0;
  const imgW = imgRef.current?.naturalWidth || canvasW;
  const imgH = imgRef.current?.naturalHeight || canvasH;
  const renderBox = getImageBox(canvasW, canvasH, imgW, imgH);

  return (
    <div
      ref={containerRef}
      className="flex-1 relative bg-gray-50 dark:bg-[#141414] overflow-hidden"
    >
      <canvas
        ref={setCanvasElement}
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

      {/* Label Badges */}
      {selectedImage?.polygons.map((poly) => (
        poly.label !== "__crop__" && !hiddenPolygonIds.has(poly.id) && (
          <LabelBadge
            key={poly.id}
            polygon={poly}
            zoom={zoom}
            pan={pan}
            box={renderBox}
            dpr={dpr}
            canvasW={canvasW}
            canvasH={canvasH}
          />
        )
      ))}

      {/* Status hint */}
      {hint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-white/10 text-xs px-4 py-2 rounded-full text-[#aaa] pointer-events-none shadow-lg">
          {hint}
        </div>
      )}

      {/* Zoom level */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 text-[11px] font-mono px-3 py-1.5 rounded-lg text-[#888] pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>

      {/* Pan hint */}
      <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-[10px] px-2 py-1 rounded-md text-[#555] pointer-events-none">
        Scroll to zoom · Space + drag to pan
      </div>
    </div>
  );
});

export default AnnotationCanvas;
