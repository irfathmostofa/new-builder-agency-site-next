"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchSeoSettings,
  fetchSeoPages,
  saveSeoSettings,
  saveSeoPage,
} from "../../lib/seoStore";
import { DEFAULT_SEO, DEFAULT_PAGE_SEO, STATIC_SEO_PAGES, defaultRobotsTxt } from "../../lib/seoDefaults";
import ImageUploader from "../../components/ImageUploader";

const emptyPage = {
  path: "",
  meta_title: "",
  meta_description: "",
  og_image: "",
  canonical: "",
  noindex: false,
};

export default function SeoManager() {
  const [settings, setSettings] = useState({ ...DEFAULT_SEO });
  const [pages, setPages] = useState([]);
  const [pageForm, setPageForm] = useState(emptyPage);
  const [status, setStatus] = useState("idle");
  const [pageStatus, setPageStatus] = useState("idle");
  const [missing, setMissing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    async function load() {
      const [settingsResult, pagesResult] = await Promise.all([fetchSeoSettings(), fetchSeoPages()]);
      setSettings(settingsResult.settings);
      setPages(pagesResult.pages);
      setMissing(Boolean(settingsResult.missing || pagesResult.missing));
      const err = settingsResult.error || pagesResult.error;
      if (err && /relation|does not exist|schema cache/i.test(err.message || "")) {
        setMissing(true);
      }
    }
    load();
  }, []);

  const origin = (settings.site_url || "").replace(/\/$/, "");
  const sitemapUrl = origin ? `${origin}/sitemap.xml` : "/sitemap.xml";
  const robotsUrl = origin ? `${origin}/robots.txt` : "/robots.txt";

  const selectedDefaults = useMemo(
    () => DEFAULT_PAGE_SEO[pageForm.path] || { meta_title: "", meta_description: "" },
    [pageForm.path],
  );

  function updateSetting(field, value) {
    setSettings((s) => ({ ...s, [field]: value }));
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setStatus("saving");
    setErrorMessage("");
    const { error } = await saveSeoSettings(settings);
    if (error) {
      setStatus("error");
      setErrorMessage(error.message || "Failed to save.");
      if (/relation|does not exist|schema cache/i.test(error.message || "")) setMissing(true);
      return;
    }
    setStatus("saved");
    setMissing(false);
    setTimeout(() => setStatus("idle"), 2000);
  }

  function fillPage(path) {
    const existing = pages.find((p) => p.path === path);
    const defaults = DEFAULT_PAGE_SEO[path] || {};
    setPageForm({
      path,
      meta_title: existing?.meta_title || defaults.meta_title || "",
      meta_description: existing?.meta_description || defaults.meta_description || "",
      og_image: existing?.og_image || "",
      canonical: existing?.canonical || "",
      noindex: Boolean(existing?.noindex),
    });
  }

  async function handleSavePage(e) {
    e.preventDefault();
    if (!pageForm.path) return;
    setPageStatus("saving");
    const { error } = await saveSeoPage(pageForm);
    if (error) {
      setPageStatus("error");
      setErrorMessage(error.message || "Failed to save page SEO.");
      if (/relation|does not exist|schema cache/i.test(error.message || "")) setMissing(true);
      return;
    }
    setPages((list) => {
      const next = list.filter((p) => p.path !== pageForm.path);
      return [...next, { ...pageForm }].sort((a, b) => a.path.localeCompare(b.path));
    });
    setPageStatus("saved");
    setTimeout(() => setPageStatus("idle"), 2000);
  }

  async function copyText(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  function applyDefaultRobots() {
    updateSetting("robots_txt", defaultRobotsTxt(settings.site_url));
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-semibold text-ink">SEO</h1>
      <p className="mt-2 font-mono text-xs text-ink/50">
        Meta titles, descriptions, sitemap, robots.txt, and Google Search Console — all managed here.
      </p>

      {missing && (
        <div className="mt-6 border border-amber/40 bg-amber/10 p-4 font-mono text-xs leading-relaxed text-ink/80">
          SEO tables are not in Supabase yet. Open the SQL editor and run `supabase/seo.sql`, then reload this page.
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="mt-10 space-y-10">
        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Site defaults</legend>
          <Field label="Public site URL (used in sitemap, canonical, and Open Graph)">
            <input
              value={settings.site_url ?? ""}
              onChange={(e) => updateSetting("site_url", e.target.value)}
              placeholder="https://www.example.com"
              className="input"
            />
          </Field>
          <Field label="Default title">
            <input
              value={settings.default_title ?? ""}
              onChange={(e) => updateSetting("default_title", e.target.value)}
              className="input"
            />
          </Field>
          <Field label='Title template (use %s for the page title)'>
            <input
              value={settings.title_template ?? ""}
              onChange={(e) => updateSetting("title_template", e.target.value)}
              placeholder="%s | Meridian Builders"
              className="input"
            />
          </Field>
          <Field label="Default meta description">
            <textarea
              value={settings.default_description ?? ""}
              onChange={(e) => updateSetting("default_description", e.target.value)}
              rows={3}
              className="input"
            />
            <CharCount value={settings.default_description} limit={160} />
          </Field>
          <ImageUploader
            label="Default Open Graph image"
            value={settings.default_og_image ?? ""}
            onChange={(url) => updateSetting("default_og_image", url)}
          />
          <Field label="Organization name (schema.org)">
            <input
              value={settings.organization_name ?? ""}
              onChange={(e) => updateSetting("organization_name", e.target.value)}
              className="input"
            />
          </Field>
          <ImageUploader
            label="Organization logo"
            value={settings.organization_logo ?? ""}
            onChange={(url) => updateSetting("organization_logo", url)}
          />
          <Field label="Twitter / X handle">
            <input
              value={settings.twitter_handle ?? ""}
              onChange={(e) => updateSetting("twitter_handle", e.target.value)}
              placeholder="@meridian"
              className="input"
            />
          </Field>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Google Search Console</legend>
          <p className="font-body text-sm text-ink/70">
            In Search Console, choose HTML tag verification and paste the content value here.
            Sitemap URL to submit: {sitemapUrl}
          </p>
          <Field label="Google Search Console verification (content value of the meta tag)">
            <input
              value={settings.gsc_verification ?? ""}
              onChange={(e) => updateSetting("gsc_verification", e.target.value)}
              placeholder="google-site-verification token"
              className="input"
            />
          </Field>
          <Field label="Bing Webmaster verification (optional)">
            <input
              value={settings.bing_verification ?? ""}
              onChange={(e) => updateSetting("bing_verification", e.target.value)}
              className="input"
            />
          </Field>
          <div className="flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-widest">
            <CopyButton
              label={copied === "sitemap" ? "Copied" : "Copy sitemap URL"}
              onClick={() => copyText(sitemapUrl, "sitemap")}
            />
            <CopyButton
              label={copied === "robots" ? "Copied" : "Copy robots.txt URL"}
              onClick={() => copyText(robotsUrl, "robots")}
            />
          </div>
        </fieldset>

        <fieldset className="space-y-6">
          <legend className="font-mono text-xs uppercase tracking-widest text-amber">Indexing</legend>
          <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
            <input
              type="checkbox"
              checked={settings.index_site !== false}
              onChange={(e) => updateSetting("index_site", e.target.checked)}
            />
            Allow search engines to index this site
          </label>
          <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
            <input
              type="checkbox"
              checked={settings.sitemap_enabled !== false}
              onChange={(e) => updateSetting("sitemap_enabled", e.target.checked)}
            />
            Include sitemap.xml
          </label>
          <Field label="robots.txt (leave blank to generate automatically)">
            <textarea
              value={settings.robots_txt ?? ""}
              onChange={(e) => updateSetting("robots_txt", e.target.value)}
              rows={8}
              className="input font-mono text-xs"
              placeholder={defaultRobotsTxt(settings.site_url)}
            />
          </Field>
          <button
            type="button"
            onClick={applyDefaultRobots}
            className="font-mono text-xs uppercase tracking-widest text-steel hover:text-ink"
          >
            Fill default robots.txt
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50"
        >
          {status === "saving" ? "Saving…" : "Save SEO settings"}
        </button>
        {status === "saved" && <p className="font-mono text-xs text-steel">Saved.</p>}
        {status === "error" && (
          <p className="font-mono text-xs text-red-600">{errorMessage || "Failed to save."}</p>
        )}
      </form>

      <form onSubmit={handleSavePage} className="mt-16 space-y-6 border-t border-ink/10 pt-10">
        <h2 className="font-mono text-xs uppercase tracking-widest text-amber">Page meta</h2>
        <p className="font-body text-sm text-ink/70">
          Override title and description per public page. Product, service, building, and journal slugs fall back to their own names when a page override is empty.
        </p>
        <Field label="Page">
          <select
            value={STATIC_SEO_PAGES.some((p) => p.path === pageForm.path) ? pageForm.path : pageForm.path ? "__custom__" : ""}
            onChange={(e) => {
              if (e.target.value === "__custom__") {
                setPageForm({ ...emptyPage, path: "/products/" });
                return;
              }
              fillPage(e.target.value);
            }}
            className="input"
          >
            <option value="">— Select a page —</option>
            {STATIC_SEO_PAGES.map((page) => (
              <option key={page.path} value={page.path}>
                {page.label} ({page.path})
              </option>
            ))}
            <option value="__custom__">Custom path (product / service / building / journal slug)</option>
          </select>
        </Field>
        {pageForm.path && !STATIC_SEO_PAGES.some((p) => p.path === pageForm.path) && (
          <Field label="Custom path">
            <input
              value={pageForm.path}
              onChange={(e) => setPageForm((f) => ({ ...f, path: e.target.value.startsWith("/") ? e.target.value : `/${e.target.value}` }))}
              placeholder="/products/your-slug"
              className="input"
            />
          </Field>
        )}
        {pageForm.path && (
          <>
            <Field label="Meta title">
              <input
                value={pageForm.meta_title}
                onChange={(e) => setPageForm((f) => ({ ...f, meta_title: e.target.value }))}
                placeholder={selectedDefaults.meta_title}
                className="input"
              />
              <CharCount value={pageForm.meta_title} limit={60} />
            </Field>
            <Field label="Meta description">
              <textarea
                value={pageForm.meta_description}
                onChange={(e) => setPageForm((f) => ({ ...f, meta_description: e.target.value }))}
                placeholder={selectedDefaults.meta_description}
                rows={3}
                className="input"
              />
              <CharCount value={pageForm.meta_description} limit={160} />
            </Field>
            <ImageUploader
              label="Open Graph image (optional)"
              value={pageForm.og_image}
              onChange={(url) => setPageForm((f) => ({ ...f, og_image: url }))}
            />
            <Field label="Canonical URL (optional override)">
              <input
                value={pageForm.canonical}
                onChange={(e) => setPageForm((f) => ({ ...f, canonical: e.target.value }))}
                className="input"
              />
            </Field>
            <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink/70">
              <input
                type="checkbox"
                checked={pageForm.noindex}
                onChange={(e) => setPageForm((f) => ({ ...f, noindex: e.target.checked }))}
              />
              Noindex this page
            </label>
            <button
              type="submit"
              disabled={pageStatus === "saving"}
              className="bg-ink px-8 py-3 font-mono text-xs uppercase tracking-widest text-paper hover:bg-steel disabled:opacity-50"
            >
              {pageStatus === "saving" ? "Saving…" : "Save page SEO"}
            </button>
            {pageStatus === "saved" && <p className="font-mono text-xs text-steel">Page SEO saved.</p>}
            {pageStatus === "error" && (
              <p className="font-mono text-xs text-red-600">{errorMessage || "Failed to save page SEO."}</p>
            )}
          </>
        )}
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

function CharCount({ value, limit }) {
  const length = String(value ?? "").length;
  const over = length > limit;
  return (
    <p className={`mt-1 font-mono text-[10px] ${over ? "text-red-600" : "text-ink/40"}`}>
      {length}/{limit}
    </p>
  );
}

function CopyButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-ink/20 px-3 py-2 text-ink/70 hover:border-ink hover:text-ink"
    >
      {label}
    </button>
  );
}
