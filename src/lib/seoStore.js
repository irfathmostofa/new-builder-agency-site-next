import { supabase } from "./supabaseClient";
import { cached, peek, invalidate } from "./cache";
import {
  DEFAULT_SEO,
  DEFAULT_PAGE_SEO,
  defaultRobotsTxt,
  truncateMeta,
} from "./seoDefaults";
import { excerpt } from "./content";

const SEO_TTL = 60 * 1000;

function normalizeSettings(row) {
  if (!row) return { ...DEFAULT_SEO };
  return {
    ...DEFAULT_SEO,
    ...row,
    index_site: row.index_site !== false,
    sitemap_enabled: row.sitemap_enabled !== false,
  };
}

export async function fetchSeoSettings() {
  const { data, error } = await supabase.from("seo_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return { settings: { ...DEFAULT_SEO }, missing: true, error };
  if (!data) return { settings: { ...DEFAULT_SEO }, missing: true, error: null };
  return { settings: normalizeSettings(data), missing: false, error: null };
}

export function getSeoSettingsCached() {
  return cached("seo-settings", async () => {
    const { settings } = await fetchSeoSettings();
    return settings;
  }, SEO_TTL);
}

export async function fetchSeoPages() {
  const { data, error } = await supabase.from("seo_pages").select("*").order("path");
  if (error) return { pages: [], missing: true, error };
  return { pages: data ?? [], missing: false, error: null };
}

export function getSeoPagesCached() {
  return cached("seo-pages", async () => {
    const { pages } = await fetchSeoPages();
    return pages;
  }, SEO_TTL);
}

export async function fetchSeoPage(path) {
  const { data, error } = await supabase.from("seo_pages").select("*").eq("path", path).maybeSingle();
  if (error) return null;
  return data ?? null;
}

export function getSeoPageCached(path) {
  return cached(`seo-page:${path}`, () => fetchSeoPage(path), SEO_TTL);
}

export function peekSeoPage(path) {
  return peek(`seo-page:${path}`);
}

export function invalidateSeo() {
  invalidate("seo");
}

export async function saveSeoSettings(payload) {
  const row = {
    id: 1,
    site_url: payload.site_url ?? "",
    default_title: payload.default_title ?? DEFAULT_SEO.default_title,
    title_template: payload.title_template ?? DEFAULT_SEO.title_template,
    default_description: payload.default_description ?? DEFAULT_SEO.default_description,
    default_og_image: payload.default_og_image ?? "",
    twitter_handle: payload.twitter_handle ?? "",
    gsc_verification: payload.gsc_verification ?? "",
    bing_verification: payload.bing_verification ?? "",
    organization_name: payload.organization_name ?? "",
    organization_logo: payload.organization_logo ?? "",
    index_site: payload.index_site !== false,
    sitemap_enabled: payload.sitemap_enabled !== false,
    robots_txt: payload.robots_txt ?? "",
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("seo_settings").upsert(row, { onConflict: "id" });
  if (!error) invalidateSeo();
  return { error };
}

export async function saveSeoPage(payload) {
  const row = {
    path: payload.path,
    meta_title: payload.meta_title ?? "",
    meta_description: payload.meta_description ?? "",
    og_image: payload.og_image ?? "",
    canonical: payload.canonical ?? "",
    noindex: Boolean(payload.noindex),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("seo_pages").upsert(row, { onConflict: "path" });
  if (!error) invalidateSeo();
  return { error };
}

export function resolvePageSeo(path, item, settings, pageRow) {
  const defaults = DEFAULT_PAGE_SEO[path] || {};
  const title =
    pageRow?.meta_title ||
    item?.meta_title ||
    item?.name ||
    item?.title ||
    defaults.meta_title ||
    settings?.default_title ||
    DEFAULT_SEO.default_title;
  const description = truncateMeta(
    pageRow?.meta_description ||
      item?.meta_description ||
      item?.excerpt ||
      excerpt(item?.description || item?.short_description || item?.full_description || item?.content || "", 160) ||
      defaults.meta_description ||
      settings?.default_description ||
      DEFAULT_SEO.default_description,
  );
  const image =
    pageRow?.og_image ||
    item?.og_image ||
    item?.cover_image ||
    item?.image ||
    item?.hero_image ||
    item?.image_url ||
    settings?.default_og_image ||
    "";
  const noindex = Boolean(pageRow?.noindex) || settings?.index_site === false;
  return {
    title,
    description,
    image,
    noindex,
    canonical: pageRow?.canonical || "",
  };
}

export function robotsBody(settings) {
  if (settings?.robots_txt?.trim()) return settings.robots_txt.trim() + "\n";
  if (settings?.index_site === false) {
    return "User-agent: *\nDisallow: /\n";
  }
  return defaultRobotsTxt(settings?.site_url || "");
}
