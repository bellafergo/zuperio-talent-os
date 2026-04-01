/**
 * Builds the public origin for server-side navigation (e.g. Puppeteer → document-print).
 * Prefer proxy headers when present (Vercel, etc.).
 */
export function resolveAppOriginFromHeaders(headersList: {
  get(name: string): string | null;
}): string {
  const host =
    headersList.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headersList.get("host")?.trim() ||
    "localhost:3000";
  const forwardedProto = headersList.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const proto =
    forwardedProto ||
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");
  return `${proto}://${host}`;
}
