#!/usr/bin/env python3
"""
Reads catalog lines from stdin (format: Name — Category, em dash U+2014).
Writes prisma/catalog-expansion.json: [{ "name": "...", "userCategory": "..." }, ...]
Dedupes by normalized name (first wins). Normalization must match
lib/skills/normalize-skill-name.ts (normalizeSkillNameForCatalog).

Run: python3 prisma/scripts/build-catalog-expansion-json.py < prisma/catalog-expansion-raw.txt
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "catalog-expansion.json"

SEP = "\u2014"  # em dash


def normalize_skill_name_for_catalog(s: str) -> str:
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = s.lower().strip()
    s = re.sub(r"node\.js", "nodejs", s, flags=re.IGNORECASE)
    s = re.sub(r"c\s*#", "csharp", s, flags=re.IGNORECASE)
    # Mirror JS [^\p{L}\p{N}]+ → space (no \w: underscore differs)
    buf: list[str] = []
    for ch in s:
        cat = unicodedata.category(ch)
        if cat[0] in ("L", "N"):
            buf.append(ch)
        else:
            buf.append(" ")
    s = "".join(buf)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def main() -> None:
    raw = sys.stdin.read()
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if SEP not in line:
            continue
        name, cat = line.split(SEP, 1)
        name = name.strip()
        cat = cat.strip()
        if not name:
            continue
        nk = normalize_skill_name_for_catalog(name)
        if nk in seen:
            continue
        seen.add(nk)
        rows.append({"name": name, "userCategory": cat})
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(rows)} unique rows to {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
