import JsonLd from "./JsonLd";
import { getSeoSettingsCached } from "../lib/seoStore";
import { absoluteUrl, STATIC_SEO_PAGES } from "../lib/seoDefaults";

export default async function SiteJsonLd() {
  const settings = await getSeoSettingsCached();
  const origin = settings.site_url;
  if (!origin) return null;

  const orgName = settings.organization_name || settings.default_title;
  const logo = settings.organization_logo || settings.default_og_image;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: orgName,
    url: origin,
    logo: logo ? absoluteUrl(origin, logo) : undefined,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: orgName,
    url: origin,
    publisher: { "@type": "Organization", name: orgName },
  };

  const nav = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: STATIC_SEO_PAGES.map((page) => page.label),
    url: STATIC_SEO_PAGES.map((page) => absoluteUrl(origin, page.path)),
  };

  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
      <JsonLd data={nav} />
    </>
  );
}
