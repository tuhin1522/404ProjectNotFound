"use client";

import { useState, useRef, useEffect } from "react";
import {
  Trash2, Tag, Edit2, Check, X, Eye, EyeOff,
  ChevronDown, ChevronRight, Plus, Circle, Square, Pencil, Scissors
} from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import { Polygon, AnnotationLabel } from "@/app/types/annotations";
import { inferShapeType } from "../utils/downloadUtils";

// ─── Shape icon helper ────────────────────────────────────────────────────────

function ShapeIcon({ polygon }: { polygon: Polygon }) {
  const type = inferShapeType(polygon.points.length);
  const cls = "flex-shrink-0";
  if (type === "ellipse") return <Circle size={12} className={cls} />;
  if (type === "box") return <Square size={12} className={cls} />;
  if (polygon.label === "__crop__") return <Scissors size={12} className={cls} />;
  return <Pencil size={12} className={cls} />;
}

function shapeLabel(polygon: Polygon): string {
  if (polygon.label === "__crop__") return "Crop Mask";
  const type = inferShapeType(polygon.points.length);
  if (type === "ellipse") return "Ellipse";
  if (type === "box") return "Box";
  return "Polygon";
}

// ─── Object Item ──────────────────────────────────────────────────────────────

function ObjectItem({
  polygon,
  index,
  isSelected,
  isHidden,
  onSelect,
  onDelete,
  onUpdate,
  onToggleVisibility,
}: {
  polygon: Polygon;
  index: number;
  isSelected: boolean;
  isHidden: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, payload: { label?: string }) => Promise<void>;
  onToggleVisibility: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(polygon.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
    else setEditLabel(polygon.label || "");
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

  const displayName = polygon.label && polygon.label !== "__crop__"
    ? polygon.label
    : `${shapeLabel(polygon)} ${index + 1}`;

  return (
    <div
      onClick={() => { if (!isEditing) onSelect(polygon.id); }}
      className={`
        group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer
        transition-all duration-150 border text-xs
        ${isSelected
          ? "border-indigo-500/40 bg-indigo-500/10"
          : "border-transparent hover:bg-[#1e1e1e]"
        }
        ${isHidden ? "opacity-40" : ""}
      `}
    >
      {/* Color + Shape icon */}
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (polygon.color || "#6366f1") + "33", color: polygon.color || "#6366f1" }}
      >
        <ShapeIcon polygon={polygon} />
      </div>

      {/* Label */}
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
            className="w-full bg-[#111] border border-indigo-500 outline-none rounded px-1.5 py-0.5 text-[11px] text-white"
            placeholder="Label"
          />
        ) : (
          <p className="truncate text-[11px] font-medium text-[#ccc]" title={displayName}>
            {displayName}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button onClick={handleSave} className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors" title="Save">
              <Check size={11} />
            </button>
            <button onClick={handleCancel} className="p-1 text-[#555] hover:text-[#aaa] transition-colors" title="Cancel">
              <X size={11} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(polygon.id); }}
              className="p-1 text-[#555] hover:text-[#aaa] transition-colors"
              title={isHidden ? "Show" : "Hide"}
            >
              {isHidden ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="p-1 text-[#555] hover:text-[#aaa] transition-colors"
              title="Rename"
            >
              <Edit2 size={11} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(polygon.id); }}
              className="p-1 text-[#555] hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────

function Section({
  title,
  defaultOpen = true,
  badge,
  children,
  action,
}: {
  title: string;
  defaultOpen?: boolean;
  badge?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#888] transition-colors select-none">
        <div className="flex items-center gap-2 cursor-pointer flex-1" onClick={() => setOpen(!open)}>
          {open ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
          {title}
          {badge !== undefined && badge > 0 && (
            <span className="ml-auto bg-indigo-500/20 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {action && <span>{action}</span>}
      </div>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── Label Panel ──────────────────────────────────────────────────────────────

function LabelsPanel() {
  const {
    labels, activeLabelId, setActiveLabel,
    createLabel, deleteLabel, updateLabel,
  } = useAnnotationStore();

  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("#6366f1");

  const handleCreate = async () => {
    if (!draftName.trim()) return;
    await createLabel(draftName.trim(), draftColor);
    setIsCreating(false);
    setDraftName("");
  };

  return (
    <div className="px-2 pb-2">
      {labels.length === 0 && !isCreating && (
        <p className="text-[11px] text-[#444] italic text-center py-3">No labels yet</p>
      )}
      <div className="flex flex-col gap-1">
        {labels.map((label: AnnotationLabel) => (
          <button
            key={label.id}
            onClick={() => setActiveLabel(activeLabelId === label.id ? null : label.id)}
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-all ${
              activeLabelId === label.id
                ? "bg-indigo-500/15 border border-indigo-500/30 text-white"
                : "text-[#888] hover:bg-[#1e1e1e] border border-transparent"
            }`}
          >
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: label.color }} />
            <span className="flex-1 truncate font-medium">{label.name}</span>
            {activeLabelId === label.id && (
              <span className="text-[9px] text-indigo-400 font-bold">ACTIVE</span>
            )}
          </button>
        ))}
      </div>

      {isCreating && (
        <div className="mt-2 flex flex-col gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
          <input
            autoFocus
            className="w-full bg-[#111] border border-[#333] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500 placeholder-[#444]"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Label name"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setIsCreating(false); }}
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draftColor}
              onChange={(e) => setDraftColor(e.target.value)}
              className="w-7 h-7 p-0.5 border border-[#333] rounded-lg cursor-pointer bg-[#111]"
            />
            <div className="flex gap-1 flex-wrap">
              {["#6366f1", "#22c55e", "#ef4444", "#f59e0b", "#0ea5e9", "#ec4899"].map(c => (
                <button key={c} onClick={() => setDraftColor(c)}
                  className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${draftColor === c ? "ring-2 ring-white scale-110" : ""}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
            <button onClick={handleCreate} className="ml-auto p-1 text-indigo-400 hover:text-indigo-300"><Check size={13} /></button>
            <button onClick={() => setIsCreating(false)} className="p-1 text-[#555] hover:text-[#aaa]"><X size={13} /></button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsCreating(true)}
        className="mt-2 w-full flex items-center justify-center gap-1.5 h-7 rounded-lg border border-dashed border-[#2a2a2a] text-[#444] hover:border-indigo-500/40 hover:text-indigo-400 text-[11px] transition-all"
      >
        <Plus size={11} />
        New Label
      </button>
    </div>
  );
}

// ─── Properties Panel ─────────────────────────────────────────────────────────

function PropertiesPanel({ polygon }: { polygon: Polygon }) {
  const type = inferShapeType(polygon.points.length);
  const shapeType = type === "ellipse" ? "Ellipse" : type === "box" ? "Box" : "Polygon";
  const created = new Date(polygon.created_at);

  const rows = [
    { key: "Label", value: polygon.label || <span className="italic text-[#444]">Unlabelled</span> },
    {
      key: "Color", value: (
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: polygon.color }} />
          {polygon.color}
        </span>
      )
    },
    { key: "Shape", value: shapeType },
    { key: "Points", value: polygon.points.length },
    {
      key: "Created", value: created.toLocaleString([], {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      })
    },
  ];

  return (
    <div className="px-3 pb-3">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {rows.map((row, i) => (
          <div key={row.key} className={`flex items-start gap-2 px-3 py-2 ${i !== rows.length - 1 ? "border-b border-[#1f1f1f]" : ""}`}>
            <span className="text-[10px] text-[#444] w-14 flex-shrink-0 pt-0.5">{row.key}</span>
            <span className="text-[11px] text-[#aaa] flex-1">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function AnnotationSidebar() {
  const {
    images,
    selectedImageId,
    selectedPolygonId,
    selectPolygon,
    updatePolygon,
    deletePolygon,
    clearAllPolygons,
    hiddenPolygonIds,
    togglePolygonVisibility,
  } = useAnnotationStore();

  const selectedImage = images.find((img) => img.id === selectedImageId);
  const polygons = selectedImage?.polygons ?? [];
  const visibleObjects = polygons.filter(p => p.label !== "__crop__");
  const selectedPolygon = polygons.find(p => p.id === selectedPolygonId);

  return (
    <aside className="flex-shrink-0 w-56 bg-[#111111] border-l border-[#2a2a2a] flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#2a2a2a transparent" }}>

        {/* Labels */}
        <Section title="Labels" badge={0} defaultOpen>
          <LabelsPanel />
        </Section>

        <div className="h-px bg-[#1e1e1e] mx-3" />

        {/* Objects */}
        <Section
          title="Objects"
          badge={visibleObjects.length}
          defaultOpen
          action={
            visibleObjects.length > 0 ? (
              <button
                onClick={(e) => { e.stopPropagation(); clearAllPolygons(); }}
                className="text-[9px] text-red-500/60 hover:text-red-400 transition-colors font-medium"
                title="Clear all annotations"
              >
                Clear all
              </button>
            ) : undefined
          }
        >
          <div className="px-2 pb-2 flex flex-col gap-0.5">
            {!selectedImageId && (
              <p className="text-[11px] text-[#333] italic text-center py-4">Select an image</p>
            )}
            {selectedImageId && visibleObjects.length === 0 && (
              <p className="text-[11px] text-[#333] italic text-center py-4">No annotations yet</p>
            )}
            {visibleObjects.map((polygon, index) => (
              <ObjectItem
                key={polygon.id}
                polygon={polygon}
                index={index}
                isSelected={selectedPolygonId === polygon.id}
                isHidden={hiddenPolygonIds.has(polygon.id)}
                onSelect={(id) => selectPolygon(id === selectedPolygonId ? null : id)}
                onDelete={deletePolygon}
                onUpdate={updatePolygon}
                onToggleVisibility={togglePolygonVisibility}
              />
            ))}
          </div>
        </Section>

        {/* Properties */}
        {selectedPolygon && (
          <>
            <div className="h-px bg-[#1e1e1e] mx-3" />
            <Section title="Properties" defaultOpen>
              <PropertiesPanel polygon={selectedPolygon} />
            </Section>
          </>
        )}
      </div>
    </aside>
  );
}
