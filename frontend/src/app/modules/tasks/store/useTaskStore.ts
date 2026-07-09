import { create } from "zustand";
import { Task, TaskColumn, BoardColumns, CreateTaskPayload, UpdateTaskPayload, ReorderItem } from "@/app/types/tasks";
import {
  fetchTasksByDate,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  reorderTasks as apiReorderTasks,
} from "@/app/modules/tasks/services/tasks.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tasksToColumns(tasks: Task[]): BoardColumns {
  const columns: BoardColumns = { todo: [], in_progress: [], done: [] };
  for (const task of tasks) {
    columns[task.column].push(task);
  }
  // Sort each column by order ascending
  for (const key of Object.keys(columns) as TaskColumn[]) {
    columns[key].sort((a, b) => a.order - b.order);
  }
  return columns;
}

// ─── Store Shape ─────────────────────────────────────────────────────────────

interface TaskStore {
  // State
  selectedDate: string; // "YYYY-MM-DD"
  columns: BoardColumns;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  loadTasksForDate: (date: string) => Promise<void>;
  addTask: (payload: CreateTaskPayload) => Promise<Task>;
  editTask: (id: number, payload: UpdateTaskPayload) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  moveTask: (taskId: number, toColumn: TaskColumn, items: ReorderItem[]) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTaskStore = create<TaskStore>((set, get) => ({
  selectedDate: new Date().toISOString().slice(0, 10),
  columns: { todo: [], in_progress: [], done: [] },
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().loadTasksForDate(date);
  },

  loadTasksForDate: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await fetchTasksByDate(date);
      set({ columns: tasksToColumns(tasks), isLoading: false });
    } catch {
      set({ error: "Failed to load tasks.", isLoading: false });
    }
  },

  addTask: async (payload) => {
    const task = await apiCreateTask(payload);
    set((state) => {
      const updated = { ...state.columns };
      updated[task.column] = [...updated[task.column], task];
      return { columns: updated };
    });
    return task;
  },

  editTask: async (id, payload) => {
    const updated = await apiUpdateTask(id, payload);
    set((state) => {
      const cols = { ...state.columns };
      // Remove from all columns, then re-insert in correct column
      for (const col of Object.keys(cols) as TaskColumn[]) {
        cols[col] = cols[col].filter((t) => t.id !== id);
      }
      cols[updated.column] = [...cols[updated.column], updated].sort(
        (a, b) => a.order - b.order
      );
      return { columns: cols };
    });
  },

  removeTask: async (id) => {
    // Optimistic delete
    set((state) => {
      const cols = { ...state.columns };
      for (const col of Object.keys(cols) as TaskColumn[]) {
        cols[col] = cols[col].filter((t) => t.id !== id);
      }
      return { columns: cols };
    });
    await apiDeleteTask(id);
  },

  moveTask: async (taskId, toColumn, items) => {
    // Apply optimistic UI update immediately
    set((state) => {
      const cols: BoardColumns = { todo: [], in_progress: [], done: [] };
      const allTasks = [
        ...state.columns.todo,
        ...state.columns.in_progress,
        ...state.columns.done,
      ];

      // Build a lookup map from the reorder items
      const itemMap = new Map(items.map((i) => [i.id, i]));

      for (const task of allTasks) {
        const update = itemMap.get(task.id);
        const updatedTask: Task = update
          ? { ...task, column: update.column, order: update.order }
          : task;
        cols[updatedTask.column].push(updatedTask);
      }

      for (const col of Object.keys(cols) as TaskColumn[]) {
        cols[col].sort((a, b) => a.order - b.order);
      }

      return { columns: cols };
    });

    // Sync with backend
    try {
      await apiReorderTasks(items);
    } catch (err) {
      // If backend fails, reload to get consistent state
      get().loadTasksForDate(get().selectedDate);
    }
  },
}));
