import { create } from "zustand";
import { AnnotationImage, Polygon, Point, AnnotationLabel } from "@/app/types/annotations";
import {
  fetchImages,
  uploadImage as apiUploadImage,
  deleteImage as apiDeleteImage,
  createPolygon as apiCreatePolygon,
  updatePolygon as apiUpdatePolygon,
  deletePolygon as apiDeletePolygon,
  clearPolygons as apiClearPolygons,
  fetchLabels as apiFetchLabels,
  createLabel as apiCreateLabel,
  updateLabel as apiUpdateLabel,
  deleteLabel as apiDeleteLabel,
} from "../services/annotationService";

interface AnnotationStore {
  // ─── Image State ───────────────────────────────────────────────────────────
  images: AnnotationImage[];
  selectedImageId: number | null;
  isImagesLoading: boolean;
  imagesError: string | null;

  // ─── Drawing & Canvas State ─────────────────────────────────────────────────
  currentPolygonPoints: Point[];
  redoStack: Point[];
  currentColor: string;
  currentLabel: string;
  selectedPolygonId: number | null;
  toolMode: "draw" | "crop" | "box" | "ellipse" | "pan";
  zoom: number;
  pan: { x: number; y: number };

  // ─── Visibility State ────────────────────────────────────────────────────────
  hiddenPolygonIds: Set<number>;

  // ─── Labels State ───────────────────────────────────────────────────────────
  labels: AnnotationLabel[];
  activeLabelId: number | null;
  isLabelsLoading: boolean;

  // ─── Actions: Images ────────────────────────────────────────────────────────
  loadImages: () => Promise<void>;
  selectImage: (id: number) => void;
  selectNextImage: () => void;
  selectPrevImage: () => void;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;

  // ─── Actions: Drawing & Canvas ──────────────────────────────────────────────
  setToolMode: (mode: "draw" | "crop" | "box" | "ellipse" | "pan") => void;
  setZoom: (zoom: number | ((z: number) => number)) => void;
  setPan: (pan: { x: number; y: number } | ((p: { x: number; y: number }) => { x: number; y: number })) => void;
  addPointToCurrentPolygon: (point: Point) => void;
  undoLastPoint: () => void;
  redoLastPoint: () => void;
  clearCurrentPolygon: () => void;
  setColor: (color: string) => void;
  setLabel: (label: string) => void;
  selectPolygon: (id: number | null) => void;

  // ─── Actions: Visibility ────────────────────────────────────────────────────
  togglePolygonVisibility: (id: number) => void;

  // ─── Actions: Polygons ──────────────────────────────────────────────────────
  saveCurrentPolygon: (labelOverride?: string) => Promise<void>;
  updatePolygon: (id: number, payload: { label?: string; color?: string; label_position?: {x: number, y: number} | null }) => Promise<void>;
  deletePolygon: (id: number) => Promise<void>;
  clearAllPolygons: () => Promise<void>;

  // ─── Actions: Labels ────────────────────────────────────────────────────────
  loadLabels: () => Promise<void>;
  createLabel: (name: string, color: string) => Promise<void>;
  updateLabel: (id: number, payload: { name?: string; color?: string }) => Promise<void>;
  deleteLabel: (id: number) => Promise<void>;
  setActiveLabel: (id: number | null) => void;
}

export const useAnnotationStore = create<AnnotationStore>((set, get) => ({
  images: [],
  selectedImageId: null,
  isImagesLoading: false,
  imagesError: null,

  currentPolygonPoints: [],
  redoStack: [],
  currentColor: "#6366f1",
  currentLabel: "",
  selectedPolygonId: null,
  toolMode: "draw",
  zoom: 1,
  pan: { x: 0, y: 0 },

  hiddenPolygonIds: new Set<number>(),

  labels: [],
  activeLabelId: null,
  isLabelsLoading: false,

  loadImages: async () => {
    set({ isImagesLoading: true, imagesError: null });
    try {
      const images = await fetchImages();
      set({
        images,
        isImagesLoading: false,
        selectedImageId:
          get().selectedImageId ?? (images.length > 0 ? images[0].id : null),
      });
    } catch {
      set({ imagesError: "Failed to load images.", isImagesLoading: false });
    }
  },

  selectImage: (id: number) => {
    set({
      selectedImageId: id,
      currentPolygonPoints: [],
      redoStack: [],
      selectedPolygonId: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
    });
  },

  selectNextImage: () => {
    const { images, selectedImageId, selectImage } = get();
    if (images.length === 0) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImageId);
    if (currentIndex === -1 || currentIndex === images.length - 1) return;
    selectImage(images[currentIndex + 1].id);
  },

  selectPrevImage: () => {
    const { images, selectedImageId, selectImage } = get();
    if (images.length === 0) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImageId);
    if (currentIndex <= 0) return;
    selectImage(images[currentIndex - 1].id);
  },

  uploadImage: async (file: File) => {
    try {
      const newImage = await apiUploadImage(file);
      set((state) => ({
        images: [...state.images, newImage],
        selectedImageId: newImage.id,
      }));
    } catch (err: any) {
      console.error("Upload failed", err);
      throw err;
    }
  },

  deleteImage: async (id: number) => {
    set((state) => {
      const newImages = state.images.filter((img) => img.id !== id);
      return {
        images: newImages,
        selectedImageId:
          state.selectedImageId === id
            ? newImages.length > 0 ? newImages[0].id : null
            : state.selectedImageId,
      };
    });
    try {
      await apiDeleteImage(id);
    } catch {
      get().loadImages();
    }
  },

  // Adding a new point clears the redo stack (just like any text editor)
  addPointToCurrentPolygon: (point: Point) => {
    set((state) => ({
      currentPolygonPoints: [...state.currentPolygonPoints, point],
      redoStack: [], // new action invalidates redo history
    }));
  },

  // Undo: pop the last point and push it onto the redo stack
  undoLastPoint: () => {
    set((state) => {
      if (state.currentPolygonPoints.length === 0) return state;
      const points = [...state.currentPolygonPoints];
      const removed = points.pop()!;
      return {
        currentPolygonPoints: points,
        redoStack: [...state.redoStack, removed],
      };
    });
  },

  // Redo: pop from redo stack and push back onto current points
  redoLastPoint: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const redo = [...state.redoStack];
      const restored = redo.pop()!;
      return {
        currentPolygonPoints: [...state.currentPolygonPoints, restored],
        redoStack: redo,
      };
    });
  },

  clearCurrentPolygon: () => {
    set({ currentPolygonPoints: [], redoStack: [] });
  },

  setToolMode: (mode) => set({ toolMode: mode, currentPolygonPoints: [], redoStack: [] }),

  setZoom: (zoom) => set((state) => ({
    zoom: typeof zoom === "function" ? zoom(state.zoom) : zoom
  })),

  setPan: (pan) => set((state) => ({
    pan: typeof pan === "function" ? pan(state.pan) : pan
  })),

  setColor: (color: string) => set({ currentColor: color }),

  setLabel: (label: string) => set({ currentLabel: label }),

  selectPolygon: (id: number | null) => set({ selectedPolygonId: id }),

  togglePolygonVisibility: (id: number) => {
    set((state) => {
      const next = new Set(state.hiddenPolygonIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { hiddenPolygonIds: next };
    });
  },

  // labelOverride: the toolbar can pass its live input value directly
  saveCurrentPolygon: async (labelOverride?: string) => {
    const {
      currentPolygonPoints,
      currentColor,
      currentLabel,
      selectedImageId,
      labels,
      activeLabelId,
    } = get();

    if (!selectedImageId || currentPolygonPoints.length < 2) return;

    let finalLabel = (labelOverride !== undefined ? labelOverride : currentLabel).trim();
    let finalColor = currentColor;

    if (activeLabelId && labelOverride !== "__crop__") {
      const activeLabel = labels.find(l => l.id === activeLabelId);
      if (activeLabel) {
        finalLabel = activeLabel.name;
        finalColor = activeLabel.color;
      }
    }

    const payload = {
      image: selectedImageId,
      points: currentPolygonPoints,
      color: finalColor,
      label: finalLabel,
    };

    // Optimistic update
    const tempId = Date.now();
    const tempPolygon: Polygon = {
      id: tempId,
      image: selectedImageId,
      points: currentPolygonPoints,
      color: finalColor,
      label: finalLabel,
      label_position: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      currentPolygonPoints: [],
      redoStack: [],
      currentLabel: "", // reset label after save
      images: state.images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              polygons: [...img.polygons, tempPolygon],
              polygon_count: img.polygon_count + 1,
            }
          : img
      ),
    }));

    try {
      const savedPolygon = await apiCreatePolygon(payload);
      set((state) => ({
        images: state.images.map((img) =>
          img.id === selectedImageId
            ? {
                ...img,
                polygons: img.polygons.map((p) =>
                  p.id === tempId ? savedPolygon : p
                ),
              }
            : img
        ),
      }));
    } catch (err) {
      console.error("Failed to save polygon", err);
      get().loadImages();
    }
  },

  updatePolygon: async (id: number, payload: { label?: string; color?: string; label_position?: {x: number, y: number} | null }) => {
    const { selectedImageId } = get();
    if (!selectedImageId) return;

    // Optimistic update
    set((state) => ({
      images: state.images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              polygons: img.polygons.map((p) =>
                p.id === id ? { ...p, ...payload } : p
              ),
            }
          : img
      ),
    }));

    try {
      await apiUpdatePolygon(id, payload);
    } catch (err) {
      console.error("Failed to update polygon", err);
      get().loadImages();
    }
  },

  deletePolygon: async (id: number) => {
    const { selectedImageId } = get();
    if (!selectedImageId) return;

    set((state) => ({
      selectedPolygonId:
        state.selectedPolygonId === id ? null : state.selectedPolygonId,
      images: state.images.map((img) =>
        img.id === selectedImageId
          ? {
              ...img,
              polygons: img.polygons.filter((p) => p.id !== id),
              polygon_count: img.polygon_count - 1,
            }
          : img
      ),
    }));

    try {
      await apiDeletePolygon(id);
    } catch {
      get().loadImages();
    }
  },

  clearAllPolygons: async () => {
    const { selectedImageId } = get();
    if (!selectedImageId) return;

    set((state) => ({
      selectedPolygonId: null,
      images: state.images.map((img) =>
        img.id === selectedImageId
          ? { ...img, polygons: [], polygon_count: 0 }
          : img
      ),
    }));

    try {
      await apiClearPolygons(selectedImageId);
    } catch {
      get().loadImages();
    }
  },

  // ─── Labels Implementation ─────────────────────────────────────────────────────

  loadLabels: async () => {
    set({ isLabelsLoading: true });
    try {
      const labels = await apiFetchLabels();
      set({ labels, isLabelsLoading: false });
    } catch {
      set({ isLabelsLoading: false });
    }
  },

  createLabel: async (name: string, color: string) => {
    try {
      const newLabel = await apiCreateLabel({ name, color });
      set((state) => ({ labels: [newLabel, ...state.labels], activeLabelId: newLabel.id }));
    } catch (err) {
      console.error("Failed to create label", err);
    }
  },

  updateLabel: async (id: number, payload: { name?: string; color?: string }) => {
    let oldName = "";
    set((state) => {
      const labelToUpdate = state.labels.find(l => l.id === id);
      oldName = labelToUpdate?.name || "";
      const newLabels = state.labels.map(l => l.id === id ? { ...l, ...payload } : l);

      const newImages = state.images.map((img) => ({
        ...img,
        polygons: img.polygons.map((p) => {
          if (oldName && p.label === oldName) {
            return {
              ...p,
              label: payload.name !== undefined ? payload.name : p.label,
              color: payload.color !== undefined ? payload.color : p.color,
            };
          }
          return p;
        })
      }));

      return { labels: newLabels, images: newImages };
    });
    try {
      await apiUpdateLabel(id, payload);
    } catch (err) {
      console.error("Failed to update label", err);
      get().loadLabels();
    }
  },

  deleteLabel: async (id: number) => {
    set((state) => ({
      labels: state.labels.filter(l => l.id !== id),
      activeLabelId: state.activeLabelId === id ? null : state.activeLabelId
    }));
    try {
      await apiDeleteLabel(id);
    } catch {
      get().loadLabels();
    }
  },

  setActiveLabel: (id: number | null) => set({ activeLabelId: id }),
}));
