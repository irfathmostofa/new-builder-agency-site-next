"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useBuilding } from "../hooks/useBuildings";
import Lightbox from "../components/Lightbox";
import RichContent from "../components/RichContent";

export default function BuildingDetail() {
  const { slug } = useParams();
  const { building, images, loading, error } = useBuilding(slug);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="font-mono text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-mono text-sm text-ink/50">
          We couldn't find that building.
        </p>
        <Link
          href="/buildings"
          className="font-mono text-xs uppercase tracking-widest text-steel"
        >
          ← Back to all buildings
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[80vh] items-end bg-ink">
        <img
          src={building.hero_image}
          alt={building.name}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="relative z-10 w-full px-6 pb-14 md:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber">
            {building.building_types?.name ?? building.status}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-paper md:text-6xl">
            {building.name}
          </h1>
        </div>
      </section>

      {/* Specs strip */}
      <section className="border-b border-ink/10 bg-paper px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-[90rem] flex-wrap gap-x-12 gap-y-4 font-mono text-xs uppercase tracking-widest">
          <Spec label="Location" value={building.location} />
          <Spec label="Year" value={building.year_built} />
          <Spec
            label="Area"
            value={
              building.area_sqft
                ? `${building.area_sqft.toLocaleString()} sqft`
                : null
            }
          />
          <Spec label="Status" value={building.status} />
        </div>
      </section>

      {/* Description */}
      <section className="mx-auto max-w-3xl px-6 py-20 md:px-12">
        <RichContent
          html={building.full_description ?? building.short_description}
          className="font-body text-lg leading-relaxed text-ink/80"
        />
        {building.floor_plan_url && (
          <a
            href={building.floor_plan_url}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block border border-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:bg-ink hover:text-paper"
          >
            View floor plan
          </a>
        )}
      </section>

      {/* Gallery */}
      {images.length > 0 && (
        <section className="px-6 pb-28 md:px-12">
          <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((img, i) => (
              <motion.button
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
                className="group block overflow-hidden text-left"
              >
                <img
                  src={img.url}
                  alt={img.caption ?? building.name}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />

      {/* CTA */}
      <section className="bg-ink px-6 py-20 text-center md:px-12">
        <p className="font-display text-2xl text-paper">
          Interested in something like this?
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block bg-amber px-8 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:bg-paper"
        >
          Get in touch
        </Link>
      </section>
    </div>
  );
}

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <span>
      <span className="text-steel">{label} — </span>
      <span className="text-ink/70">{value}</span>
    </span>
  );
}
