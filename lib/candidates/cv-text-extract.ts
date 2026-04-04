/**
 * Best-effort text extraction for autofill. PDF is supported; DOC/DOCX upload still works without extraction.
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
    const mod = await import("pdf-parse");
    const pdfParse = (mod as { default?: (b: Buffer) => Promise<{ text?: string }> })
      .default;
    if (typeof pdfParse !== "function") {
      return null;
    }
    const data = await pdfParse(buffer);
    const raw = data?.text;
    const text = typeof raw === "string" ? raw.trim() : "";
    return text.length > 0 ? text : null;
  } catch (err) {
    console.error("[extractTextFromCvBuffer] pdf-parse failed", err);
    return null;
  }
}
