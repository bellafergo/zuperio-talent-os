/**
 * Builds the public origin for server-side navigation (e.g. Puppeteer → document-print).
 * Prefer proxy headers when present (Vercel, etc.).
 *
 * Set `INTERNAL_PDF_APP_ORIGIN` (e.g. `http://127.0.0.1:3000`) when the incoming `Host`
 * / `x-forwarded-*` values are wrong for loopback fetches (Docker, split networking).
 */
export function resolveAppOriginFromHeaders(headersList: {
  get(name: string): string | null;
}): string {
  const fromEnv = process.env.INTERNAL_PDF_APP_ORIGIN?.trim();
  if (fromEnv) {
    const origin = fromEnv.replace(/\/$/, "");
    console.info("[resolve-app-origin] INTERNAL_PDF_APP_ORIGIN", origin);
    return origin;
  }

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
