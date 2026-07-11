import { AnnotationImage, Polygon } from "@/app/types/annotations";

/**
 * Download the raw JSON annotation data for the selected image.
 */
function downloadJSON(image: AnnotationImage, polygons: Polygon[]): void {
  const data = {
    image: {
      id: image.id,
      name: image.name,
      url: image.image_url,
    },
    annotations: polygons.map((p) => ({
      id: p.id,
      label: p.label,
      color: p.color,
      shape_type: inferShapeType(p.points.length),
      points: p.points,
      created_at: p.created_at,
    })),
    exported_at: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  triggerDownload(blob, `${image.name.replace(/\.[^.]+$/, "")}_annotations.json`);
}

/**
 * Download the original image by fetching its URL as a blob.
 */
async function downloadOriginalImage(imageUrl: string, name: string): Promise<void> {
  try {
    const response = await fetch(imageUrl, { mode: "cors" });
    const blob = await response.blob();
    const ext = blob.type.split("/")[1] || "png";
    triggerDownload(blob, `${name.replace(/\.[^.]+$/, "")}_original.${ext}`);
  } catch {
    // Fallback: open in new tab
    window.open(imageUrl, "_blank");
  }
}

/**
 * Download the annotated canvas as a PNG image.
 */
function downloadAnnotatedImage(canvas: HTMLCanvasElement, name: string): void {
  const filename = `${name.replace(/\.[^.]+$/, "")}_annotated.png`;

  try {
    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(blob, filename);
        return;
      }

      try {
        const dataUrl = canvas.toDataURL("image/png");
        fetch(dataUrl)
          .then((response) => response.blob())
          .then((fallbackBlob) => triggerDownload(fallbackBlob, filename))
          .catch(() => undefined);
      } catch {
        return;
      }
    }, "image/png");
  } catch {
    try {
      const dataUrl = canvas.toDataURL("image/png");
      fetch(dataUrl)
        .then((response) => response.blob())
        .then((blob) => triggerDownload(blob, filename))
        .catch(() => undefined);
    } catch {
      return;
    }
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function inferShapeType(pointCount: number): "ellipse" | "box" | "polygon" {
  if (pointCount === 2) return "ellipse";
  if (pointCount === 4) return "box";
  return "polygon";
}

export const downloadUtils = {
  downloadJSON,
  downloadOriginalImage,
  downloadAnnotatedImage,
  inferShapeType
};
