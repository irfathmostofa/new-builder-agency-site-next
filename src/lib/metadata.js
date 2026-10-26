import { getProduct, getBuilding, getService, getPost, getSiteSettings } from "./queries";
import { getSeoSettingsCached, getSeoPageCached, resolvePageSeo } from "./seoStore";
import { applyTitleTemplate, absoluteUrl, DEFAULT_SEO } from "./seoDefaults";

function safeUrl(value) {
  if (!value) return undefined;
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export async function getResolvedSeo(path, item) {
  const [settings, pageRow] = await Promise.all([
    getSeoSettingsCached(),
    getSeoPageCached(path),
  ]);
  const resolved = resolvePageSeo(path, item, settings, pageRow);
  const title = applyTitleTemplate(
    resolved.title,
    settings.title_template,
    settings.default_title,
  );
  const canonical = resolved.canonical || absoluteUrl(settings.site_url, path);
  const image = resolved.image ? absoluteUrl(settings.site_url, resolved.image) : "";
  return { settings, resolved, title, canonical, image };
}

export async function buildMetadata(path, item) {
  const { settings, resolved, title, canonical, image } = await getResolvedSeo(path, item);
  const siteName = settings.organization_name || settings.default_title || DEFAULT_SEO.default_title;

  return {
    title: { absolute: title },
    description: resolved.description,
    metadataBase: safeUrl(settings.site_url),
    alternates: canonical ? { canonical } : undefined,
    robots: resolved.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description: resolved.description,
      url: canonical || undefined,
      siteName,
      type: item ? "article" : "website",
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description: resolved.description,
      images: image ? [image] : undefined,
      creator: settings.twitter_handle || undefined,
    },
  };
}

export async function buildRootMetadata() {
  const [settings, site] = await Promise.all([getSeoSettingsCached(), getSiteSettings()]);
  const defaultTitle = settings.default_title || site?.site_name || DEFAULT_SEO.default_title;
  const template = settings.title_template || DEFAULT_SEO.title_template;
  const description = settings.default_description || DEFAULT_SEO.default_description;
  const verification = {};
  if (settings.gsc_verification) verification.google = settings.gsc_verification;
  if (settings.bing_verification) verification.other = { "msvalidate.01": settings.bing_verification };

  return {
    metadataBase: safeUrl(settings.site_url),
    title: {
      default: defaultTitle,
      template: template.includes("%s") ? template : `%s | ${defaultTitle}`,
    },
    description,
    icons: { icon: "/favicon.svg" },
    verification,
    alternates: {
      types: { "application/xml": "/sitemap.xml" },
    },
    robots: settings.index_site === false ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      siteName: settings.organization_name || defaultTitle,
      type: "website",
      images: settings.default_og_image ? [{ url: settings.default_og_image }] : undefined,
    },
    twitter: {
      card: settings.default_og_image ? "summary_large_image" : "summary",
      creator: settings.twitter_handle || undefined,
    },
  };
}

export async function loadSlugItem(kind, slug) {
  if (!slug) return null;
  if (kind === "product") return getProduct(slug);
  if (kind === "building") return getBuilding(slug);
  if (kind === "service") return getService(slug);
  if (kind === "post") return getPost(slug);
  return null;
}

export async function buildSlugMetadata(kind, slug) {
  const item = await loadSlugItem(kind, slug);
  const pathMap = {
    product: `/products/${slug}`,
    building: `/buildings/${slug}`,
    service: `/what-we-do/${slug}`,
    post: `/blog/${slug}`,
  };
  return buildMetadata(pathMap[kind], item);
}
