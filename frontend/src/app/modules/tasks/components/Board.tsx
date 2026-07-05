"use client";

import { useState, useRef, useCallback } from "react";
import { Task, TaskColumn, COLUMN_META, ReorderItem } from "@/app/types/tasks";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import Column from "./Column";
import TaskModal from "./TaskModal";
import DeleteModal from "./DeleteModal";
import { Loader2, ServerCrash, RefreshCw } from "lucide-react";

export default function Board() {
  const { columns, isLoading, error, selectedDate, loadTasksForDate } = useTaskStore();

  // Modal state
  const [taskModal, setTaskModal] = useState<{
    mode: "create" | "edit";
    column?: TaskColumn;
    task?: Task;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  // Drag state
  const draggingTaskRef = useRef<Task | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    draggingTaskRef.current = task;
    setDraggingTaskId(task.id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    draggingTaskRef.current = null;
    setDraggingTaskId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetColumn: TaskColumn) => {
      e.preventDefault();
      const draggedTask = draggingTaskRef.current;
      if (!draggedTask) return;

      const allTasks = [
        ...columns.todo,
        ...columns.in_progress,
        ...columns.done,
      ];

      // Build the new order
      const targetTasks = allTasks.filter(
        (t) => t.column === targetColumn && t.id !== draggedTask.id
      );
      const movedTask: Task = { ...draggedTask, column: targetColumn };
      const newTargetTasks = [...targetTasks, movedTask];

      // Build reorder payload for all columns that changed
      const reorderItems: ReorderItem[] = [];

      for (const col of ["todo", "in_progress", "done"] as TaskColumn[]) {
        let colTasks: Task[];
        if (col === targetColumn) {
          colTasks = newTargetTasks;
        } else if (col === draggedTask.column) {
          colTasks = allTasks.filter((t) => t.column === col && t.id !== draggedTask.id);
        } else {
          colTasks = allTasks.filter((t) => t.column === col);
        }

        colTasks.forEach((t, idx) => {
          reorderItems.push({ id: t.id, column: col, order: idx });
        });
      }

      useTaskStore.getState().moveTask(draggedTask.id, targetColumn, reorderItems);
      setDraggingTaskId(null);
      draggingTaskRef.current = null;
    },
    [columns]
  );

  // ── Render states ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={36} className="animate-spin text-primary" />
          <p className="text-sm">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <ServerCrash size={36} className="text-destructive" />
          <p className="text-sm font-medium text-foreground">{error}</p>
          <button
            onClick={() => loadTasksForDate(selectedDate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm hover:bg-accent transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMN_META.map((meta) => (
          <Column
            key={meta.id}
            meta={meta}
            tasks={columns[meta.id]}
            onAddTask={(col) => setTaskModal({ mode: "create", column: col })}
            onEditTask={(task) => setTaskModal({ mode: "edit", task })}
            onDeleteTask={setDeleteTarget}
            draggingTaskId={draggingTaskId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Modals */}
      {taskModal && (
        <TaskModal
          mode={taskModal.mode}
          defaultColumn={taskModal.column}
          task={taskModal.task}
          onClose={() => setTaskModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
