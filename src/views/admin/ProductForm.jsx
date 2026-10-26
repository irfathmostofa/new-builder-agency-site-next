"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import RichTextEditor from "../../components/Richtexteditor";
import ImageUploader from "../../components/ImageUploader";
import { slugify } from "../../lib/content";
import { invalidate } from "../../lib/queries";

const empty = {
  name: "", slug: "", category_id: "", description: "",
  image: "", price_label: "", featured: false, sort_order: 0,
};

export default function ProductForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const router = useRouter();

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    supabase.from("product_categories").select("*").order("name").then(({ data }) => setCategories(data ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      if (data) { setForm(data); setSlugTouched(true); }
      setLoading(false);
    });
  }, [id, isNew]);

  function updateField(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "name" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    const payload = { ...form, category_id: form.category_id || null, sort_order: Number(form.sort_order) || 0 };

    const { error } = isNew
      ? await supabase.from("products").insert([payload])
      : await supabase.from("products").update(payload).eq("id", id);

    if (error) { setStatus("error"); return; }
    invalidate("products");
    invalidate("product");
    router.push("/admin/products");
  }

  if (loading) return <p className="font-mono text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">{isNew ? "Add product" : "Edit product"}</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Name">
            <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required className="input" />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug} onChange={(e) => { setSlugTouched(true); updateField("slug", slugify(e.target.value)); }} required className="input" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Category">
            <select value={form.category_id ?? ""} onChange={(e) => updateField("category_id", e.target.value)} className="input">
              <option value="">— None —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Price label (optional, e.g. 'Contact for pricing')">
            <input value={form.price_label ?? ""} onChange={(e) => updateField("price_label", e.target.value)} className="input" />
          </Field>
        </div>

        <Field label="Description">
          <RichTextEditor
            key={isNew ? "new" : id}
            initialValue={form.description ?? ""}
            onChange={(html) => updateField("description", html)}
            placeholder="Describe this product. You can add headings, lists, and images."
            minHeight="220px"
          />
        </Field>

        <ImageUploader
          label="Image"
          value={form.image ?? ""}
          onChange={(url) => updateField("image", url)}
        />

        <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
          <input type="checkbox" checked={form.featured} onChange={(e) => updateField("featured", e.target.checked)} />
          Featured (shown on home page)
        </label>

        <button type="submit" disabled={status === "saving"} className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50">
          {status === "saving" ? "Saving…" : "Save product"}
        </button>
        {status === "error" && <p className="font-mono text-xs text-red-600">Failed to save. Check the slug is unique.</p>}
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-ink/60">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
