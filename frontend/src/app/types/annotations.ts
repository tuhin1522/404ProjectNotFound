// ─── Core Models (Mirror Django Serialization) ─────────────────────────────────

export interface Point {
  x: number; // 0.0 to 1.0 (relative width)
  y: number; // 0.0 to 1.0 (relative height)
}

export interface Polygon {
  id: number;
  image: number; // Foreign key to AnnotationImage ID
  points: Point[];
  label: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AnnotationImage {
  id: number;
  name: string;
  image_url: string;
  order: number;
  polygon_count: number;
  polygons: Polygon[]; // Nested representation from GET /images/
  created_at: string;
  updated_at: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreatePolygonPayload {
  image: number;
  points: Point[];
  label?: string;
  color?: string;
}

export interface UpdatePolygonPayload {
  points?: Point[];
  label?: string;
  color?: string;
}

export interface ImageReorderItem {
  id: number;
  order: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
