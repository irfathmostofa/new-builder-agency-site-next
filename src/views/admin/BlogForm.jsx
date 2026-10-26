"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import RichTextEditor from "../../components/Richtexteditor";
import ImageUploader from "../../components/ImageUploader";
import { slugify } from "../../lib/content";
import { invalidate } from "../../lib/queries";

const empty = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  published: false,
};

export default function BlogForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const router = useRouter();

  const [form, setForm] = useState(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (isNew) return;
    supabase.from("blog_posts").select("*").eq("id", id).single().then(({ data }) => {
      if (data) {
        setForm(data);
        setSlugTouched(true);
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function updateField(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === "title" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");

    const payload = {
      ...form,
      published_at: form.published && !form.published_at ? new Date().toISOString() : form.published_at,
    };

    const { error } = isNew
      ? await supabase.from("blog_posts").insert([payload])
      : await supabase.from("blog_posts").update(payload).eq("id", id);

    if (error) {
      setStatus("error");
      return;
    }
    invalidate("posts");
    invalidate("post");
    router.push("/admin/blog");
  }

  if (loading) return <p className="font-mono text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">
        {isNew ? "New post" : "Edit post"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Field label="Title">
          <input
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            required
            className="input"
          />
        </Field>

        <Field label="Slug (URL)">
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              updateField("slug", slugify(e.target.value));
            }}
            required
            className="input"
          />
        </Field>

        <ImageUploader
          label="Cover image"
          value={form.cover_image ?? ""}
          onChange={(url) => updateField("cover_image", url)}
        />

        <Field label="Excerpt (shown in blog listing)">
          <textarea
            value={form.excerpt ?? ""}
            onChange={(e) => updateField("excerpt", e.target.value)}
            rows={2}
            className="input"
          />
        </Field>

        <Field label="Content">
          <RichTextEditor
            key={isNew ? "new" : id}
            initialValue={form.content ?? ""}
            onChange={(html) => updateField("content", html)}
            placeholder="Write your post. You can add headings, lists, and images."
          />
        </Field>

        <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => updateField("published", e.target.checked)}
          />
          Published (visible on the public site)
        </label>

        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save post"}
        </button>
        {status === "error" && (
          <p className="font-mono text-xs text-red-600">Failed to save. Check the slug is unique.</p>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="font-mono text-xs uppercase tracking-widest text-ink/60">
        {label}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
