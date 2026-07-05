import axiosInstance from "@/app/services/axiosInstance";
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  ReorderItem,
} from "@/app/types/tasks";

// ─── Interfaces for Paginated Responses ────────────────────────────────────────
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── GET /api/tasks/?due_date=YYYY-MM-DD ─────────────────────────────────────
export async function fetchTasksByDate(date: string): Promise<Task[]> {
  const res = await axiosInstance.get<PaginatedResponse<Task>>("/tasks/", {
    params: { due_date: date },
  });
  return res.data.results || []; // Extract from paginated response
}

// ─── GET /api/tasks/ (all tasks) ─────────────────────────────────────────────
export async function fetchAllTasks(): Promise<Task[]> {
  const res = await axiosInstance.get<PaginatedResponse<Task>>("/tasks/");
  return res.data.results || [];
}

// ─── POST /api/tasks/ ─────────────────────────────────────────────────────────
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await axiosInstance.post<Task>("/tasks/", payload);
  return res.data;
}

// ─── PATCH /api/tasks/:id/ ────────────────────────────────────────────────────
export async function updateTask(
  id: number,
  payload: UpdateTaskPayload
): Promise<Task> {
  const res = await axiosInstance.patch<Task>(`/tasks/${id}/`, payload);
  return res.data;
}

// ─── DELETE /api/tasks/:id/ ───────────────────────────────────────────────────
export async function deleteTask(id: number): Promise<void> {
  await axiosInstance.delete(`/tasks/${id}/`);
}

// ─── PATCH /api/tasks/reorder/ ───────────────────────────────────────────────
// Body: [{ id, column, order }, ...]
export async function reorderTasks(
  items: ReorderItem[]
): Promise<{ updated: number[] }> {
  const res = await axiosInstance.patch<{ updated: number[] }>(
    "/tasks/reorder/",
    items
  );
  return res.data;
}
