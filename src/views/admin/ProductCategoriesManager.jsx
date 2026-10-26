"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductCategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("product_categories").select("*").order("sort_order");
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from("product_categories").insert([{ name, slug: slugify(name), sort_order: categories.length }]);
    setName("");
    load();
  }

  async function handleDelete(id, catName) {
    if (!confirm(`Delete "${catName}"? Products in it will lose their category.`)) return;
    await supabase.from("product_categories").delete().eq("id", id);
    load();
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Product Categories</h1>

      <form onSubmit={handleAdd} className="mt-8 flex gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="input" />
        <button type="submit" className="whitespace-nowrap bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel">
          Add
        </button>
      </form>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between py-4">
            <p className="font-body font-medium text-ink">{c.name}</p>
            <button onClick={() => handleDelete(c.id, c.name)} className="font-mono text-xs uppercase tracking-widest text-red-500 hover:text-red-700">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
