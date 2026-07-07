"use client";

import Link from "next/link";
import React, { useRef, useState, useCallback } from "react";
import {
  ScanLine, Upload, Save, Download, Maximize2, Minimize2,
  ImageIcon, Shapes, ChevronDown, FileJson, Image as ImageIconLucide,
} from "lucide-react";
import { useAnnotationStore } from "@/app/modules/annotations/store/useAnnotationStore";
import {
  downloadJSON,
  downloadOriginalImage,
  downloadAnnotatedImage,
} from "@/app/modules/annotations/utils/downloadUtils";
import { sharedCanvasRef } from "@/app/(protected)/annotate/page";

export default function TopToolbar() {
  const {
    images,
    selectedImageId,
    uploadImage,
  } = useAnnotationStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const selectedImage = images.find((img) => img.id === selectedImageId);
  const polygons = selectedImage?.polygons ?? [];
  const visiblePolygons = polygons.filter((p) => p.label !== "__crop__");
  const totalAnnotations = images.reduce((acc, img) => acc + img.polygon_count, 0);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadImage(file);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [uploadImage]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!selectedImage) return;
    downloadJSON(selectedImage, visiblePolygons);
    setShowDownload(false);
  };

  const handleDownloadOriginal = async () => {
    if (!selectedImage) return;
    await downloadOriginalImage(selectedImage.image_url, selectedImage.name);
    setShowDownload(false);
  };

  const handleDownloadAnnotated = () => {
    if (!selectedImage || !sharedCanvasRef.current) return;
    downloadAnnotatedImage(sharedCanvasRef.current, selectedImage.name);
    setShowDownload(false);
  };

  return (
    <header className="flex-shrink-0 h-[60px] bg-[#111111] border-b border-[#2a2a2a] flex items-center px-4 gap-4 z-50">
      {/* Logo + Project Name */}
      <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
          <ScanLine size={16} className="text-indigo-400" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">404ProjectNotFound</p>
        </div>
      </Link>

      <div className="w-px h-8 bg-[#2a2a2a]" />

      {/* Current image info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {selectedImage ? (
          <>
            <div className="min-w-0">
              <p className="text-[10px] text-[#555] leading-none mb-0.5">CURRENT IMAGE</p>
              <p className="text-sm font-medium text-[#ccc] truncate max-w-[180px]" title={selectedImage.name}>
                {selectedImage.name}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-3 py-1">
                <Shapes size={11} className="text-indigo-400" />
                <span className="text-[11px] font-semibold text-[#aaa]">
                  {visiblePolygons.length} annotations
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-3 py-1">
                <ImageIcon size={11} className="text-indigo-400" />
                <span className="text-[11px] font-semibold text-[#aaa]">
                  {images.length} images · {totalAnnotations} total
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-[#444]">No image selected — upload to begin</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-[#1e1e1e] border border-[#333] text-[#aaa] hover:text-white hover:border-indigo-500/50 hover:bg-[#252525] text-xs font-medium transition-all disabled:opacity-50"
          title="Upload Images"
        >
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          <span className="hidden sm:inline">Upload</span>
        </button>

        {/* Save (Ctrl+S handled in canvas) */}
        <button
          className="flex items-center gap-2 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
          title="Save (Ctrl+S)"
          onClick={() => {
            const store = useAnnotationStore.getState();
            if (store.currentPolygonPoints.length >= 2) {
              store.saveCurrentPolygon();
            }
          }}
        >
          <Save size={13} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Download dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            disabled={!selectedImage}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1e1e1e] border border-[#333] text-[#aaa] hover:text-white hover:border-[#444] text-xs font-medium transition-all disabled:opacity-30"
            title="Download (Ctrl+D)"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
            <ChevronDown size={11} className={`transition-transform ${showDownload ? "rotate-180" : ""}`} />
          </button>

          {showDownload && selectedImage && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDownload(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={handleDownloadJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors"
                >
                  <FileJson size={14} className="text-indigo-400" />
                  JSON Annotations
                </button>
                <button
                  onClick={handleDownloadOriginal}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors"
                >
                  <ImageIconLucide size={14} className="text-indigo-400" />
                  Original Image
                </button>
                <button
                  onClick={handleDownloadAnnotated}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-[#ccc] hover:bg-[#252525] hover:text-white transition-colors"
                >
                  <ImageIconLucide size={14} className="text-emerald-400" />
                  Annotated Image
                </button>
              </div>
            </>
          )}
        </div>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1e1e1e] border border-[#333] text-[#777] hover:text-white hover:border-[#444] transition-all"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>
    </header>
  );
}
