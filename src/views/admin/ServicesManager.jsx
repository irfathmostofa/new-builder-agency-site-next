"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { excerpt, servicePath } from "../../lib/content";
import { invalidate } from "../../lib/queries";

export default function ServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setServices(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    await supabase.from("services").delete().eq("id", id);
    invalidate("services");
    invalidate("service");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Services</h1>
        <Link
          href="/admin/services/new"
          className="bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
        >
          + Add service
        </Link>
      </div>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {!loading && services.length === 0 && (
          <p className="py-6 font-mono text-sm text-ink/50">No services yet.</p>
        )}
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              {s.image_url && <img src={s.image_url} alt="" className="h-12 w-12 object-cover" />}
              <div>
                <p className="font-body font-medium text-ink">
                  {s.icon} {s.title}
                </p>
                <p className="font-mono text-xs text-ink/50">{excerpt(s.description, 80)}</p>
              </div>
            </div>
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
              <a
                href={servicePath(s)}
                target="_blank"
                rel="noreferrer"
                className="text-ink/40 hover:text-ink"
              >
                View
              </a>
              <Link href={`/admin/services/${s.id}`} className="text-steel hover:text-ink">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(s.id, s.title)}
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
