"use client";

import { useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function Lightbox({ images, index, onClose, onNavigate }) {
  const goNext = useCallback(() => {
    onNavigate((index + 1) % images.length);
  }, [index, images.length, onNavigate]);

  const goPrev = useCallback(() => {
    onNavigate((index - 1 + images.length) % images.length);
  }, [index, images.length, onNavigate]);

  useEffect(() => {
    if (index == null) return; // don't touch scroll/keys unless lightbox is open

    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [index, goNext, goPrev, onClose]);

  if (index == null) return null;
  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 px-4"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 text-concrete hover:text-paper"
        >
          <X size={28} />
        </button>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete hover:text-paper sm:left-6"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-h-[85vh] max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={current.url}
            alt={current.caption ?? ""}
            className="max-h-[85vh] w-auto object-contain"
          />
          {current.caption && (
            <p className="mt-3 text-center font-mono text-xs uppercase tracking-widest text-concrete">
              {current.caption}
            </p>
          )}
        </motion.div>

        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-concrete hover:text-paper sm:right-6"
          >
            <ChevronRight size={36} />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
