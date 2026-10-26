"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBuildings } from "../hooks/useBuildings";
import BuildingCard from "../components/BuildingCard";
import { getBuildingTypes, peekBuildingTypes } from "../lib/queries";

export default function Buildings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeSlug = searchParams.get("type");
  function setType(slug) {
    router.push(slug ? `/buildings?type=${slug}` : "/buildings");
  }
  const { buildings, loading } = useBuildings({ typeSlug });
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const cached = peekBuildingTypes();
    if (cached) setTypes(cached);
    getBuildingTypes().then((data) => setTypes(data ?? []));
  }, []);

  return (
    <div className="px-6 pb-28 pt-36 md:px-12">
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-steel">
          Portfolio
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
          Buildings
        </h1>

        <div className="mt-10 flex flex-wrap gap-3 font-mono text-xs uppercase tracking-widest">
          <FilterPill
            active={!typeSlug}
            onClick={() => setType(null)}
            label="All"
          />
          {types.map((t) => (
            <FilterPill
              key={t.id}
              active={typeSlug === t.slug}
              onClick={() => setType(t.slug)}
              label={t.name}
            />
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="col-span-full font-mono text-sm text-ink/50">
              Loading…
            </p>
          )}
          {!loading && buildings.length === 0 && (
            <p className="col-span-full font-mono text-sm text-ink/50">
              No buildings found for this filter.
            </p>
          )}
          {buildings.map((b) => (
            <BuildingCard key={b.id} building={b} />
          ))}
        </div>
      </div>
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
