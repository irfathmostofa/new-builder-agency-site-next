"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getSiteSettings, peekSiteSettings } from "../lib/queries";

export default function Preloader() {
  const cached = peekSiteSettings();
  const [visible, setVisible] = useState(true);
  const [siteName, setSiteName] = useState(cached?.site_name || "Meridian Builders");

  useEffect(() => {
    if (sessionStorage.getItem("mb-preloaded")) {
      setVisible(false);
      return;
    }
    sessionStorage.setItem("mb-preloaded", "1");

    getSiteSettings().then((data) => {
      if (data?.site_name) setSiteName(data.site_name);
    });

    const minTime = new Promise((resolve) => setTimeout(resolve, 700));
    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise((resolve) =>
            window.addEventListener("load", resolve, { once: true }),
          );

    Promise.all([minTime, pageReady]).then(() => setVisible(false));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
            <svg className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <pattern
                  id="preloader-grid"
                  width="48"
                  height="48"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 48 0 L 0 0 0 48"
                    className="blueprint-line"
                    strokeOpacity="0.6"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#preloader-grid)" />
            </svg>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative font-display text-2xl font-semibold tracking-tight text-paper sm:text-3xl"
          >
            {siteName}
          </motion.p>

          <div className="relative mt-7 h-px w-44 overflow-hidden bg-paper/15">
            <motion.span
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-y-0 left-0 w-1/3 bg-amber"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-concrete/60"
          >
            Loading blueprint
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
