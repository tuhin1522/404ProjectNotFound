// ─── Column & Priority Enums ──────────────────────────────────────────────────

export type TaskColumn = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

// ─── Core Task Model (mirrors the Django serializer fields) ───────────────────

export interface Task {
  id: number;
  title: string;
  description: string;
  column: TaskColumn;
  priority: TaskPriority;
  due_date: string; // "YYYY-MM-DD"
  tags: string[];
  order: number;
  created_at: string;
  updated_at: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string;
  description?: string;
  column?: TaskColumn;
  priority?: TaskPriority;
  due_date: string;
  tags?: string[];
  order?: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  column?: TaskColumn;
  priority?: TaskPriority;
  due_date?: string;
  tags?: string[];
  order?: number;
}

export interface ReorderItem {
  id: number;
  column: TaskColumn;
  order: number;
}

// ─── Grouped Board State ──────────────────────────────────────────────────────

export interface BoardColumns {
  todo: Task[];
  in_progress: Task[];
  done: Task[];
}

// ─── Column Metadata (for rendering) ─────────────────────────────────────────

export interface ColumnMeta {
  id: TaskColumn;
  label: string;
  color: string;
  headerClass: string;
  dotClass: string;
}

export const COLUMN_META: ColumnMeta[] = [
  {
    id: "todo",
    label: "To Do",
    color: "text-info",
    headerClass: "border-t-info",
    dotClass: "bg-info",
  },
  {
    id: "in_progress",
    label: "In Progress",
    color: "text-warning",
    headerClass: "border-t-warning",
    dotClass: "bg-warning",
  },
  {
    id: "done",
    label: "Done",
    color: "text-success",
    headerClass: "border-t-success",
    dotClass: "bg-success",
  },
];

export const PRIORITY_META = {
  low: { label: "Low", class: "bg-success/15 text-success border-success/30" },
  medium: { label: "Medium", class: "bg-warning/15 text-warning border-warning/30" },
  high: { label: "High", class: "bg-destructive/15 text-destructive border-destructive/30" },
};
