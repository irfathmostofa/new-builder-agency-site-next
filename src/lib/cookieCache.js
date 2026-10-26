const INDEX_COOKIE = "mc_ci";
const CHUNK_PREFIX = "mc_c_";
const MAX_CHUNKS = 10;
const CHUNK_SIZE = 3200;
const MAX_ENTRY = 8000;
const TTL_DAYS = 2;

function isBrowser() {
  return typeof document !== "undefined";
}

function readCookie(name) {
  if (!isBrowser()) return "";
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (decodeURIComponent(part.slice(0, eq)) === name) {
      return decodeURIComponent(part.slice(eq + 1));
    }
  }
  return "";
}

function writeCookie(name, value, days = TTL_DAYS) {
  if (!isBrowser()) return;
  const maxAge = Math.floor(days * 86400);
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearCookie(name) {
  if (!isBrowser()) return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function chunkString(value, size) {
  const chunks = [];
  for (let i = 0; i < value.length; i += size) {
    chunks.push(value.slice(i, i + size));
  }
  return chunks;
}

export function loadCookieCache() {
  if (!isBrowser()) return [];
  const count = Number(readCookie(INDEX_COOKIE) || 0);
  if (!count) return [];
  let raw = "";
  for (let i = 0; i < count; i += 1) {
    raw += readCookie(`${CHUNK_PREFIX}${i}`);
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCookieCache(entries) {
  if (!isBrowser()) return;
  const kept = [];
  let budget = MAX_CHUNKS * CHUNK_SIZE - 2;
  for (const entry of entries) {
    const encoded = JSON.stringify(entry);
    if (encoded.length > MAX_ENTRY) continue;
    if (encoded.length + 1 > budget) continue;
    kept.push(entry);
    budget -= encoded.length + 1;
  }
  const raw = JSON.stringify(kept);
  const chunks = chunkString(raw, CHUNK_SIZE).slice(0, MAX_CHUNKS);
  const previous = Number(readCookie(INDEX_COOKIE) || 0);
  chunks.forEach((chunk, i) => writeCookie(`${CHUNK_PREFIX}${i}`, chunk));
  writeCookie(INDEX_COOKIE, String(chunks.length));
  for (let i = chunks.length; i < Math.max(previous, MAX_CHUNKS); i += 1) {
    clearCookie(`${CHUNK_PREFIX}${i}`);
  }
}

export function clearCookieCache() {
  if (!isBrowser()) return;
  const previous = Number(readCookie(INDEX_COOKIE) || 0);
  for (let i = 0; i < Math.max(previous, MAX_CHUNKS); i += 1) {
    clearCookie(`${CHUNK_PREFIX}${i}`);
  }
  clearCookie(INDEX_COOKIE);
}
