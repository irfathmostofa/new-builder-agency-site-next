"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "../components/Lightbox";
import { getGalleryImages, peekGalleryImages } from "../lib/queries";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    const cached = peekGalleryImages();
    if (cached !== undefined) {
      setImages(cached);
      setLoading(false);
    }
    getGalleryImages().then((data) => {
      setImages(data ?? []);
      setLoading(false);
    });
  }, []);

  const categories = [
    ...new Set(images.map((i) => i.category).filter(Boolean)),
  ];
  const visible = category
    ? images.filter((i) => i.category === category)
    : images;

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Gallery
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Sites, in detail
        </h1>

        {categories.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest">
            <FilterPill
              active={!category}
              onClick={() => setCategory(null)}
              label="All"
            />
            {categories.map((c) => (
              <FilterPill
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
                label={c}
              />
            ))}
          </div>
        )}

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {loading && <p className="font-mono text-sm text-ink/50">Loading…</p>}
          {!loading && visible.length === 0 && (
            <p className="font-mono text-sm text-ink/50">No images yet.</p>
          )}
          {visible.map((img, i) => (
            <motion.button
              key={img.id}
              onClick={() => setLightboxIndex(i)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: (i % 6) * 0.05 }}
              className="group mb-4 block w-full break-inside-avoid text-left"
            >
              <div className="overflow-hidden">
                <img
                  src={img.url}
                  alt={img.caption ?? ""}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {img.caption && (
                <p className="mt-1 font-mono text-xs text-ink/50">
                  {img.caption}
                </p>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <Lightbox
        images={visible}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}

function FilterPill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`border px-4 py-2 transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/20 text-ink/60 hover:border-ink/60 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
