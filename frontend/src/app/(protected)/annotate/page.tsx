"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/app/hooks/useRequireAuth";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import ImageGallery from "@/app/modules/annotations/components/ImageGallery";
import AnnotationCanvas from "@/app/modules/annotations/components/AnnotationCanvas";
import AnnotationToolbar from "@/app/modules/annotations/components/AnnotationToolbar";
import AnnotationSidebar from "@/app/modules/annotations/components/AnnotationSidebar";
import { ScanLine, AlertTriangle } from "lucide-react";

export default function AnnotatePage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { loadImages, isImagesLoading, imagesError } = useAnnotationStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadImages();
    }
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Page Header */}
      <div className="border-b border-border bg-background flex-shrink-0">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-special/10 text-special flex items-center justify-center">
              <ScanLine size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-tight">
                Image Annotator
              </h1>
              <p className="text-xs text-muted-foreground">
                Upload images, draw polygons, and save annotations to the database.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 min-h-0">

        {/* Image Gallery */}
        <div className="flex-shrink-0">
          {isImagesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading images…
            </div>
          ) : imagesError ? (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              <AlertTriangle size={14} />
              {imagesError}
            </div>
          ) : (
            <ImageGallery />
          )}
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0">
          <AnnotationToolbar />
        </div>

        {/* Canvas + Sidebar */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4 min-h-0">
          <AnnotationCanvas />
          <AnnotationSidebar />
        </div>
      </div>
    </div>
  );
}
