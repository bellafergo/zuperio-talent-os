/**
 * Normalizes a host for dedupe (lowercase, strips leading `www.`).
 * Does not implement full eTLD+1 handling; sufficient for typical B2B domains.
 */
export function normalizeHostname(host: string): string {
  const h = host.trim().toLowerCase();
  return h.startsWith("www.") ? h.slice(4) : h;
}

/** Returns normalized hostname or null if the string is not a usable HTTP(S) URL. */
export function hostnameFromWebsiteUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return normalizeHostname(url.hostname);
  } catch {
    return null;
  }
}
