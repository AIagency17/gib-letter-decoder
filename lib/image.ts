const MAX_EDGE = 1600;
const QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image_load_failed"));
    };
    img.src = url;
  });
}

/** Resize to max 1600px on the long edge and re-encode as JPEG. Returns base64 (no data: prefix) and a preview URL. */
export async function prepareImage(file: File): Promise<{ base64: string; previewUrl: string }> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.round(img.naturalWidth * scale);
  const height = Math.round(img.naturalHeight * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas_unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return { base64: dataUrl.split(",")[1] ?? "", previewUrl: dataUrl };
}

// Keeps the base64 body under Vercel's 4.5MB request limit.
export const MAX_PDF_BYTES = 3 * 1024 * 1024;

/** Read a PDF as base64 (no data: prefix). PDFs are sent as-is; Gemini reads them natively. */
export function readPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("pdf_read_failed"));
    reader.readAsDataURL(file);
  });
}
