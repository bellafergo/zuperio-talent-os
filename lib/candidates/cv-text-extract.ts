/**
 * Best-effort text extraction for autofill. PDF is supported; DOC/DOCX upload still works without extraction.
 *
 * We import from pdf-parse/lib/pdf-parse.js (not the package root index.js) to bypass a
 * well-known issue: pdf-parse/index.js calls fs.readFileSync('./test/data/05-versions-space.pdf')
 * at module load time when module.parent is falsy (ESM dynamic import context in Next.js App Router),
 * which throws ENOENT and silently aborts all PDF extraction.
 */

export async function extractTextFromCvBuffer(
  buffer: Buffer,
  fileName: string,
): Promise<string | null> {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext !== "pdf") {
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = await import("pdf-parse/lib/pdf-parse.js" as any);
    const pdfParse = (mod as { default?: (b: Buffer) => Promise<{ text?: string }> })
      .default;
    if (typeof pdfParse !== "function") {
      console.error("[extractTextFromCvBuffer] pdf-parse default export is not a function — extraction skipped");
      return null;
    }
    const data = await pdfParse(buffer);
    const raw = data?.text;
    const text = typeof raw === "string" ? raw.trim() : "";
    console.log(`[extractTextFromCvBuffer] CV text extracted: ${text.length} chars`);
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error("[extractTextFromCvBuffer] pdf-parse failed", err);
    return null;
  }
}
