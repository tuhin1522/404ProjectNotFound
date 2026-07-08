import React, { useState, useRef, useEffect } from "react";
import { Tag, Plus, Edit2, Trash2, Check, X } from "lucide-react";
import { useAnnotationStore } from "../store/useAnnotationStore";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#10b981", // Emerald
];

export function LabelManager() {
  const {
    labels,
    activeLabelId,
    setActiveLabel,
    createLabel,
    updateLabel,
    deleteLabel,
  } = useAnnotationStore();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(PRESET_COLORS[0]);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleCreate = async () => {
    if (!draftName.trim()) return;
    const name = draftName.trim();
    const color = draftColor;
    setIsCreating(false);
    setDraftName("");
    try {
      await createLabel(name, color);
      toast.success("Label created.");
    } catch {
      setIsCreating(true);
      setDraftName(name);
      setDraftColor(color);
      toast.error("Failed to create label.");
    }
  };

  const handleUpdate = async (id: number) => {
    if (!draftName.trim()) return;
    const name = draftName.trim();
    const color = draftColor;
    setEditingId(null);
    try {
      await updateLabel(id, { name, color });
      toast.success("Label updated.");
    } catch {
      setEditingId(id);
      setDraftName(name);
      setDraftColor(color);
      toast.error("Failed to update label.");
    }
  };

  const startEdit = (id: number, name: string, color: string) => {
    setEditingId(id);
    setIsCreating(false);
    setDraftName(name);
    setDraftColor(color);
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setDraftName("");
    setDraftColor(PRESET_COLORS[0]);
  };

  const activeLabel = labels.find((l) => l.id === activeLabelId);

  return (
    <div className="relative flex items-center" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          isOpen || activeLabelId
            ? "border-primary text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="Manage Labels (L)"
      >
        <Tag size={14} />
        {activeLabel ? (
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeLabel.color }}
            />
            {activeLabel.name}
          </div>
        ) : (
          "Select Label"
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Labels</h3>
            <button
              onClick={startCreate}
              className="w-6 h-6 flex items-center justify-center rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="Create new label"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            {labels.length === 0 && !isCreating && (
              <p className="text-xs text-muted-foreground italic py-2 text-center">
                No labels created yet.
              </p>
            )}

            {labels.map((label) => (
              <div key={label.id} className="flex items-center gap-2 group">
                {editingId === label.id ? (
                  <div className="flex flex-col gap-2 w-full bg-muted/50 p-2 rounded-md border border-border">
                    <input
                      autoFocus
                      className="text-xs bg-card border border-border rounded px-2 py-1 outline-none focus:border-primary"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      placeholder="Label name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(label.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="color"
                        value={draftColor}
                        onChange={(e) => setDraftColor(e.target.value)}
                        className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => handleUpdate(label.id)}
                          className="p-1 text-primary hover:text-primary/80"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setActiveLabel(activeLabelId === label.id ? null : label.id);
                      setIsOpen(false);
                    }}
                    className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-md text-left text-xs transition-colors ${
                      activeLabelId === label.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                  </button>
                )}

                {editingId !== label.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(label.id, label.name, label.color);
                      }}
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLabel(label.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isCreating && (
              <div className="flex flex-col gap-2 w-full bg-muted/50 p-2 rounded-md border border-border mt-1">
                <input
                  autoFocus
                  className="text-xs bg-card border border-border rounded px-2 py-1 outline-none focus:border-primary"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="New label name"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setIsCreating(false);
                  }}
                />
                <div className="flex items-center justify-between">
                  <input
                    type="color"
                    value={draftColor}
                    onChange={(e) => setDraftColor(e.target.value)}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={handleCreate}
                      className="p-1 text-primary hover:text-primary/80"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
