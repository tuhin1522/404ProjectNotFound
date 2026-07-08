"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import TopToolbar from "@/app/modules/annotations/components/TopToolbar";
import LeftToolbar from "@/app/modules/annotations/components/LeftToolbar";
import AnnotationCanvas from "@/app/modules/annotations/components/AnnotationCanvas";
import AnnotationSidebar from "@/app/modules/annotations/components/AnnotationSidebar";
import BottomFilmstrip from "@/app/modules/annotations/components/BottomFilmstrip";

// Shared canvas ref - TopToolbar accesses this for annotated image export
export const sharedCanvasRef = { current: null as HTMLCanvasElement | null };

export default function AnnotatePage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { loadImages, loadLabels } = useAnnotationStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
      loadLabels();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#0d0d0d]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex flex-col bg-[#0d0d0d] overflow-hidden"
      style={{ zIndex: 50 }}
    >
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Middle: Left Toolbar + Canvas + Right Sidebar */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftToolbar />
        <AnnotationCanvas />
        <AnnotationSidebar />
      </div>

      {/* Bottom Filmstrip */}
      <BottomFilmstrip />
    </div>
  );
}
