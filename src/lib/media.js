import { supabase } from "./supabaseClient";
import { cached, peek, setCache, invalidate } from "./cache";
import { optimizeImageFile } from "./optimizeImage";

export const MEDIA_BUCKET = "media";
export const MEDIA_FOLDER = "uploads";
const MEDIA_KEY = "media";
const MEDIA_TTL = 10 * 60 * 1000;

function publicUrl(path) {
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
}

export function pathFromPublicUrl(url) {
  if (!url) return "";
  const marker = `/object/public/${MEDIA_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return "";
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

function safeName(name) {
  return String(name || "image")
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "image";
}

function toAsset(file, folder = MEDIA_FOLDER) {
  const path = `${folder}/${file.name}`;
  return {
    name: file.name,
    path,
    url: publicUrl(path),
    size: file.metadata?.size ?? null,
    created_at: file.created_at || file.updated_at || null,
  };
}

export function peekMedia() {
  return peek(MEDIA_KEY);
}

export async function listMedia(folder = MEDIA_FOLDER) {
  return cached(
    MEDIA_KEY,
    async () => {
      const { data, error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? [])
        .filter((file) => file.name && !file.name.startsWith("."))
        .map((file) => toAsset(file, folder));
    },
    MEDIA_TTL,
  );
}

export function rememberMedia(asset) {
  const existing = peekMedia();
  const list = Array.isArray(existing) ? existing.filter((item) => item.url !== asset.url) : [];
  setCache(MEDIA_KEY, [asset, ...list], MEDIA_TTL);
}

export async function uploadOptimizedImage(file, folder = MEDIA_FOLDER) {
  const optimized = await optimizeImageFile(file);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ext = (optimized.name.split(".").pop() || "webp").toLowerCase();
  const path = `${folder}/${stamp}-${safeName(file.name)}.${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, optimized, {
    cacheControl: "31536000",
    contentType: optimized.type || "image/webp",
    upsert: false,
  });
  if (error) throw error;

  const asset = {
    name: optimized.name,
    path,
    url: publicUrl(path),
    size: optimized.size,
    originalSize: file.size,
    created_at: new Date().toISOString(),
  };
  rememberMedia(asset);
  return asset;
}

export async function deleteMedia(urlOrPath) {
  const path = urlOrPath.includes("/") && !urlOrPath.startsWith("http")
    ? urlOrPath
    : pathFromPublicUrl(urlOrPath);
  if (!path) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw error;
  const existing = peekMedia();
  if (Array.isArray(existing)) {
    setCache(MEDIA_KEY, existing.filter((item) => item.path !== path && item.url !== urlOrPath), MEDIA_TTL);
  }
}

export function invalidateMedia() {
  invalidate(MEDIA_KEY);
}
