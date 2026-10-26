"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import RichTextEditor from "../../components/Richtexteditor";
import ImageUploader from "../../components/ImageUploader";
import { slugify } from "../../lib/content";
import { invalidate } from "../../lib/queries";

const emptyBuilding = {
  name: "",
  slug: "",
  type_id: "",
  short_description: "",
  full_description: "",
  location: "",
  year_built: "",
  area_sqft: "",
  status: "completed",
  hero_image: "",
  blueprint_image: "",
  floor_plan_url: "",
  featured: false,
  sort_order: 0,
};

export default function BuildingForm() {
  const { id } = useParams();
  const isNew = id === "new";
  const router = useRouter();

  const [form, setForm] = useState(emptyBuilding);
  const [types, setTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    supabase.from("building_types").select("*").order("name")
      .then(({ data }) => setTypes(data ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const { data: building } = await supabase.from("buildings").select("*").eq("id", id).single();
      const { data: imgs } = await supabase
        .from("building_images")
        .select("*")
        .eq("building_id", id)
        .order("sort_order");
      if (building) {
        setForm(building);
        setSlugTouched(true);
      }
      setImages(imgs ?? []);
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (field === "name" && !slugTouched) {
      setForm((f) => ({ ...f, name: value, slug: slugify(value) }));
    }
  }

  function updateImage(index, field, value) {
    setImages((imgs) => imgs.map((img, i) => (i === index ? { ...img, [field]: value } : img)));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");

    const payload = {
      ...form,
      type_id: form.type_id || null,
      year_built: form.year_built ? Number(form.year_built) : null,
      area_sqft: form.area_sqft ? Number(form.area_sqft) : null,
      sort_order: Number(form.sort_order) || 0,
    };

    let buildingId = id;

    if (isNew) {
      const { data, error } = await supabase.from("buildings").insert([payload]).select().single();
      if (error) {
        setStatus("error");
        return;
      }
      buildingId = data.id;
    } else {
      const { error } = await supabase.from("buildings").update(payload).eq("id", id);
      if (error) {
        setStatus("error");
        return;
      }
    }

    const remainingIds = new Set(images.filter((img) => img.id).map((img) => img.id));
    if (!isNew) {
      const { data: existing } = await supabase.from("building_images").select("id").eq("building_id", buildingId);
      for (const row of existing ?? []) {
        if (!remainingIds.has(row.id)) {
          await supabase.from("building_images").delete().eq("id", row.id);
        }
      }
    }

    for (const img of images) {
      if (!img.url) continue;
      if (img.id) {
        await supabase
          .from("building_images")
          .update({ url: img.url, caption: img.caption, sort_order: img.sort_order })
          .eq("id", img.id);
      } else {
        await supabase.from("building_images").insert([
          { building_id: buildingId, url: img.url, caption: img.caption, sort_order: img.sort_order },
        ]);
      }
    }

    invalidate("buildings");
    invalidate("building");
    setStatus("saved");
    router.push("/admin/buildings");
  }

  if (loading) return <p className="font-mono text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-ink">
        {isNew ? "Add building" : "Edit building"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
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
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Type">
            <select
              value={form.type_id ?? ""}
              onChange={(e) => updateField("type_id", e.target.value)}
              className="input"
            >
              <option value="">— None —</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="input"
            >
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
              <option value="planned">Planned</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Field label="Location">
            <input
              value={form.location ?? ""}
              onChange={(e) => updateField("location", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Year built">
            <input
              type="number"
              value={form.year_built ?? ""}
              onChange={(e) => updateField("year_built", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Area (sqft)">
            <input
              type="number"
              value={form.area_sqft ?? ""}
              onChange={(e) => updateField("area_sqft", e.target.value)}
              className="input"
            />
          </Field>
        </div>

        <Field label="Short description (used in listings)">
          <textarea
            value={form.short_description ?? ""}
            onChange={(e) => updateField("short_description", e.target.value)}
            rows={2}
            className="input"
          />
        </Field>

        <Field label="Full description (building detail page)">
          <RichTextEditor
            key={isNew ? "new" : id}
            initialValue={form.full_description ?? ""}
            onChange={(html) => updateField("full_description", html)}
            placeholder="Describe this building. You can add headings, lists, and images."
            minHeight="220px"
          />
        </Field>

        <ImageUploader
          label="Hero image"
          value={form.hero_image ?? ""}
          onChange={(url) => updateField("hero_image", url)}
        />
        <ImageUploader
          label="Blueprint image (line-art, for scroll effect)"
          value={form.blueprint_image ?? ""}
          onChange={(url) => updateField("blueprint_image", url)}
        />

        <Field label="Floor plan URL (optional, PDF or image)">
          <input
            value={form.floor_plan_url ?? ""}
            onChange={(e) => updateField("floor_plan_url", e.target.value)}
            className="input"
          />
        </Field>

        <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField("featured", e.target.checked)}
          />
          Featured (eligible for home hero)
        </label>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink/60">
            Gallery images
          </p>
          <div className="mt-2">
            <ImageUploader
              multiple
              values={images.map((img) => img.url).filter(Boolean)}
              onChangeMultiple={(urls) => {
                setImages((current) => {
                  const byUrl = new Map(current.filter((img) => img.url).map((img) => [img.url, img]));
                  return urls.map((url, index) => {
                    const existing = byUrl.get(url);
                    if (existing) return { ...existing, sort_order: index };
                    return { url, caption: "", _new: true, sort_order: index };
                  });
                });
              }}
            />
          </div>
          {images.filter((img) => img.url).length > 0 && (
            <div className="mt-3 space-y-3">
              {images.filter((img) => img.url).map((img, i) => (
                <div key={img.id ?? img.url ?? i} className="flex gap-3">
                  <input
                    value={img.caption ?? ""}
                    onChange={(e) => {
                      const target = images.findIndex((item) => (item.id && item.id === img.id) || item.url === img.url);
                      if (target >= 0) updateImage(target, "caption", e.target.value);
                    }}
                    placeholder="Caption (optional)"
                    className="input"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={status === "saving"}
            className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50"
          >
            {status === "saving" ? "Saving…" : "Save building"}
          </button>
          {status === "error" && (
            <p className="font-mono text-xs text-red-600">
              Failed to save. Check the slug isn't already used.
            </p>
          )}
        </div>
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
