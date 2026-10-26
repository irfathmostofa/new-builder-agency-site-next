import { supabase } from "../lib/supabaseClient";
import { getSeoSettingsCached } from "../lib/seoStore";
import { STATIC_SEO_PAGES, absoluteUrl } from "../lib/seoDefaults";
import { serviceSlug } from "../lib/content";

export const revalidate = 60;

export default async function sitemap() {
  const settings = await getSeoSettingsCached();
  if (settings.sitemap_enabled === false) return [];

  const origin = (settings.site_url || "").replace(/\/$/, "");
  if (!origin) return [];

  const now = new Date();
  const staticEntries = STATIC_SEO_PAGES.map((page) => ({
    url: absoluteUrl(origin, page.path),
    lastModified: now,
    changeFrequency: page.path === "/" ? "weekly" : "weekly",
    priority: page.path === "/" ? 1 : 0.8,
  }));

  const [buildings, products, services, posts] = await Promise.all([
    supabase.from("buildings").select("slug"),
    supabase.from("products").select("slug"),
    supabase.from("services").select("id, title"),
    supabase.from("blog_posts").select("slug, published").eq("published", true),
  ]);

  const buildingEntries = (buildings.data ?? [])
    .filter((row) => row.slug)
    .map((row) => ({
      url: absoluteUrl(origin, `/buildings/${row.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const productEntries = (products.data ?? [])
    .filter((row) => row.slug)
    .map((row) => ({
      url: absoluteUrl(origin, `/products/${row.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const serviceEntries = (services.data ?? []).map((row) => ({
    url: absoluteUrl(origin, `/what-we-do/${serviceSlug(row)}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postEntries = (posts.data ?? [])
    .filter((row) => row.slug)
    .map((row) => ({
      url: absoluteUrl(origin, `/blog/${row.slug}`),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticEntries, ...buildingEntries, ...productEntries, ...serviceEntries, ...postEntries];
}
