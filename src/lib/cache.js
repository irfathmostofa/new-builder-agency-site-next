import { loadCookieCache, saveCookieCache, clearCookieCache } from "./cookieCache";

const DEFAULT_TTL = 2 * 60 * 1000;

const memory = new Map();
const inflight = new Map();
const COOKIE_KEYS = new Set([
  "settings",
  "building-types",
  "buildings:featured:any",
  "buildings:all:any",
  "products:all",
  "products:featured",
  "product-categories",
  "services",
  "posts",
  "gallery",
  "board",
  "media",
  "seo-settings",
]);

let cookieHydrated = false;

function persistable(key) {
  if (COOKIE_KEYS.has(key)) return true;
  return key.startsWith("buildings:") || key.startsWith("products:") || key.startsWith("seo-");
}

function compactValue(key, value) {
  if (!Array.isArray(value)) {
    if (value && typeof value === "object" && key === "settings") {
      const rest = { ...value };
      delete rest.about_body;
      delete rest.intro_heading;
      return rest;
    }
    return value;
  }
  if (key === "media" || key === "gallery" || key === "board") {
    return value.slice(0, 40);
  }
  if (!key.startsWith("buildings") && !key.startsWith("products") && key !== "services" && key !== "posts") {
    return value;
  }
  return value.map((item) => {
    if (!item || typeof item !== "object") return item;
    const next = { ...item };
    delete next.full_description;
    delete next.content;
    delete next.description;
    return next;
  });
}

function hydrateFromCookies() {
  if (cookieHydrated) return;
  cookieHydrated = true;
  const now = Date.now();
  for (const entry of loadCookieCache()) {
    if (!entry?.k) continue;
    const ttl = Math.max(0, (entry.e || 0) - now);
    if (ttl <= 0) continue;
    memory.set(entry.k, { v: entry.v, t: now, ttl });
  }
}

function persistCookies() {
  if (typeof document === "undefined") return;
  const now = Date.now();
  const entries = [];
  for (const [key, hit] of memory.entries()) {
    if (!persistable(key)) continue;
    const expires = hit.t + hit.ttl;
    if (expires <= now) continue;
    entries.push({ k: key, v: compactValue(key, hit.v), e: expires });
  }
  saveCookieCache(entries);
}

hydrateFromCookies();

export function cacheKey(parts) {
  return parts.filter(Boolean).join(":");
}

export function peek(key) {
  hydrateFromCookies();
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.t > hit.ttl) {
    memory.delete(key);
    persistCookies();
    return undefined;
  }
  return hit.v;
}

export function setCache(key, value, ttl = DEFAULT_TTL) {
  memory.set(key, { v: value, t: Date.now(), ttl });
  persistCookies();
  return value;
}

export async function cached(key, fetcher, ttl = DEFAULT_TTL) {
  const existing = peek(key);
  if (existing !== undefined) return existing;
  if (inflight.has(key)) return inflight.get(key);

  const pending = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      setCache(key, value, ttl);
      inflight.delete(key);
      return value;
    })
    .catch((error) => {
      inflight.delete(key);
      throw error;
    });

  inflight.set(key, pending);
  return pending;
}

export function invalidate(prefix) {
  for (const key of [...memory.keys()]) {
    if (!prefix || key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(prefix)) {
      memory.delete(key);
    }
  }
  for (const key of [...inflight.keys()]) {
    if (!prefix || key === prefix || key.startsWith(`${prefix}:`) || key.startsWith(prefix)) {
      inflight.delete(key);
    }
  }
  persistCookies();
}

export function invalidateAll() {
  memory.clear();
  inflight.clear();
  clearCookieCache();
}
