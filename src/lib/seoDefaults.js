export const DEFAULT_SEO = {
  site_url: "",
  default_title: "Meridian Builders",
  title_template: "%s | Meridian Builders",
  default_description:
    "Structures designed with intent, built to last, documented from blueprint to handover.",
  default_og_image: "",
  twitter_handle: "",
  gsc_verification: "",
  bing_verification: "",
  organization_name: "Meridian Builders",
  organization_logo: "",
  index_site: true,
  sitemap_enabled: true,
  robots_txt: "",
};

export const STATIC_SEO_PAGES = [
  { path: "/", label: "Home" },
  { path: "/buildings", label: "Buildings" },
  { path: "/products", label: "Products" },
  { path: "/gallery", label: "Gallery" },
  { path: "/what-we-do", label: "What We Do" },
  { path: "/blog", label: "Journal" },
  { path: "/board", label: "Board" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
];

export const DEFAULT_PAGE_SEO = {
  "/": {
    meta_title: "Meridian Builders",
    meta_description:
      "Award-minded construction studio turning blueprints into lasting buildings — residential, commercial, and civic work.",
  },
  "/buildings": {
    meta_title: "Buildings",
    meta_description:
      "Explore completed and in-progress buildings from Meridian Builders, filtered by type and documented from concept to handover.",
  },
  "/products": {
    meta_title: "Products",
    meta_description:
      "Materials and products we build with — specified, sourced, and proven on our own sites.",
  },
  "/gallery": {
    meta_title: "Gallery",
    meta_description:
      "Site photography and construction details from Meridian Builders projects.",
  },
  "/what-we-do": {
    meta_title: "What We Do",
    meta_description:
      "In-house construction services from planning and permitting through build and handover.",
  },
  "/blog": {
    meta_title: "Journal",
    meta_description:
      "Notes from the field — process, materials, and the work of building well.",
  },
  "/board": {
    meta_title: "Board of Directors",
    meta_description:
      "Leadership at Meridian Builders — the people accountable for every line we draw and every wall we raise.",
  },
  "/about": {
    meta_title: "About",
    meta_description:
      "Two decades turning blueprints into places people live, work, and gather.",
  },
  "/contact": {
    meta_title: "Contact",
    meta_description:
      "Tell us about your site. We'll walk it, draw it, and build it with the same team start to finish.",
  },
};

export function defaultRobotsTxt(siteUrl) {
  const sitemapLine = siteUrl ? `\nSitemap: ${siteUrl.replace(/\/$/, "")}/sitemap.xml\n` : "\n";
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/${sitemapLine}`;
}

export function absoluteUrl(base, path = "/") {
  if (!path) return base || "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = String(base || "").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return origin ? `${origin}${suffix}` : suffix;
}

export function applyTitleTemplate(title, template, defaultTitle) {
  const value = title || defaultTitle || DEFAULT_SEO.default_title;
  const pattern = template || DEFAULT_SEO.title_template;
  if (!pattern || !pattern.includes("%s")) return value;
  if (value === defaultTitle || value === DEFAULT_SEO.default_title) return value;
  return pattern.replace("%s", value);
}

export function truncateMeta(text, limit = 160) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).replace(/\s+\S*$/, "").trimEnd()}…`;
}
