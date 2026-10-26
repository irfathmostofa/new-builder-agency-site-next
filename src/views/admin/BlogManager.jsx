"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    invalidate("posts");
    invalidate("post");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel"
        >
          + New post
        </Link>
      </div>

      <div className="mt-8 divide-y divide-ink/10 border-t border-ink/10">
        {loading && <p className="py-6 font-mono text-sm text-ink/50">Loading…</p>}
        {!loading && posts.length === 0 && (
          <p className="py-6 font-mono text-sm text-ink/50">No posts yet.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="flex items-center justify-between py-4">
            <div>
              <p className="font-body font-medium text-ink">
                {p.title}
                <span
                  className={`ml-2 font-mono text-[10px] uppercase tracking-widest ${
                    p.published ? "text-steel" : "text-ink/40"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
              </p>
              <p className="font-mono text-xs text-ink/50">/blog/{p.slug}</p>
            </div>
            <div className="flex gap-4 font-mono text-xs uppercase tracking-widest">
              <Link href={`/admin/blog/${p.id}`} className="text-steel hover:text-ink">
                Edit
              </Link>
              <button
                onClick={() => handleDelete(p.id, p.title)}
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
