"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { useTaskStore } from "@/app/modules/tasks/store/useTaskStore";
import DateSelector from "@/app/modules/tasks/components/DateSelector";
import Board from "@/app/modules/tasks/components/Board";
import { LayoutDashboard } from "lucide-react";

export default function TasksPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { selectedDate, loadTasksForDate, columns } = useTaskStore();

  // Load tasks for today on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadTasksForDate(selectedDate);
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalTasks =
    columns.todo.length + columns.in_progress.length + columns.done.length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Page header */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <LayoutDashboard size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
                <p className="text-sm text-muted-foreground">
                  {totalTasks === 0
                    ? "No tasks for this day"
                    : `${totalTasks} task${totalTasks !== 1 ? "s" : ""} scheduled`}
                </p>
              </div>
            </div>

            {/* Stats pill */}
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 rounded-full bg-info/10 text-info font-medium">
                {columns.todo.length} To Do
              </span>
              <span className="px-3 py-1 rounded-full bg-warning/10 text-warning font-medium">
                {columns.in_progress.length} In Progress
              </span>
              <span className="px-3 py-1 rounded-full bg-success/10 text-success font-medium">
                {columns.done.length} Done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        {/* Date selector */}
        <DateSelector />

        {/* Kanban board */}
        <Board />
      </div>
    </div>
  );
}
