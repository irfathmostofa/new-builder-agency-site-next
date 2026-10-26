"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function BuildingTypesManager() {
  const [types, setTypes] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("building_types").select("*").order("sort_order");
    setTypes(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from("building_types").insert([
      { name, slug: slugify(name), description, sort_order: types.length },
    ]);
    setName("");
    setDescription("");
    load();
  }

  async function handleDelete(id, typeName) {
    if (!confirm(`Delete type "${typeName}"? Buildings using it will lose their type.`)) return;
    await supabase.from("building_types").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Building Types</h1>

      <form onSubmit={handleAdd} className="mt-8 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Type name, e.g. Cottage"
          className="input"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="input"
        />
        <button
          type="submit"
          className="whitespace-nowrap bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
        >
          Add
        </button>
      </form>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {types.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-body font-medium text-ink">{t.name}</p>
              <p className="font-mono text-xs text-ink/50">{t.description}</p>
            </div>
            <button
              onClick={() => handleDelete(t.id, t.name)}
              className="font-mono text-xs uppercase tracking-widest text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
