"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function BlueprintReveal({
  heroImage,
  blueprintImage,
  name,
  eyebrow = "Scroll to build",
  location,
  yearBuilt,
  areaSqft,
  sheetLabel = "SHEET A—001", // optional: pass a real drawing/sheet id if you have one
}) {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const grayscale = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const brightness = useTransform(scrollYProgress, [0, 0.5], [0.55, 1]);
  const photoFilter = useTransform(
    [grayscale, brightness],
    ([g, b]) => `grayscale(${g}) brightness(${b})`,
  );
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18]);

  const blueprintOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3], [0.18, 0]);
  const specsOpacity = useTransform(scrollYProgress, [0.35, 0.55], [0, 1]);
  const specsY = useTransform(scrollYProgress, [0.35, 0.55], [16, 0]);
  const headlineOpacity = useTransform(scrollYProgress, [0.55, 0.8], [1, 0]);
  const scrollCueOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const marginOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[220vh] bg-ink">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {heroImage && (
          <motion.img
            src={heroImage}
            alt={name}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.08, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ filter: photoFilter, scale: photoScale }}
            className="absolute inset-0 z-10 h-full w-full object-cover"
          />
        )}

        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 z-10"
        >
          <svg className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <pattern
                id="grid"
                width="48"
                height="48"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 48 0 L 0 0 0 48"
                  className="blueprint-line"
                  strokeOpacity="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>

        {blueprintImage && (
          <motion.img
            src={blueprintImage}
            alt=""
            style={{ opacity: blueprintOpacity }}
            className="absolute inset-0 z-10 h-full w-full object-cover mix-blend-screen"
          />
        )}

        <div className="absolute inset-0 z-20 bg-gradient-to-t from-ink via-ink/15 to-ink/30" />
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-ink/40 via-transparent to-transparent" />

        {/* Corner registration marks — matches BuildingCard, unifies the system */}
        <motion.div
          style={{ opacity: marginOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="pointer-events-none absolute inset-4 z-30 sm:inset-6"
        >
          <span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-amber/60" />
          <span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-amber/60" />
          <span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-amber/60" />
          <span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-amber/60" />
        </motion.div>

        {/* Drafting margin bar — a real title-block convention, left edge only, desktop */}
        <motion.div
          style={{ opacity: marginOpacity }}
          className="pointer-events-none absolute bottom-16 left-8 top-24 z-30 hidden w-px bg-amber/30 md:block"
        >
          <span
            className="absolute bottom-4 left-3 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-amber/70"
            style={{ writingMode: "vertical-rl" }}
          >
            {sheetLabel}
          </span>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute left-0 h-px w-2 bg-amber/40"
              style={{ top: `${i * 25}%` }}
            />
          ))}
        </motion.div>

        <motion.div
          style={{ opacity: headlineOpacity }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-concrete"
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-3xl font-display text-4xl font-semibold leading-tight text-paper sm:text-5xl md:text-7xl"
          >
            {name}
          </motion.h1>

          {/* Pen-stroke underline — draws in like a drafted line, not a static rule */}
          <motion.svg
            width="120"
            height="8"
            viewBox="0 0 120 8"
            className="mt-5"
          >
            <motion.line
              x1="0"
              y1="4"
              x2="120"
              y2="4"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-amber"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.1, ease: "easeInOut" }}
            />
          </motion.svg>
        </motion.div>

        {/* Scroll cue — dimension-line style rather than a generic bounce arrow */}
        <motion.div
          style={{ opacity: scrollCueOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-28"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-concrete/60">
            Scroll
          </span>
          <motion.div
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-6 w-px origin-top bg-amber/60"
          />
        </motion.div>

        <motion.div
          style={{ opacity: specsOpacity, y: specsY }}
          className="absolute bottom-8 left-0 right-0 z-30 flex flex-wrap justify-center gap-x-6 gap-y-2 px-6 font-mono text-[11px] uppercase tracking-widest text-concrete sm:gap-x-10 sm:text-xs md:justify-between md:px-16"
        >
          <Spec label="Location" value={location} />
          <Spec label="Year" value={yearBuilt} />
          <Spec
            label="Area"
            value={areaSqft ? `${areaSqft.toLocaleString()} sqft` : null}
          />
        </motion.div>
      </div>
    </section>
  );
}

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <span className="border-l border-steel pl-3">
      <span className="text-steel">{label} — </span>
      {value}
    </span>
  );
}
