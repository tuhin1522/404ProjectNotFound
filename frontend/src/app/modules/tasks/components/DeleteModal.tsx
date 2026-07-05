"use client";

import { Task } from "@/app/types/tasks";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useState } from "react";

interface DeleteModalProps {
  task: Task;
  onClose: () => void;
}

export default function DeleteModal({ task, onClose }: DeleteModalProps) {
  const { removeTask } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await removeTask(task.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <h2 className="text-base font-bold">Delete Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">"{task.title}"</span>?
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-secondary/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
