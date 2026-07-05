"use client";

import { useState, useRef } from "react";
import { Task, TaskColumn, ColumnMeta, ReorderItem } from "@/app/types/tasks";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import TaskCard from "./TaskCard";
import { Plus, ClipboardList } from "lucide-react";
import { cn } from "@/app/lib/utils/utils";

interface ColumnProps {
  meta: ColumnMeta;
  tasks: Task[];
  onAddTask: (column: TaskColumn) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  draggingTaskId: number | null;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetColumn: TaskColumn, targetIndex?: number) => void;
}

export default function Column({
  meta,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  draggingTaskId,
  onDragStart,
  onDragEnd,
  onDrop,
}: ColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, meta.id);
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-secondary/30 rounded-2xl border border-border border-t-4 min-h-[520px] transition-colors",
        meta.headerClass,
        isDragOver && "bg-secondary/60 border-primary/30"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full", meta.dotClass)} />
          <h3 className={cn("font-bold text-sm uppercase tracking-wider", meta.color)}>
            {meta.label}
          </h3>
          <span className="ml-1 text-xs font-semibold bg-card border border-border text-muted-foreground px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(meta.id)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label={`Add task to ${meta.label}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-2.5 px-3 pb-3 flex-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
            <ClipboardList size={28} className="text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/50">No tasks yet</p>
            <button
              onClick={() => onAddTask(meta.id)}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Add one
            </button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingTaskId === task.id}
            />
          ))
        )}

        {/* Drop zone indicator */}
        {isDragOver && (
          <div className="border-2 border-dashed border-primary/40 rounded-xl h-16 flex items-center justify-center bg-primary/5 transition-all">
            <p className="text-xs text-primary/60 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}
