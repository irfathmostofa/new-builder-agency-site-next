"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, product_categories(name)")
      .order("created_at", { ascending: false });
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?`)) return;
    await supabase.from("products").delete().eq("id", id);
    invalidate("products");
    invalidate("product");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
        <Link href="/admin/products/new" className="bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel">
          + Add product
        </Link>
      </div>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {!loading && products.length === 0 && <p className="py-6 font-mono text-sm text-ink/50">No products yet.</p>}
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {p.image && <img src={p.image} alt="" className="h-12 w-12 object-cover" />}
              <div>
                <p className="font-body font-medium text-ink">
                  {p.name}
                  {p.featured && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-amber">Featured</span>}
                </p>
                <p className="font-mono text-xs text-ink/50">{p.product_categories?.name ?? "No category"}</p>
              </div>
            </div>
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
              <Link href={`/admin/products/${p.id}`} className="text-steel hover:text-ink">Edit</Link>
              <button onClick={() => handleDelete(p.id, p.name)} className="text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
