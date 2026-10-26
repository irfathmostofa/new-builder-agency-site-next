"use client";

import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../lib/optimizeImage";
import { listMedia, peekMedia, uploadOptimizedImage } from "../lib/media";

export default function ImageUploader({
  value = "",
  onChange,
  label,
  multiple = false,
  values,
  onChangeMultiple,
  folder,
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [note, setNote] = useState("");

  const selected = multiple ? (values ?? []).filter(Boolean) : value ? [value] : [];

  async function refreshLibrary() {
    setLibraryLoading(true);
    try {
      const items = await listMedia(folder);
      setLibrary(items);
    } catch (err) {
      setError(err.message || "Could not load media library");
    } finally {
      setLibraryLoading(false);
    }
  }

  useEffect(() => {
    if (!libraryOpen) return;
    let cancelled = false;
    const cached = peekMedia();
    if (cached?.length) {
      queueMicrotask(() => {
        if (!cancelled) setLibrary(cached);
      });
    }
    setLibraryLoading(!cached?.length);
    listMedia(folder)
      .then((items) => {
        if (!cancelled) setLibrary(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load media library");
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [libraryOpen, folder]);

  function emit(next) {
    if (multiple) {
      onChangeMultiple?.(next);
      return;
    }
    onChange?.(next[0] || "");
  }

  function addUrls(urls) {
    const incoming = urls.filter(Boolean);
    if (!incoming.length) return;
    if (multiple) {
      const merged = [...selected];
      incoming.forEach((url) => {
        if (!merged.includes(url)) merged.push(url);
      });
      emit(merged);
      return;
    }
    emit([incoming[0]]);
  }

  function removeUrl(url) {
    if (multiple) emit(selected.filter((item) => item !== url));
    else emit([]);
  }

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((file) => file.type.startsWith("image/"));
    const queue = multiple ? files : files.slice(0, 1);
    if (!queue.length) return;
    setBusy(true);
    setError("");
    setNote("");
    try {
      const uploaded = [];
      for (const file of queue) {
        const asset = await uploadOptimizedImage(file, folder);
        uploaded.push(asset);
        const saved = asset.originalSize && asset.size < asset.originalSize
          ? `Saved ${formatBytes(asset.originalSize - asset.size)}`
          : "Already compact";
        setNote(`${saved} · ${formatBytes(asset.size)}`);
      }
      addUrls(uploaded.map((item) => item.url));
      setLibrary((list) => {
        const next = [...uploaded];
        list.forEach((item) => {
          if (!next.some((asset) => asset.url === item.url)) next.push(item);
        });
        return next;
      });
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function pickFromLibrary(url) {
    addUrls([url]);
    if (!multiple) setLibraryOpen(false);
  }

  return (
    <div>
      {label && (
        <p className="font-mono text-xs uppercase tracking-widest text-ink/60">{label}</p>
      )}

      <div className={`flex flex-wrap gap-2 ${label ? "mt-2" : ""}`}>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="border border-ink/20 bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink hover:border-steel disabled:opacity-50"
        >
          {busy ? "Optimising…" : "Upload image"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen((open) => !open)}
          className="border border-ink/20 bg-paper px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink hover:border-steel"
        >
          {libraryOpen ? "Hide library" : "Choose from media"}
        </button>
        <input
          value={multiple ? selected.join(", ") : value ?? ""}
          onChange={(e) => {
            if (multiple) {
              emit(e.target.value.split(",").map((item) => item.trim()).filter(Boolean));
            } else {
              onChange?.(e.target.value);
            }
          }}
          placeholder="Or paste image URL"
          className="input min-w-[12rem] flex-1"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {note && <p className="mt-2 font-mono text-[11px] text-steel">{note}</p>}
      {error && <p className="mt-2 font-mono text-[11px] text-red-600">{error}</p>}

      {selected.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {selected.map((url) => (
            <div key={url} className="group relative aspect-square overflow-hidden bg-ink/5">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute right-2 top-2 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-paper opacity-0 transition-opacity group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {libraryOpen && (
        <div className="mt-4 border border-ink/10 bg-paper p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
              Uploaded media
            </p>
            <button
              type="button"
              onClick={refreshLibrary}
              className="font-mono text-[11px] uppercase tracking-widest text-steel hover:text-ink"
            >
              Refresh
            </button>
          </div>
          {libraryLoading && (
            <p className="mt-3 font-mono text-xs text-ink/50">Loading library…</p>
          )}
          {!libraryLoading && library.length === 0 && (
            <p className="mt-3 font-mono text-xs text-ink/50">No images in the media library yet.</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {library.map((item) => {
              const active = selected.includes(item.url);
              return (
                <button
                  type="button"
                  key={item.path || item.url}
                  onClick={() => pickFromLibrary(item.url)}
                  className={`relative aspect-square overflow-hidden border ${
                    active ? "border-steel" : "border-transparent hover:border-ink/30"
                  }`}
                >
                  <img src={item.url} alt={item.name} className="h-full w-full object-cover" />
                  {active && (
                    <span className="absolute bottom-1 left-1 bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-paper">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
