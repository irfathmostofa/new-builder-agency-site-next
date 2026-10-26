"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import PrefetchLink from "./PrefetchLink";
import { prefetchBuilding } from "../lib/queries";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const SLIDE_DURATION = 6000;

export default function HeroSlider({ buildings, eyebrow = "Est. from the ground up" }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const timerRef = useRef(null);

  const count = buildings.length;

  const goTo = useCallback(
    (next) => {
      setIndex(((next % count) + count) % count);
      setProgressKey((k) => k + 1);
    },
    [count]
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (count < 2 || paused) return;
    timerRef.current = setTimeout(goNext, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, count, goNext]);

  if (count === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink px-6 text-center">
        <p className="font-mono text-sm text-concrete">
          Mark a building as featured (or set a hero building in /admin/hero) to power the hero.
        </p>
      </div>
    );
  }

  const current = buildings[index];

  return (
    <section
      className="relative h-screen w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide images with Ken Burns crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <motion.img
            src={current.hero_image}
            alt={current.name}
            initial={{ scale: 1 }}
            animate={{ scale: 1.12 }}
            transition={{ duration: SLIDE_DURATION / 1000 + 1, ease: "linear" }}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Blueprint grid texture for brand continuity */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.07]">
        <svg className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <pattern id="hero-grid" width="56" height="56" patternUnits="userSpaceOnUse">
              <path d="M 56 0 L 0 0 0 56" className="blueprint-line" strokeOpacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Legibility gradients */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink via-ink/25 to-ink/10" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-20 flex h-full w-full flex-col justify-end px-6 pb-28 md:px-12 lg:pb-32">
        <div className="max-w-3xl">
          <motion.span
            key={`eyebrow-${current.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-block font-mono text-xs uppercase tracking-[0.35em] text-amber"
          >
            {eyebrow}
          </motion.span>

          <AnimatePresence mode="wait">
            <motion.h1
              key={`name-${current.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-display text-4xl font-semibold leading-[1.05] text-paper sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {current.name}
            </motion.h1>
          </AnimatePresence>

          <motion.div
            key={`specs-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-widest text-concrete sm:text-sm"
          >
            {current.location && <span>{current.location}</span>}
            {current.year_built && (
              <span className="border-l border-concrete/30 pl-6">{current.year_built}</span>
            )}
            {current.area_sqft && (
              <span className="border-l border-concrete/30 pl-6">
                {current.area_sqft.toLocaleString()} sqft
              </span>
            )}
          </motion.div>

          <motion.div
            key={`cta-${current.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9"
          >
            <PrefetchLink
              href={`/buildings/${current.slug}`}
              onPrefetch={() => prefetchBuilding(current.slug)}
              className="group inline-flex items-center gap-3 border border-paper/40 px-7 py-3 font-mono text-xs uppercase tracking-widest text-paper transition-colors hover:border-amber hover:bg-amber hover:text-ink"
            >
              View project
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </PrefetchLink>
          </motion.div>
        </div>
      </div>

      {/* Slide counter */}
      {count > 1 && (
        <div className="absolute bottom-8 left-6 z-30 font-mono text-xs tracking-widest text-concrete md:left-12">
          <span className="text-paper">{String(index + 1).padStart(2, "0")}</span>
          <span className="text-concrete/50"> / {String(count).padStart(2, "0")}</span>
        </div>
      )}

      {/* Progress bars / dot navigation */}
      {count > 1 && (
        <div className="absolute bottom-8 right-6 z-30 flex gap-2 md:right-12">
          {buildings.map((b, i) => (
            <button
              key={b.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="relative h-[3px] w-10 overflow-hidden bg-paper/25 sm:w-14"
            >
              {i === index && (
                <motion.span
                  key={progressKey}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: "linear" }}
                  className="absolute inset-0 origin-left bg-amber"
                />
              )}
              {i < index && <span className="absolute inset-0 bg-amber/70" />}
            </button>
          ))}
        </div>
      )}

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 text-paper/60 transition-colors hover:text-paper md:left-6 lg:block"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 text-paper/60 transition-colors hover:text-paper md:right-6 lg:block"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Scroll cue */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 z-30 hidden -translate-x-1/2 text-concrete/60 md:block"
      >
        <ChevronDown size={20} />
      </motion.div>
    </section>
  );
}
