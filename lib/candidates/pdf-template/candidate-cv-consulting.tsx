import type { CandidateCvPrintData } from "@/lib/candidates/get-candidate-cv-print-data";

import "@/lib/proposals/pdf-template/proposal-consulting-pdf.css";
import "./candidate-cv.css";

type CvSkillRow = CandidateCvPrintData["structuredSkills"][number];

function groupSkillsByCategory(
  skills: CandidateCvPrintData["structuredSkills"],
): { category: string; items: CandidateCvPrintData["structuredSkills"] }[] {
  const map = new Map<string, CandidateCvPrintData["structuredSkills"]>();
  for (const s of skills) {
    const list = map.get(s.category) ?? [];
    list.push(s);
    map.set(s.category, list);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, items]) => ({ category, items }));
}

function maxSkillYears(
  skills: CandidateCvPrintData["structuredSkills"],
): number {
  return skills.reduce((m, s) => Math.max(m, s.yearsExperience ?? 0), 0);
}

function topSkills(skills: CandidateCvPrintData["structuredSkills"], n: number): CvSkillRow[] {
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
  if (lv.includes("basic") || lv.includes("básic") || lv.includes("basico")) return 30;
  if (lv.length > 0) return 45;
  const y = s.yearsExperience;
  if (y != null && y >= 10) return 92;
  if (y != null && y >= 5) return 72;
  if (y != null && y >= 2) return 52;
  return 38;
}

function buildExecutiveParagraph(data: CandidateCvPrintData): string {
  const mx = maxSkillYears(data.structuredSkills);
  const top = topSkills(data.structuredSkills, 4).map((s) => s.name);
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
  } else if (data.placements[0]) {
    orgPhrase = `Última asignación registrada: ${data.placements[0].companyName}.`;
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

function buildHighlightBullets(data: CandidateCvPrintData): string[] {
  const mx = maxSkillYears(data.structuredSkills);
  const top = topSkills(data.structuredSkills, 5).map((s) => s.name);
  const companies = [
    ...new Set(data.placements.map((p) => p.companyName)),
  ].slice(0, 4);

  const bullets: string[] = [];

  bullets.push(
    mx > 0
      ? `Hasta ${mx}+ años de experiencia en competencias técnicas registradas.`
      : `Perfil ${data.seniorityLabel} con foco en ${data.role}.`,
  );

  if (top.length) {
    bullets.push(`Stack y dominios: ${top.join(", ")}.`);
  } else if (data.legacySkillsText.trim()) {
    const short = data.legacySkillsText.trim().slice(0, 120);
    bullets.push(
      data.legacySkillsText.length > 120
        ? `Competencias: ${short}…`
        : `Competencias: ${short}`,
    );
  }

  if (companies.length) {
    bullets.push(`Clientes / entornos recientes: ${companies.join(", ")}.`);
  }

  bullets.push(`Disponibilidad: ${data.availabilityLabel}.`);

  return bullets.slice(0, 6);
}

function applyingRoleLabel(data: CandidateCvPrintData): string {
  return data.placements[0]?.roleTitle?.trim() || data.role;
}

function heroMetaLine(data: CandidateCvPrintData, mx: number): string {
  const bits: string[] = [];
  if (data.currentCompany?.trim()) bits.push(data.currentCompany.trim());
  if (mx > 0) bits.push(`${mx}+ años de experiencia`);
  bits.push(data.availabilityLabel);
  return bits.join(" · ");
}

function highlightsAsSoftPills(highlights: string[]): string[] {
  return highlights.slice(0, 8).map((h) => {
    const t = h.trim();
    if (t.length <= 42) return t;
    return `${t.slice(0, 39)}…`;
  });
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

export function CandidateCvConsultingDocument({
  data,
}: {
  data: CandidateCvPrintData;
}) {
  const skillGroups = groupSkillsByCategory(data.structuredSkills);
  const executive = buildExecutiveParagraph(data);
  const highlights = buildHighlightBullets(data);
  const softPills = highlightsAsSoftPills(highlights);
  const today = formatTodayEsMx();
  const refCode = `ZCV-${data.id.slice(0, 8).toUpperCase()}`;
  const mx = maxSkillYears(data.structuredSkills);

  return (
    <div className="consulting-pdf-root">
      <article
        className="consulting-pdf-doc proposal-print-sheet border-0 bg-transparent p-0 shadow-none"
        aria-label="Perfil del recurso"
        data-pdf-print-root="candidate-cv"
      >
        <header className="cpdf-top">
          <div className="cpdf-logo" aria-hidden>
            <span className="cpdf-logo-mark">Z</span>
            <span className="cpdf-logo-text">ZUPERIO</span>
          </div>
          <div className="cpdf-top-meta">
            <strong>{refCode}</strong>
            <span>{today}</span>
            <span>Pág. 1 de 1</span>
            <span>Vigencia conforme uso comercial</span>
          </div>
        </header>
        <div className="cpdf-rule-blue" aria-hidden />

        <section className="cpdf-cv-hero" aria-label="Identidad del candidato">
          <div className="cpdf-cv-hero-name-wrap">
            <h1 className="cpdf-cv-hero-name">{data.fullName}</h1>
          </div>
          <p className="cpdf-cv-hero-title">{data.role}</p>
          <p className="cpdf-cv-apply-wrap">
            <span className="cpdf-cv-apply-pill">
              Aplicando a: <strong>{applyingRoleLabel(data)}</strong>
            </span>
          </p>
          <p className="cpdf-cv-hero-meta">{heroMetaLine(data, mx)}</p>
        </section>

        <div className="cpdf-cv-body">
          <aside className="cpdf-cv-sidebar">
            <div className="cpdf-cv-side-block">
              <p className="cpdf-sec-label">Disponibilidad</p>
              <div className="cpdf-cv-avail-row">
                <span
                  className={availabilityDotClass(data.availabilityStatus)}
                  aria-hidden
                />
                <span className="cpdf-cv-avail-text">{data.availabilityLabel}</span>
              </div>
              <p className="cpdf-cv-avail-sub">{data.seniorityLabel}</p>
            </div>

            {softPills.length > 0 ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Habilidades blandas detectadas</p>
                <div className="cpdf-cv-soft-pills">
                  {softPills.map((label, idx) => (
                    <span key={`${idx}-${label}`} className="cpdf-cv-soft-pill">
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {skillGroups.length > 0 ? (
              <div className="cpdf-cv-side-block">
                <p className="cpdf-sec-label">Competencias técnicas</p>
                {skillGroups.map((g) => (
                  <div key={g.category} className="cpdf-cv-skill-group">
                    <p className="cpdf-cv-skill-cat">{g.category}</p>
                    {g.items.map((s) => (
                      <div key={s.name} className="cpdf-cv-skill-row">
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
              {data.placements.length > 0 ? (
                data.placements.map((p, i) => (
                  <div key={`${p.companyName}-${i}`} className="cpdf-cv-exp-block">
                    <div className="cpdf-cv-exp-head">
                      <div>
                        <p className="cpdf-cv-exp-role">{p.roleTitle}</p>
                        <p className="cpdf-cv-exp-co">{p.companyName}</p>
                      </div>
                      <span className="cpdf-cv-exp-dates">
                        {p.startLabel} — {p.endLabel}
                      </span>
                    </div>
                    {p.highlights.length > 0 ? (
                      <ul className="cpdf-cv-exp-bullets">
                        {p.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="cpdf-cv-exp-fallback">
                        Asignación en modelo de staff augmentation; el detalle de
                        impacto se nutre de las bitácoras registradas en Zuperio.
                      </p>
                    )}
                    <div className="cpdf-cv-exp-tags">
                      <span className="cpdf-cv-exp-tag">{p.companyName}</span>
                      <span className="cpdf-cv-exp-tag">{p.roleTitle}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cpdf-intro cpdf-body--empty">
                  Aún no hay historial de asignaciones registrado. La trayectoria
                  comercial se actualizará conforme se documenten encargos en la
                  plataforma.
                </p>
              )}
            </section>

            {data.legacySkillsText.trim() && skillGroups.length > 0 ? (
              <section className="cpdf-section">
                <p className="cpdf-sec-label">Notas complementarias</p>
                <p className="cpdf-closing">{data.legacySkillsText}</p>
              </section>
            ) : null}
          </div>
        </div>

        <footer className="cpdf-doc-footer">
          <span>
            Documento generado por plataforma Zuperio · Confidencial · Datos de
            contacto resguardados por Zuperio · {refCode} · {today}
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
