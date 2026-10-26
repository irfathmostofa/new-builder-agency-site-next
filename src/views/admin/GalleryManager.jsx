"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";
import ImageUploader from "../../components/ImageUploader";

const empty = { url: "", caption: "", category: "" };

export default function GalleryManager() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("gallery_images").select("*").order("sort_order", { ascending: false });
    setImages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.url.trim()) return;
    await supabase.from("gallery_images").insert([{ ...form, sort_order: images.length }]);
    invalidate("gallery");
    setForm(empty);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this image?")) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    invalidate("gallery");
    load();
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Gallery</h1>

      <form onSubmit={handleAdd} className="mt-8 space-y-4">
        <ImageUploader
          label="Image"
          value={form.url}
          onChange={(url) => setForm((f) => ({ ...f, url }))}
        />
        <div className="flex flex-wrap gap-3">
          <input value={form.caption} onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))} placeholder="Caption (optional)" className="input flex-1" />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Category (optional)" className="input w-40" />
          <button type="submit" className="bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel">
            + Add
          </button>
        </div>
      </form>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading && <p className="col-span-full font-mono text-sm text-ink/50">Loading…</p>}
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden bg-ink/5">
            <img src={img.url} alt={img.caption ?? ""} className="h-full w-full object-cover" />
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute right-2 top-2 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-paper opacity-0 transition-opacity group-hover:opacity-100"
            >
              Delete
            </button>
            {img.category && (
              <span className="absolute bottom-2 left-2 bg-ink/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-paper">
                {img.category}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
