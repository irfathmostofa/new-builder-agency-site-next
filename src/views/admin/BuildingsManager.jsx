"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";

export default function BuildingsManager() {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("buildings")
      .select("*, building_types(name)")
      .order("created_at", { ascending: false });
    setBuildings(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    await supabase.from("buildings").delete().eq("id", id);
    invalidate("buildings");
    invalidate("building");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Buildings</h1>
        <Link
          href="/admin/buildings/new"
          className="bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
        >
          + Add building
        </Link>
      </div>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {!loading && buildings.length === 0 && (
          <p className="py-6 font-mono text-sm text-ink/50">No buildings yet.</p>
        )}
        {buildings.map((b) => (
          <div key={b.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {b.hero_image && (
                <img src={b.hero_image} alt="" className="h-12 w-12 object-cover" />
              )}
              <div>
                <p className="font-body font-medium text-ink">
                  {b.name}
                  {b.featured && (
                    <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-amber">
                      Featured
                    </span>
                  )}
                </p>
                <p className="font-mono text-xs text-ink/50">
                  {b.building_types?.name ?? "No type"} · {b.status}
                </p>
              </div>
            </div>
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
              <Link href={`/admin/buildings/${b.id}`} className="text-steel hover:text-ink">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(b.id, b.name)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
