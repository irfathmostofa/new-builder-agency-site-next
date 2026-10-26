"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { getSiteSettings } from "../lib/queries";

export default function FloatingWhatsApp() {
  const [number, setNumber] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    getSiteSettings().then((data) => setNumber(data?.whatsapp_number || null));
  }, []);

  if (!number) return null;

  return (
    <div
      className="fixed bottom-6 left-6 z-40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-1/2 left-full ml-3 flex translate-y-1/2 items-center"
          >
            {/* pointer tick */}
            <span className="h-1.5 w-1.5 -rotate-45 border-b border-l border-ink bg-ink" />
            <span className="-ml-px whitespace-nowrap bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-paper shadow-lg shadow-ink/20">
              Chat on WhatsApp
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/${number.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-paper shadow-lg shadow-ink/20"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/50" />
        <MessageCircle
          size={28}
          className="relative fill-paper text-[#25D366]"
        />
      </motion.a>
    </div>
  );
}
