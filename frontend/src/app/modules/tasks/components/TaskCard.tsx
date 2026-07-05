"use client";

import { useState, useRef } from "react";
import { Task, PRIORITY_META } from "@/app/types/tasks";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import { GripVertical, Pencil, Trash2, Tag, Calendar } from "lucide-react";
import { cn } from "@/app/lib/utils/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  draggable = true,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: TaskCardProps) {
  const priorityMeta = PRIORITY_META[task.priority];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart ? (e) => onDragStart(e, task) : undefined}
      onDragEnd={onDragEnd}
      className={cn(
        "group bg-card border border-border rounded-xl p-4 select-none",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
        isDragging && "opacity-40 scale-95 shadow-xl"
      )}
    >
      {/* Header: drag handle + priority badge + actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <GripVertical
            size={14}
            className="text-muted-foreground/40 cursor-grab active:cursor-grabbing shrink-0 group-hover:text-muted-foreground transition-colors"
          />
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
              priorityMeta.class
            )}
          >
            {priorityMeta.label}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-sm text-foreground leading-snug mb-1 pl-4">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3 pl-4 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer: due date + tags */}
      <div className="flex flex-wrap items-center gap-2 pl-4 mt-2">
        {task.due_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={11} />
            <span>{task.due_date}</span>
          </div>
        )}
        {task.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
          >
            <Tag size={10} />
            {tag}
          </span>
        ))}
        {task.tags.length > 3 && (
          <span className="text-xs text-muted-foreground">+{task.tags.length - 3}</span>
        )}
      </div>
    </div>
  );
}
