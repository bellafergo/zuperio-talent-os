/**
 * Headers for binary PDF downloads (browser + fetch(blob) clients).
 * Uses RFC 5987 `filename*` for non-ASCII names; ASCII `filename` fallback for older clients.
 */
export function pdfAttachmentHeaders(filename: string): Record<string, string> {
  const asciiFallback = filename
    .replace(/["\\]/g, "_")
    .replace(/[^\x20-\x7E]+/g, "_")
    .slice(0, 180) || "document.pdf";
  const filenameStar = encodeURIComponent(filename);
  return {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${asciiFallback}"; filename*=UTF-8''${filenameStar}`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  };
}
