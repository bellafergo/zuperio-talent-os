/**
 * Candidate CV PDF body — print: app/(print)/candidates/[id]/cv-print/page.tsx (Puppeteer).
 * Proposal tab preview must pass variant="screen" for print parity.
 */
import type { CandidateCvPrintData } from "@/lib/candidates/get-candidate-cv-print-data";

import "@/lib/proposals/pdf-template/proposal-consulting-pdf.css";
import "./candidate-cv.css";

type CvSkillRow = CandidateCvPrintData["structuredSkills"][number];

/** Si `cvSoftSkillsText` está vacío: categorías del catálogo que representan habilidades blandas. */
const SOFT_SKILL_CATEGORY_RE =
  /blanda|soft\b|interpersonal|comportamiento|liderazgo|socioemocional|power\s*skill|actitud|comunicaci/i;

function partitionStructuredSkills(skills: CvSkillRow[]): {
  technicalRows: CvSkillRow[];
  softSkillNames: string[];
} {
  const soft: string[] = [];
  const technicalRows: CvSkillRow[] = [];
  for (const s of skills) {
    if (SOFT_SKILL_CATEGORY_RE.test(s.category)) {
      const n = s.name.trim();
      if (n && !soft.includes(n)) soft.push(n);
    } else {
      technicalRows.push(s);
    }
  }
  return { technicalRows, softSkillNames: soft };
}

function groupSkillsByCategory(
  skills: CvSkillRow[],
): { category: string; items: CvSkillRow[] }[] {
  const map = new Map<string, CvSkillRow[]>();
  for (const s of skills) {
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

function maxSkillYears(skills: CvSkillRow[]): number {
  return skills.reduce((m, s) => Math.max(m, s.yearsExperience ?? 0), 0);
}

function topSkills(skills: CvSkillRow[], n: number): CvSkillRow[] {
  return [...skills]
    .sort(
      (a, b) =>
        (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, n);
}

function skillBarPercent(s: CvSkillRow): number {
  const lv = (s.level || "").toLowerCase();
  if (lv.includes("expert") || lv.includes("principal")) return 100;
  if (lv.includes("advanced") || lv.includes("avanz")) return 80;
  if (lv.includes("intermediate") || lv.includes("intermed")) return 55;
  if (lv.includes("basic") || lv.includes("básic") || lv.includes("basico"))
    return 30;
  if (lv.length > 0) return 45;
  const y = s.yearsExperience;
  if (y != null && y >= 10) return 92;
  if (y != null && y >= 5) return 72;
  if (y != null && y >= 2) return 52;
  return 38;
}

function buildExecutiveParagraph(
  data: CandidateCvPrintData,
  technicalRows: CvSkillRow[],
): string {
  const mx = maxSkillYears(technicalRows);
  const top = topSkills(technicalRows, 4).map((s) => s.name);
  const topPhrase =
    top.length > 0
      ? `Sus dominios más sólidos incluyen ${top.join(", ")}.`
      : data.legacySkillsText
        ? "El resumen de competencias complementa el detalle estructurado en este perfil."
        : "";

  const yearsPhrase =
    mx > 0
      ? `Concentración de hasta ${mx}+ años de experiencia declarada en competencias técnicas clave del perfil.`
      : `Trayectoria alineada a nivel ${data.seniorityLabel} y al stack descrito en este documento.`;

  let orgPhrase = "";
  if (data.currentCompany?.trim()) {
    orgPhrase = `Actualmente asociado a ${data.currentCompany.trim()}.`;
  }

  return [
    `${data.fullName} es ${data.role} con nivel ${data.seniorityLabel}.`,
    yearsPhrase,
    topPhrase,
    orgPhrase,
    `Disponibilidad comercial: ${data.availabilityLabel.toLowerCase()} para entornos de staff augmentation y proyectos con alto estándar de entrega.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function applyingRoleLabel(data: CandidateCvPrintData): string {
  return data.role.trim() || "—";
}

/** Segmentos con viñeta para la línea bajo el hero (ciudad, experiencia, modalidad, disponibilidad). */
function heroMetaSegments(data: CandidateCvPrintData, mx: number): string[] {
  const segs: string[] = [];
  if (data.locationCity?.trim()) segs.push(data.locationCity.trim());
  else if (data.currentCompany?.trim()) segs.push(data.currentCompany.trim());
  if (mx > 0) segs.push(`${mx}+ años de experiencia`);
  if (data.workModality?.trim()) segs.push(data.workModality.trim());
  segs.push(data.availabilityLabel);
  return segs;
}

const LANG_LEVEL_DOTS: Record<string, number> = {
  Nativo: 5,
  Native: 5,
  C2: 5,
  C1: 4,
  B2: 3,
  B1: 3,
  "B1 — Intermedio": 3,
  Intermedio: 3,
  A2: 2,
  A1: 1,
  Básico: 1,
  Basico: 1,
};

function languageDotCount(levelRaw: string): number {
  const level = levelRaw.trim();
  if (!level) return 3;
  if (LANG_LEVEL_DOTS[level] != null) return LANG_LEVEL_DOTS[level];
  const low = level.toLowerCase();
  if (/nativ|native/.test(low)) return 5;
  if (/\bc2\b/.test(low)) return 5;
  if (/\bc1\b/.test(low)) return 4;
  if (/\bb2\b/.test(low)) return 3;
  if (/\bb1\b/.test(low) || /intermed/.test(low)) return 3;
  if (/\ba2\b/.test(low)) return 2;
  if (/\ba1\b/.test(low) || /básic|basico/.test(low)) return 1;
  return 3;
}

function formatTodayEsMx(): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function availabilityDotClass(
  status: CandidateCvPrintData["availabilityStatus"],
): string {
  const base = "cpdf-cv-avail-dot";
  if (status === "AVAILABLE") return `${base} cpdf-cv-avail-dot--now`;
  if (status === "IN_PROCESS") return `${base} cpdf-cv-avail-dot--mid`;
  return `${base} cpdf-cv-avail-dot--off`;
}

export type CandidateCvConsultingDocumentProps = {
  data: CandidateCvPrintData;
  variant?: "pdf" | "screen";
};

export function CandidateCvConsultingDocument({
  data,
  variant = "pdf",
}: CandidateCvConsultingDocumentProps) {
  const { technicalRows, softSkillNames: softFromCategories } =
    partitionStructuredSkills(data.structuredSkills);
  const dedicatedSoft = data.softSkillsFromCvText
    .map((s) => s.trim())
    .filter(Boolean);
  const softSkillNames =
    dedicatedSoft.length > 0 ? dedicatedSoft : softFromCategories;
  const skillGroups = groupSkillsByCategory(technicalRows);
  const executive = buildExecutiveParagraph(data, technicalRows);
  const today = formatTodayEsMx();
  const refCode = `ZCV-${data.id.slice(0, 8).toUpperCase()}`;
  const mx = maxSkillYears(technicalRows);
  const metaSegments = heroMetaSegments(data, mx);

  const languagesList = data.languages.filter(
    (l) => l.name.trim() || l.level.trim(),
  );
  const showLanguages = languagesList.length > 0;
  const certificationsList = data.certifications
    .map((c) => c.trim())
    .filter(Boolean);
  const showCerts = certificationsList.length > 0;
  const industriesList = data.industries.map((s) => s.trim()).filter(Boolean);
  const showIndustries = industriesList.length > 0;
  const educationBlocks = data.educationBlocks
    .map((b) => b.trim())
    .filter(Boolean);
  const showEducation = educationBlocks.length > 0;
  const showSoftSkills = softSkillNames.length > 0;
  const workExperienceParagraphs = data.workExperienceParagraphs
    .map((p) => p.trim())
    .filter(Boolean);
  const showWorkExperience = workExperienceParagraphs.length > 0;
  const softSkillsSubtitle =
    dedicatedSoft.length > 0
      ? null
      : softFromCategories.length > 0
        ? "Referencia desde competencias estructuradas"
        : null;

  const rootClass = [
    "consulting-pdf-root",
    "consulting-pdf-root--cv-consulting",
    variant === "screen" ? "consulting-pdf-root--screen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass}>
      <article
        className="consulting-pdf-doc proposal-print-sheet border-0 bg-transparent p-0 shadow-none"
        aria-label="Perfil del recurso"
        data-pdf-print-root="candidate-cv"
      >
        <div className="cpdf-cv-hero-band">
          <div className="cpdf-cv-hero-logo" aria-hidden>
            <span className="cpdf-logo-mark cpdf-logo-mark--on-dark">Z</span>
            <span className="cpdf-logo-text cpdf-logo-text--on-dark">
              ZUPERIO
            </span>
          </div>
          <h1 className="cpdf-cv-hero-name cpdf-cv-hero-name--on-dark">
            {data.fullName}
          </h1>
          <p className="cpdf-cv-hero-specialty">{data.role}</p>
        </div>

        <div className="cpdf-cv-hero-after">
          <div className="cpdf-cv-apply-row">
            <span className="cpdf-cv-apply-pill cpdf-cv-apply-pill--square">
              Aplicando a: <strong>{applyingRoleLabel(data)}</strong>
            </span>
          </div>
          <p className="cpdf-cv-hero-meta-dots">
            {metaSegments.map((seg, i) => (
              <span key={i} className="cpdf-cv-hero-meta-item">
                <span className="cpdf-cv-hero-meta-bullet" aria-hidden>
                  ●
                </span>
                {seg}
              </span>
            ))}
          </p>
          <hr className="cpdf-cv-hero-rule" />
        </div>

        <div className="cpdf-cv-body">
          <aside className="cpdf-cv-sidebar">
            <div className="cpdf-cv-side-block">
              <p className="cpdf-sec-label">Disponibilidad</p>
              <div className="cpdf-cv-avail-row">
                <span
                  className={availabilityDotClass(data.availabilityStatus)}
                  aria-hidden
                />
                <span className="cpdf-cv-avail-text">
                  {data.availabilityLabel}
                </span>
              </div>
              <p className="cpdf-cv-avail-sub">{data.seniorityLabel}</p>
            </div>

            {showLanguages ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Idiomas</p>
                <div className="cpdf-cv-lang-list">
                  {languagesList.map((lang, idx) => (
                    <div
                      key={`lang-${idx}`}
                      className="cpdf-cv-lang-block"
                    >
                      <div className="cpdf-cv-lang-row cpdf-cv-lang-row--top">
                        <span className="cpdf-cv-lang-name">{lang.name}</span>
                        {lang.level ? (
                          <span className="cpdf-cv-lang-level">
                            {lang.level}
                          </span>
                        ) : null}
                      </div>
                      <div className="cpdf-cv-lang-dots" aria-hidden>
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={
                              i < languageDotCount(lang.level || "Intermedio")
                                ? "cpdf-cv-lang-dot cpdf-cv-lang-dot--on"
                                : "cpdf-cv-lang-dot"
                            }
                          >
                            ●
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {skillGroups.length > 0 ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Skills técnicos</p>
                {skillGroups.map((g, gi) => (
                  <div key={`cat-${gi}-${g.category}`} className="cpdf-cv-skill-group">
                    <p className="cpdf-cv-skill-cat">{g.category}</p>
                    {g.items.map((s, si) => (
                      <div
                        key={`sk-${gi}-${si}-${s.name}`}
                        className="cpdf-cv-skill-row"
                      >
                        <div className="cpdf-cv-skill-name">
                          <span>{s.name}</span>
                          <span className="cpdf-cv-skill-meta">
                            {s.level
                              ? s.yearsExperience != null
                                ? `${s.level} · ${s.yearsExperience}a`
                                : s.level
                              : s.yearsExperience != null
                                ? `${s.yearsExperience}a`
                                : ""}
                          </span>
                        </div>
                        <div className="cpdf-cv-skill-track">
                          <div
                            className="cpdf-cv-skill-fill"
                            style={{ width: `${skillBarPercent(s)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {data.legacySkillsText.trim() && skillGroups.length === 0 ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Skills técnicos</p>
                <p className="cpdf-cv-legacy-compact">{data.legacySkillsText}</p>
              </div>
            ) : null}

            {showSoftSkills ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Habilidades blandas</p>
                {softSkillsSubtitle ? (
                  <p className="cpdf-cv-soft-hint">{softSkillsSubtitle}</p>
                ) : null}
                <div className="cpdf-cv-soft-pills cpdf-cv-soft-pills--outlined">
                  {softSkillNames.map((skill, si) => (
                    <span key={`soft-${si}-${skill}`} className="cpdf-cv-soft-pill-detailed">
                      <span className="cpdf-cv-soft-pill-dot" aria-hidden>
                        ●
                      </span>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {showCerts ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Certificaciones</p>
                <ul className="cpdf-cv-cert-list">
                  {certificationsList.map((c, cIdx) => (
                    <li
                      key={`cert-${cIdx}`}
                      className="cpdf-cv-cert-line"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {showIndustries ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Industrias (CV)</p>
                <div className="cpdf-cv-industry-pills">
                  {industriesList.slice(0, 12).map((ind, iIdx) => (
                    <span
                      key={`ind-${iIdx}`}
                      className="cpdf-cv-industry-pill cpdf-cv-industry-pill--solid"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>

          <div className="cpdf-cv-main">
            <section className="cpdf-section">
              <p className="cpdf-sec-label">Perfil ejecutivo</p>
              <p className="cpdf-intro">{executive}</p>
            </section>

            {data.notes?.trim() ? (
              <section className="cpdf-section">
                <p className="cpdf-sec-label">Por qué este perfil</p>
                <p className="cpdf-cv-why">{data.notes.trim()}</p>
              </section>
            ) : null}

            <section className="cpdf-section">
              <p className="cpdf-sec-label">Experiencia laboral</p>
              {showWorkExperience ? (
                <div className="cpdf-cv-work-from-cv">
                  {workExperienceParagraphs.map((block, i) => (
                    <p
                      key={`wxp-${i}`}
                      className="cpdf-cv-work-from-cv-para"
                    >
                      {block}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="cpdf-intro cpdf-body--empty">
                  No hay experiencia laboral capturada aún en el perfil.
                </p>
              )}
            </section>

            {showEducation ? (
              <section className="cpdf-section">
                <p className="cpdf-sec-label">Educación</p>
                {educationBlocks.map((block, i) => (
                  <p key={i} className="cpdf-cv-edu-block">
                    {block}
                  </p>
                ))}
              </section>
            ) : null}
          </div>
        </div>

        <footer className="cpdf-doc-footer">
          <span>
            Perfil comercial Zuperio · Confidencial · {refCode} · {today}
          </span>
          <span className="cpdf-footer-brand">
            ZUPERIO ·{" "}
            <a href="https://zuperio.com.mx" target="_blank" rel="noreferrer">
              zuperio.com.mx
            </a>
          </span>
        </footer>
      </article>
    </div>
  );
}
