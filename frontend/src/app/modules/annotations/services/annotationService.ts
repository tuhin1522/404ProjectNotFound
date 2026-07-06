import axiosInstance from "@/app/services/axiosInstance";
import {
  AnnotationImage,
  Polygon,
  CreatePolygonPayload,
  UpdatePolygonPayload,
  ImageReorderItem,
  PaginatedResponse,
} from "@/app/types/annotations";

// ─── Images ───────────────────────────────────────────────────────────────────

export async function fetchImages(): Promise<AnnotationImage[]> {
  const res = await axiosInstance.get<PaginatedResponse<AnnotationImage>>(
    "/annotations/images/"
  );
  return res.data.results || [];
}

export async function uploadImage(file: File): Promise<AnnotationImage> {
  const formData = new FormData();
  formData.append("image", file);
  // Django's AnnotationImageUploadSerializer expects multipart/form-data
  const res = await axiosInstance.post<AnnotationImage>(
    "/annotations/images/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
}

export async function deleteImage(id: number): Promise<void> {
  await axiosInstance.delete(`/annotations/images/${id}/`);
}

export async function reorderImages(
  items: ImageReorderItem[]
): Promise<{ updated: number[] }> {
  const res = await axiosInstance.patch<{ updated: number[] }>(
    "/annotations/images/reorder/",
    items
  );
  return res.data;
}

// ─── Polygons ─────────────────────────────────────────────────────────────────

export async function fetchPolygonsByImage(imageId: number): Promise<Polygon[]> {
  const res = await axiosInstance.get<PaginatedResponse<Polygon>>(
    "/annotations/polygons/",
    {
      params: { image: imageId },
    }
  );
  return res.data.results || [];
}

export async function createPolygon(
  payload: CreatePolygonPayload
): Promise<Polygon> {
  const res = await axiosInstance.post<Polygon>("/annotations/polygons/", payload);
  return res.data;
}

export async function updatePolygon(
  id: number,
  payload: UpdatePolygonPayload
): Promise<Polygon> {
  const res = await axiosInstance.patch<Polygon>(
    `/annotations/polygons/${id}/`,
    payload
  );
  return res.data;
}

export async function deletePolygon(id: number): Promise<void> {
  await axiosInstance.delete(`/annotations/polygons/${id}/`);
}

export async function clearPolygons(imageId: number): Promise<{ deleted: number }> {
  const res = await axiosInstance.delete<{ deleted: number }>(
    "/annotations/polygons/clear/",
    {
      params: { image: imageId },
    }
  );
  return res.data;
}
