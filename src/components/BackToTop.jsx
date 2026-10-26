"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group fixed bottom-6 rounded-full right-6 z-40 flex h-14 w-14 flex-col items-center justify-center gap-1 border border-ink/15 bg-paper/95 text-ink shadow-lg shadow-ink/10 backdrop-blur-sm transition-colors hover:border-amber"
        >
          <ArrowUp
            size={16}
            strokeWidth={2}
            className="text-ink/70 transition-colors group-hover:text-amber"
          />
          <span className="font-mono text-[8px] uppercase tracking-widest text-ink/50 group-hover:text-amber">
            Top
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
