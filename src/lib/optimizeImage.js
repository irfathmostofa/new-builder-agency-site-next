const MAX_EDGE = 2560;
const WEBP_QUALITY = 0.92;

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return createImageBitmap(file);
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function optimizeImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const source = await decodeImage(file);
  const width = source.width;
  const height = source.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);
  if (typeof source.close === "function") source.close();

  const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  if (!webp) return file;
  if (webp.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([webp], `${base}.webp`, { type: "image/webp", lastModified: Date.now() });
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}
