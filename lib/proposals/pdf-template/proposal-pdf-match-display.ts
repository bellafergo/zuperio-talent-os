import type { ComparisonMatrixRow } from "@/lib/matching/comparison-matrix";

export type PdfMatchTone = "full" | "partial" | "gap" | "open";

/** Compact match column for PDF: prefer points ratio, else level label. */
export function pdfMatchPercentDisplay(row: ComparisonMatrixRow): {
  text: string;
  tone: PdfMatchTone;
} {
  const pl = row.pointsLabel?.trim();
  if (pl) {
    const m = pl.match(/^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/);
    if (m) {
      const a = Number(m[1]);
      const b = Number(m[2]);
      if (Number.isFinite(a) && Number.isFinite(b) && b > 0) {
        const pct = Math.round((a / b) * 100);
        const tone: PdfMatchTone =
          pct >= 95 ? "full" : pct >= 45 ? "partial" : "gap";
        return { text: `${pct}%`, tone };
      }
    }
  }
  switch (row.matchLevel) {
    case "MET":
      return { text: "100%", tone: "full" };
    case "PARTIAL":
      return { text: "Parcial", tone: "partial" };
    case "GAP":
      return { text: "Brecha", tone: "gap" };
    default:
      return { text: "—", tone: "open" };
  }
}

export function pdfMatchToneClass(tone: PdfMatchTone): string {
  switch (tone) {
    case "full":
      return "cpdf-match-pct cpdf-match-pct--full";
    case "partial":
      return "cpdf-match-pct cpdf-match-pct--partial";
    case "gap":
      return "cpdf-match-pct cpdf-match-pct--gap";
    default:
      return "cpdf-match-pct cpdf-match-pct--open";
  }
}
