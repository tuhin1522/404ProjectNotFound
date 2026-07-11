"use client";

import { Pencil, Square, Circle, Crop, Hand, ZoomIn, ZoomOut, Maximize, Expand } from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";

type ToolMode = "draw" | "crop" | "box" | "ellipse" | "pan";

interface Tool {
  mode: ToolMode;
  icon: React.ReactNode;
  label: string;
  color?: string;
}

const drawingTools: Tool[] = [
  { mode: "draw", icon: <Pencil size={18} />, label: "Draw Polygon (P)", color: "#6366f1" },
  { mode: "box", icon: <Square size={18} />, label: "Box (B)", color: "#22c55e" },
  { mode: "ellipse", icon: <Circle size={18} />, label: "Ellipse (E)", color: "#f59e0b" },
  { mode: "crop", icon: <Crop size={18} />, label: "Crop Mask (C)", color: "#ef4444" },
  { mode: "pan", icon: <Hand size={18} />, label: "Pan (Space)", color: "#64748b" },
];

export default function LeftToolbar() {
  const { toolMode, setToolMode, zoom, setZoom, setPan, currentColor, setColor } = useAnnotationStore();

  const activeColors: Record<ToolMode, string> = {
    draw: "#6366f1",
    box: "#22c55e",
    ellipse: "#f59e0b",
    crop: "#ef4444",
    pan: "#64748b",
  };

  const presetColors = [
    "#6366f1", // indigo
    "#22c55e", // green
    "#ef4444", // red
    "#f59e0b", // amber
    "#0ea5e9", // sky
    "#ec4899", // pink
    "#ffffff", // white
  ];

  return (
    <aside className="flex-shrink-0 w-12 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a] flex flex-col items-center py-3 gap-1 z-10">
      {/* Drawing tools */}
      {drawingTools.map((tool) => {
        const isActive = toolMode === tool.mode;
        return (
          <button
            key={tool.mode}
            onClick={() => setToolMode(tool.mode)}
            title={tool.label}
            className={`
              relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-150
              ${isActive
                ? "text-gray-900 dark:text-white shadow-lg"
                : "text-gray-500 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
              }
            `}
            style={isActive ? {
              backgroundColor: activeColors[tool.mode] + "22",
              color: activeColors[tool.mode],
              boxShadow: `0 0 0 1px ${activeColors[tool.mode]}44`,
            } : {}}
          >
            {tool.icon}
            {isActive && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                style={{ backgroundColor: activeColors[tool.mode] }}
              />
            )}
          </button>
        );
      })}

      {/* Divider */}
      <div className="w-6 h-px bg-gray-200 dark:bg-[#2a2a2a] my-2" />

      {/* Zoom controls */}
      <button
        onClick={() => setZoom((z) => Math.min(10, parseFloat((z + 0.25).toFixed(2))))}
        title="Zoom In (+)"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-all"
      >
        <ZoomIn size={18} />
      </button>

      <button
        onClick={() => setZoom((z) => Math.max(0.1, parseFloat((z - 0.25).toFixed(2))))}
        title="Zoom Out (-)"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-all"
      >
        <ZoomOut size={18} />
      </button>

      <button
        onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        title="Reset Zoom (1:1)"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-all"
      >
        <Maximize size={16} />
      </button>

      <button
        onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
        title="Fit Screen"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-all"
      >
        <Expand size={16} />
      </button>

      {/* Divider */}
      <div className="w-6 h-px bg-gray-200 dark:bg-[#2a2a2a] my-2" />

      {/* Color Palette */}
      <div className="flex flex-col gap-1.5 items-center w-full px-1">
        {presetColors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={`Select color ${c}`}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              currentColor === c
                ? "border-white scale-110 shadow-lg"
                : "border-transparent hover:scale-110"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </aside>
  );
}
