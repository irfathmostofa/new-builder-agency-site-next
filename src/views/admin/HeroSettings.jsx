"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { invalidate } from "../../lib/queries";
import ImageUploader from "../../components/ImageUploader";

export default function HeroSettings() {
  const [settings, setSettings] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).single()
      .then(({ data }) => setSettings(data));
    supabase.from("buildings").select("id, name").order("name")
      .then(({ data }) => setBuildings(data ?? []));
  }, []);

  function updateField(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
  }

  function updateStat(index, field, value) {
    setSettings((s) => {
      const stats = [...(s.stats ?? [])];
      stats[index] = { ...stats[index], [field]: value };
      return { ...s, stats };
    });
  }

  function addStat() {
    setSettings((s) => ({ ...s, stats: [...(s.stats ?? []), { value: "", label: "" }] }));
  }

  function removeStat(index) {
    setSettings((s) => ({ ...s, stats: (s.stats ?? []).filter((_, i) => i !== index) }));
  }

  function updateClient(index, field, value) {
    setSettings((s) => {
      const clients = [...(s.clients ?? [])];
      clients[index] = { ...clients[index], [field]: value };
      return { ...s, clients };
    });
  }

  function addClient() {
    setSettings((s) => ({ ...s, clients: [...(s.clients ?? []), { name: "", logo_url: "" }] }));
  }

  function removeClient(index) {
    setSettings((s) => ({ ...s, clients: (s.clients ?? []).filter((_, i) => i !== index) }));
  }

  function updateSocial(index, field, value) {
    setSettings((s) => {
      const social_links = [...(s.social_links ?? [])];
      social_links[index] = { ...social_links[index], [field]: value };
      return { ...s, social_links };
    });
  }

  function addSocial() {
    setSettings((s) => ({ ...s, social_links: [...(s.social_links ?? []), { platform: "facebook", url: "" }] }));
  }

  function removeSocial(index) {
    setSettings((s) => ({ ...s, social_links: (s.social_links ?? []).filter((_, i) => i !== index) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setStatus("saving");
    const { error } = await supabase.from("site_settings").update(settings).eq("id", 1);
    if (!error) invalidate("settings");
    setStatus(error ? "error" : "saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  if (!settings) return <p className="font-mono text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold text-ink">Hero & Home</h1>
      <p className="mt-2 font-mono text-xs text-ink/50">
        Controls the logo, hero, and every section on the home page.
      </p>

      <form onSubmit={handleSave} className="mt-8 space-y-10">
        {/* Brand */}
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Brand</legend>
          <Field label="Site name">
            <input value={settings.site_name ?? ""} onChange={(e) => updateField("site_name", e.target.value)} className="input" />
          </Field>
          <ImageUploader
            label="Logo (leave blank to show site name as text)"
            value={settings.logo_url ?? ""}
            onChange={(url) => updateField("logo_url", url)}
          />
        </fieldset>

        {/* Hero */}
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Hero</legend>
          <Field label="Hero eyebrow (small label above headline)">
            <input value={settings.hero_eyebrow ?? ""} onChange={(e) => updateField("hero_eyebrow", e.target.value)} className="input" />
          </Field>
          <Field label="Hero headline">
            <input value={settings.hero_headline ?? ""} onChange={(e) => updateField("hero_headline", e.target.value)} className="input" />
          </Field>
          <Field label="Featured building for hero (blueprint scroll effect)">
            <select value={settings.hero_building_id ?? ""} onChange={(e) => updateField("hero_building_id", e.target.value || null)} className="input">
              <option value="">— Use first featured building —</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </fieldset>

        {/* Intro + About */}
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Intro & About section</legend>
          <Field label="Intro statement heading">
            <textarea value={settings.intro_heading ?? ""} onChange={(e) => updateField("intro_heading", e.target.value)} rows={3} className="input" />
          </Field>
          <Field label="About label">
            <input value={settings.about_heading ?? ""} onChange={(e) => updateField("about_heading", e.target.value)} className="input" />
          </Field>
          <Field label="About body text">
            <textarea value={settings.about_body ?? ""} onChange={(e) => updateField("about_body", e.target.value)} rows={4} className="input" />
          </Field>
          <ImageUploader
            label="About image"
            value={settings.about_image ?? ""}
            onChange={(url) => updateField("about_image", url)}
          />
        </fieldset>

        {/* Section headings */}
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Section headings</legend>
          <Field label="Featured buildings section heading">
            <input value={settings.featured_section_heading ?? ""} onChange={(e) => updateField("featured_section_heading", e.target.value)} className="input" />
          </Field>
          <Field label="Gallery section heading">
            <input value={settings.gallery_section_heading ?? ""} onChange={(e) => updateField("gallery_section_heading", e.target.value)} className="input" />
          </Field>
          <Field label="Products section heading">
            <input value={settings.products_section_heading ?? ""} onChange={(e) => updateField("products_section_heading", e.target.value)} className="input" />
          </Field>
          <Field label="CTA heading">
            <input value={settings.cta_heading ?? ""} onChange={(e) => updateField("cta_heading", e.target.value)} className="input" />
          </Field>
          <Field label="CTA button text">
            <input value={settings.cta_button_text ?? ""} onChange={(e) => updateField("cta_button_text", e.target.value)} className="input" />
          </Field>
        </fieldset>

        {/* Brochure */}
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Brochure download</legend>
          <Field label="Brochure file URL (PDF — upload to Supabase Storage and paste the public URL)">
            <input value={settings.brochure_url ?? ""} onChange={(e) => updateField("brochure_url", e.target.value)} className="input" />
          </Field>
          <Field label="Brochure button label">
            <input value={settings.brochure_label ?? ""} onChange={(e) => updateField("brochure_label", e.target.value)} className="input" />
          </Field>
        </fieldset>

        {/* Stats */}
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Stats row</legend>
          <div className="mt-4 space-y-3">
            {(settings.stats ?? []).map((stat, i) => (
              <div key={i} className="flex gap-3">
                <input value={stat.value ?? ""} onChange={(e) => updateStat(i, "value", e.target.value)} placeholder="Value, e.g. 140" className="input" />
                <input value={stat.label ?? ""} onChange={(e) => updateStat(i, "label", e.target.value)} placeholder="Label, e.g. Projects" className="input" />
                <button type="button" onClick={() => removeStat(i)} className="px-3 font-mono text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addStat} className="mt-3 font-mono text-xs uppercase tracking-widest text-steel hover:text-ink">
            + Add stat
          </button>
        </fieldset>

        {/* Clients */}
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Clients / trusted-by logos</legend>
          <div className="mt-4 space-y-3">
            {(settings.clients ?? []).map((client, i) => (
              <div key={i} className="space-y-3 border border-ink/10 p-4">
                <div className="flex gap-3">
                  <input value={client.name ?? ""} onChange={(e) => updateClient(i, "name", e.target.value)} placeholder="Client name" className="input" />
                  <button type="button" onClick={() => removeClient(i)} className="px-3 font-mono text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <ImageUploader
                  label="Logo"
                  value={client.logo_url ?? ""}
                  onChange={(url) => updateClient(i, "logo_url", url)}
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={addClient} className="mt-3 font-mono text-xs uppercase tracking-widest text-steel hover:text-ink">
            + Add client
          </button>
        </fieldset>

        {/* Social & WhatsApp */}
        <fieldset>
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Social links & WhatsApp</legend>
          <div className="mt-4">
            <Field label="WhatsApp number (digits only, with country code, e.g. 8801XXXXXXXXX)">
              <input value={settings.whatsapp_number ?? ""} onChange={(e) => updateField("whatsapp_number", e.target.value)} className="input" />
            </Field>
          </div>
          <div className="mt-4 space-y-3">
            {(settings.social_links ?? []).map((link, i) => (
              <div key={i} className="flex gap-3">
                <select value={link.platform ?? "facebook"} onChange={(e) => updateSocial(i, "platform", e.target.value)} className="input w-40">
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="youtube">YouTube</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="other">Other</option>
                </select>
                <input value={link.url ?? ""} onChange={(e) => updateSocial(i, "url", e.target.value)} placeholder="Profile URL" className="input" />
                <button type="button" onClick={() => removeSocial(i)} className="px-3 font-mono text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addSocial} className="mt-3 font-mono text-xs uppercase tracking-widest text-steel hover:text-ink">
            + Add social link
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {status === "saved" && <p className="font-mono text-xs text-steel">Saved.</p>}
        {status === "error" && <p className="font-mono text-xs text-red-600">Failed to save.</p>}
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
