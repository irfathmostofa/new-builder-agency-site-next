export function slugify(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function htmlToText(html) {
  return String(html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(html, limit = 110) {
  const value = htmlToText(html);
  if (!value) return "";
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).replace(/\s+\S*$/, "").trimEnd()}…`;
}

export function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(String(value ?? ""));
}

export function serviceSlug(service) {
  return slugify(service?.title) || String(service?.id ?? "");
}

export function servicePath(service) {
  return `/what-we-do/${serviceSlug(service)}`;
}
