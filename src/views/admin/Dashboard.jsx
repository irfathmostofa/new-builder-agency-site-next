"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [counts, setCounts] = useState({ buildings: 0, blog_posts: 0, inquiries: 0 });

  useEffect(() => {
    async function load() {
      const [b, p, i] = await Promise.all([
        supabase.from("buildings").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
      ]);
      setCounts({
        buildings: b.count ?? 0,
        blog_posts: p.count ?? 0,
        inquiries: i.count ?? 0,
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Buildings" value={counts.buildings} to="/admin/buildings" />
        <Card label="Blog posts" value={counts.blog_posts} to="/admin/blog" />
        <Card label="Inquiries" value={counts.inquiries} to="/admin/inquiries" />
        <Card label="SEO" value="Edit" to="/admin/seo" />
      </div>
    </div>
  );
}

function Card({ label, value, to }) {
  return (
    <Link href={to} className="block border border-ink/10 bg-paper p-6 hover:border-steel">
      <p className="font-mono text-xs uppercase tracking-widest text-steel">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold text-ink">{value}</p>
    </Link>
  );
}
