"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("inquiries")
      .select("*, buildings(name)")
      .order("created_at", { ascending: false });
    setInquiries(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Delete this inquiry?")) return;
    await supabase.from("inquiries").delete().eq("id", id);
    load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Inquiries</h1>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {!loading && inquiries.length === 0 && (
          <p className="py-6 font-mono text-sm text-ink/50">No inquiries yet.</p>
        )}
        {inquiries.map((inq) => (
          <div key={inq.id} className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-body font-medium text-ink">{inq.name}</p>
                <p className="font-mono text-xs text-steel">{inq.email}{inq.phone ? ` · ${inq.phone}` : ""}</p>
                {inq.buildings?.name && (
                  <p className="font-mono text-xs text-ink/50">Re: {inq.buildings.name}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-ink/40">
                  {new Date(inq.created_at).toLocaleDateString()}
                </p>
                <button
                  onClick={() => handleDelete(inq.id)}
                  className="mt-1 font-mono text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <p className="mt-2 font-body text-sm text-ink/80">{inq.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
