/** Escape a single CSV field (RFC-style, Excel-friendly). */
export function csvEscapeField(value: string): string {
  const v = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function csvRow(cells: string[]): string {
  return `${cells.map(csvEscapeField).join(",")}\r\n`;
}

/** UTF-8 BOM so Excel recognizes UTF-8. */
export const CSV_UTF8_BOM = "\uFEFF";
