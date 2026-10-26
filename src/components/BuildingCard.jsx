"use client";

import { motion } from "framer-motion";
import PrefetchLink from "./PrefetchLink";
import { prefetchBuilding } from "../lib/queries";

export default function BuildingCard({ building, index, className = "aspect-[4/5]" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <PrefetchLink
        href={`/buildings/${building.slug}`}
        onPrefetch={() => prefetchBuilding(building.slug)}
        className="group block h-full"
      >
        <div className={`relative h-full w-full overflow-hidden bg-ink ${className}`}>
          <img
            src={building.hero_image}
            alt={building.name}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />

          {/* Blueprint registration marks — corner brackets, echo the hero's drafting motif */}
          <Corner className="left-3 top-3 border-l border-t" />
          <Corner className="right-3 top-3 border-r border-t" />
          <Corner className="bottom-3 left-3 border-b border-l" />
          <Corner className="bottom-3 right-3 border-b border-r" />

          {typeof index === "number" && (
            <span className="absolute right-3 top-3 font-mono text-[10px] tracking-widest text-amber opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              N°{String(index + 1).padStart(2, "0")}
            </span>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="font-mono text-[11px] uppercase tracking-widest text-amber">
              {building.building_types?.name ?? building.status}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-paper">
              {building.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-concrete/80">
              {building.location}
              {building.year_built ? ` — ${building.year_built}` : ""}
            </p>
          </div>
        </div>
      </PrefetchLink>
    </motion.div>
  );
}

function Corner({ className }) {
  return (
    <span
      className={`pointer-events-none absolute h-4 w-4 border-amber/0 opacity-0 transition-all duration-300 group-hover:border-amber/80 group-hover:opacity-100 ${className}`}
    />
  );
}
