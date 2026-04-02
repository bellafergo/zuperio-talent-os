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
  if (lv.includes("advanced") || lv.includes("avanz")) return 82;
  if (lv.includes("intermediate") || lv.includes("intermed")) return 58;
  if (lv.length > 0) return 45;
  const y = s.yearsExperience;
  if (y != null && y >= 10) return 92;
  if (y != null && y >= 5) return 72;
  if (y != null && y >= 2) return 52;
  return 38;
}

function placementStatusEs(en: string): string {
  const m: Record<string, string> = {
    Active: "Activo",
    Completed: "Completado",
    Cancelled: "Cancelado",
  };
  return m[en] ?? en;
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

function contextLine(data: CandidateCvPrintData): string | null {
  const p0 = data.placements[0];
  if (p0) {
    return `Contexto reciente: ${p0.roleTitle} · ${p0.companyName}`;
  }
  if (data.currentCompany?.trim()) {
    return `Organización actual: ${data.currentCompany.trim()}`;
  }
  return null;
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
  const context = contextLine(data);
  const today = formatTodayEsMx();
  const refCode = `ZCV-${data.id.slice(0, 8).toUpperCase()}`;
  const tagSkills = topSkills(data.structuredSkills, 10);
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
            <span>Perfil del recurso</span>
            <span>Pág. 1 de 1</span>
          </div>
        </header>
        <div className="cpdf-rule-blue" aria-hidden />

        <div className="cpdf-title-block">
          <div className="cpdf-title-accent" aria-hidden />
          <div className="cpdf-title-inner">
            <h1 className="cpdf-doc-title">{data.fullName}</h1>
            <p className="cpdf-doc-subtitle">{data.role}</p>
            <p className="cpdf-doc-kicker">
              Perfil del recurso · Staff augmentation · {data.seniorityLabel}
            </p>
          </div>
        </div>

        <div className="cpdf-party-grid">
          <div className="cpdf-party">
            <p className="cpdf-party-label">Identidad</p>
            <p className="cpdf-party-name">{data.fullName}</p>
            <p className="cpdf-party-lines">
              Especialización: {data.role}
              {context ? (
                <>
                  <br />
                  {context}
                </>
              ) : null}
            </p>
          </div>
          <div className="cpdf-party">
            <p className="cpdf-party-label">Estado comercial</p>
            <p className="cpdf-party-name">{data.availabilityLabel}</p>
            <p className="cpdf-party-lines">
              Nivel: {data.seniorityLabel}
              {mx > 0 ? (
                <>
                  <br />
                  Hasta {mx}+ años en competencias clave registradas.
                </>
              ) : null}
              {data.currentCompany?.trim() ? (
                <>
                  <br />
                  {data.currentCompany.trim()}
                </>
              ) : null}
            </p>
          </div>
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
                <span className="cpdf-cv-avail-text">{data.availabilityLabel}</span>
              </div>
            </div>

            <div className="cpdf-cv-side-block">
              <p className="cpdf-sec-label">Highlights</p>
              <ul className="cpdf-cv-highlight-list">
                {highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

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
                            {s.yearsExperience != null
                              ? `${s.yearsExperience}a`
                              : ""}
                            {s.level ? ` · ${s.level}` : ""}
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
                <p className="cpdf-sec-label">Resumen de competencias</p>
                <p className="cpdf-cv-legacy-compact">{data.legacySkillsText}</p>
              </div>
            ) : null}
          </aside>

          <div className="cpdf-cv-main">
            <section className="cpdf-section">
              <p className="cpdf-sec-label">Perfil ejecutivo</p>
              <p className="cpdf-intro">{executive}</p>
              {tagSkills.length > 0 ? (
                <div className="cpdf-cv-tag-row" aria-label="Skills destacados">
                  {tagSkills.map((s) => (
                    <span key={s.name} className="cpdf-cv-tag">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            {data.notes?.trim() ? (
              <section className="cpdf-section">
                <p className="cpdf-sec-label">Por qué este perfil</p>
                <div className="cpdf-remark">
                  <p className="cpdf-remark-label">Valoración comercial</p>
                  <p className="cpdf-remark-body">{data.notes.trim()}</p>
                </div>
              </section>
            ) : null}

            <section className="cpdf-section">
              <p className="cpdf-sec-label">Experiencia relevante</p>
              {data.placements.length > 0 ? (
                data.placements.map((p, i) => (
                  <div key={`${p.companyName}-${i}`} className="cpdf-cv-exp-block">
                    <div className="cpdf-cv-exp-head">
                      <div>
                        <p className="cpdf-cv-exp-role">{p.roleTitle}</p>
                        <p className="cpdf-cv-exp-co">{p.companyName}</p>
                        <p className="cpdf-cv-exp-status">
                          Estado: {placementStatusEs(p.statusLabel)}
                        </p>
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
            Documento generado en Zuperio · Confidencial · Los datos de contacto
            del candidato se comparten bajo acuerdo comercial · {refCode} ·{" "}
            {today}
          </span>
          <span>
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
