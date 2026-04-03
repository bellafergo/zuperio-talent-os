import type { ProposalDetailUi } from "@/lib/proposals/types";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import {
  formatProposalCurrencyAmount,
  formatProposalPercent,
} from "@/lib/proposals/presentation";

import {
  DetailedPricingTable,
  SimplePricingTable,
} from "@/lib/proposals/pdf-template/proposal-pricing-blocks";
import {
  pdfMatchPercentDisplay,
  pdfMatchToneClass,
} from "@/lib/proposals/pdf-template/proposal-pdf-match-display";

import "@/app/(app)/proposals/_components/proposal-document.css";
import "./proposal-consulting-pdf.css";

/** Short items (2–3 líneas c/u) for two-column términos per design spec */
const STANDARD_CONDITIONS_ES = [
  "Propuesta orientativa y sujeta al contrato definitivo que suscriban las partes.",
  "Los montos reflejan los supuestos e información registrados en Zuperio a la fecha de emisión.",
  "Condiciones de prestación, plazos de aviso y entregables se confirman en el contrato marco o anexo / statement of work.",
  "La vigencia indicada en el documento aplica salvo revocación previa por escrito.",
  "Los anexos técnicos o de alcance, cuando existan, complementan esta propuesta comercial.",
  "Modificaciones económicas requieren acuerdo expreso por escrito entre cliente y Zuperio.",
];

export type ProposalConsultingPdfDocumentProps = {
  proposal: ProposalDetailUi;
  preparedByDisplay: string;
  comparisonMatrix?: ComparisonMatrixBundle | null;
  /** `screen` — in-app preview (slightly relaxed sizing). */
  variant?: "pdf" | "screen";
};

function formatTodayEsMx(): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function proposalRefCode(id: string): string {
  return `ZUP-${id.slice(0, 8).toUpperCase()}`;
}

function initialsFromDisplayName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function splitTermsForColumns(
  lines: string[],
): { left: string[]; right: string[] } {
  const mid = Math.ceil(lines.length / 2);
  return { left: lines.slice(0, mid), right: lines.slice(mid) };
}

export function ProposalConsultingPdfDocument({
  proposal,
  preparedByDisplay,
  comparisonMatrix = null,
  variant = "pdf",
}: ProposalConsultingPdfDocumentProps) {
  const currency = proposal.currency?.trim() || "MXN";
  const isDetailed = proposal.formatValue === "DETAILED";
  const p = proposal.pricing;
  const today = formatTodayEsMx();
  const refCode = proposalRefCode(proposal.id);

  const proposalName =
    proposal.opportunityTitle !== "—"
      ? proposal.opportunityTitle
      : "Propuesta comercial";

  const roleLine =
    proposal.vacancyTitle !== "—"
      ? proposal.vacancyTitle
      : proposal.opportunityTitle;

  const execSummary = proposal.executiveSummary?.trim();
  const profileSummary = proposal.profileSummary?.trim();
  const scopeNotes = proposal.scopeNotes?.trim();

  const rateExcl =
    p?.finalMonthlyRate != null
      ? formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0)
      : "—";

  const { left: termsLeft, right: termsRight } =
    splitTermsForColumns(STANDARD_CONDITIONS_ES);

  const rootClass =
    variant === "screen"
      ? "consulting-pdf-root consulting-pdf-root--screen"
      : "consulting-pdf-root";

  return (
    <div className={rootClass}>
      <article
        className="consulting-pdf-doc proposal-print-sheet border-0 bg-transparent p-0 shadow-none"
        aria-label="Propuesta comercial (PDF)"
        data-pdf-print-root="proposal"
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
            <span>Vigencia {proposal.validityDays} días</span>
          </div>
        </header>
        <div className="cpdf-rule-blue" aria-hidden />

        <div className="cpdf-title-block cpdf-title-block--economic">
          <div className="cpdf-title-accent" aria-hidden />
          <div className="cpdf-title-inner">
            <h1 className="cpdf-doc-title">Propuesta Económica</h1>
            <p className="cpdf-doc-subtitle">Servicio Especializado</p>
          </div>
        </div>

        <div className="cpdf-party-grid">
          <div className="cpdf-party">
            <p className="cpdf-party-label">Dirigido a</p>
            <p className="cpdf-party-name">{proposal.companyName}</p>
            <p className="cpdf-party-lines">
              {proposal.opportunityTitle !== "—"
                ? `Oportunidad: ${proposal.opportunityTitle}`
                : "Cliente registrado en Zuperio"}
              {proposal.vacancyTitle !== "—" ? (
                <>
                  <br />
                  Vacante: {proposal.vacancyTitle}
                </>
              ) : null}
            </p>
          </div>
          <div className="cpdf-party">
            <p className="cpdf-party-label">Elabora</p>
            <p className="cpdf-party-name">{preparedByDisplay}</p>
            <p className="cpdf-party-lines">
              Zuperio · Gestión comercial
              <br />
              <a className="cpdf-party-email" href="mailto:contacto@zuperio.com.mx">
                contacto@zuperio.com.mx
              </a>
            </p>
          </div>
        </div>

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Introducción</p>
          {execSummary ? (
            <p className="cpdf-intro">{execSummary}</p>
          ) : (
            <p className="cpdf-intro">
              Con el gusto de saludarle, presentamos esta{" "}
              <span className="cpdf-em">propuesta comercial</span> para{" "}
              <span className="cpdf-em">{proposal.candidateName}</span> alineada
              al perfil{" "}
              <span className="cpdf-em">{roleLine}</span> para{" "}
              <span className="cpdf-em">{proposal.companyName}</span>.
              {comparisonMatrix ? (
                <>
                  {" "}
                  El <span className="cpdf-em">match estructurado</span>{" "}
                  registrado para este par candidato–vacante es del{" "}
                  <span className="cpdf-em">
                    {comparisonMatrix.computedMatch.score}%
                  </span>
                  , con base en los mismos criterios deterministas que el tablero
                  de matching en Zuperio.
                </>
              ) : null}
            </p>
          )}
        </section>

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Recurso propuesto</p>
          <div className="cpdf-resource-card">
            <div className="cpdf-avatar">
              {initialsFromDisplayName(proposal.candidateName)}
            </div>
            <div className="cpdf-resource-body">
              <div className="cpdf-resource-head">
                <div>
                  <p className="cpdf-resource-name">{proposal.candidateName}</p>
                  <p className="cpdf-resource-role">
                    {profileSummary
                      ? profileSummary.split(/\n/)[0].trim().slice(0, 140)
                      : proposal.opportunityTitle !== "—"
                        ? proposal.opportunityTitle
                        : roleLine}
                  </p>
                </div>
                {proposal.vacancyTitle !== "—" ? (
                  <span className="cpdf-pill">{proposal.vacancyTitle}</span>
                ) : null}
              </div>
              {profileSummary &&
              profileSummary.split(/\n/).filter((l) => l.trim()).length > 1 ? (
                <p className="cpdf-resource-note">
                  {profileSummary
                    .split(/\n/)
                    .map((l) => l.trim())
                    .filter(Boolean)
                    .slice(1)
                    .join("\n\n")}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {comparisonMatrix ? (
          <section className="cpdf-section">
            <p className="cpdf-sec-label">Alineación requerimiento · candidato</p>
            <div className="cpdf-match-wrap">
              <table className="cpdf-match-table">
                <thead>
                  <tr>
                    <th>Requerimiento</th>
                    <th>Candidato</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonMatrix.rows.map((row) => {
                    const { text, tone } = pdfMatchPercentDisplay(row);
                    return (
                      <tr key={row.id}>
                        <td className="cpdf-match-req">{row.requirement}</td>
                        <td className="cpdf-match-cand">{row.candidateValue}</td>
                        <td className={pdfMatchToneClass(tone)}>{text}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="cpdf-match-summary">
              <strong>Match global {comparisonMatrix.computedMatch.score}%</strong>
              {" — "}
              {comparisonMatrix.computedMatch.explanation}
            </p>
          </section>
        ) : null}

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Tarifa del servicio</p>
          <div className="cpdf-rate-wrap">
            <table className="cpdf-rate-table">
              <thead>
                <tr>
                  <th>Perfil</th>
                  <th>Candidato</th>
                  <th>Tarifa mensual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cpdf-rate-perfil">{roleLine}</td>
                  <td>
                    <span className="cpdf-rate-cand-name">
                      {proposal.candidateName}
                    </span>
                    <span className="cpdf-rate-cand-sub">
                      {p
                        ? `${p.monthlyHours} h/mes · ${proposal.format}`
                        : proposal.format}
                    </span>
                  </td>
                  <td className="cpdf-rate-amount">
                    {p ? (
                      <>
                        <div className="cpdf-rate-big">{rateExcl}</div>
                        <div className="cpdf-rate-sub">
                          {currency} / mes · IVA no incluido
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="cpdf-rate-big">—</div>
                        <div className="cpdf-rate-sub">
                          Complete el bloque económico en Zuperio
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Condiciones comerciales</p>
          {p ? (
            <table className="cpdf-kv-table">
              <tbody>
                <tr>
                  <td className="cpdf-kv-key">Moneda</td>
                  <td className="cpdf-kv-val">{currency}</td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">Periodicidad</td>
                  <td className="cpdf-kv-val">Mensual</td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">Horas mensuales</td>
                  <td className="cpdf-kv-val">{String(p.monthlyHours)}</td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">Vigencia de la propuesta</td>
                  <td className="cpdf-kv-val">
                    {proposal.validityDays} días desde emisión
                  </td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">Esquema de precios</td>
                  <td className="cpdf-kv-val">{p.scheme}</td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">Formato de documento</td>
                  <td className="cpdf-kv-val">{proposal.format}</td>
                </tr>
                <tr>
                  <td className="cpdf-kv-key">IVA</td>
                  <td className="cpdf-kv-val">
                    {p.vatPercent != null
                      ? formatProposalPercent(p.vatPercent)
                      : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p className="cpdf-body--empty">
              Sin datos económicos — complete la propuesta en Zuperio.
            </p>
          )}
        </section>

        {p ? (
          <section className="cpdf-section">
            <p className="cpdf-sec-label">
              {isDetailed
                ? "Desglose económico detallado"
                : "Resumen de precios (referencia)"}
            </p>
            {isDetailed ? (
              <DetailedPricingTable currency={currency} proposal={proposal} />
            ) : (
              <SimplePricingTable
                currency={currency}
                proposal={proposal}
                variant="consulting"
              />
            )}
          </section>
        ) : null}

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Alcance y próximos pasos</p>
          {scopeNotes ? (
            <p className="cpdf-closing">{scopeNotes}</p>
          ) : (
            <p className="cpdf-closing">
              Quedamos atentos para coordinar una sesión de revisión, resolver
              dudas y, de su interés, avanzar hacia el marco contractual y el
              arranque del recurso.
            </p>
          )}
        </section>

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Términos y condiciones</p>
          <ul className="cpdf-terms-grid">
            {termsLeft.map((line) => (
              <li key={line}>{line}</li>
            ))}
            {termsRight.map((line) => (
              <li key={`r-${line}`}>{line}</li>
            ))}
          </ul>
          {proposal.commercialNotes?.trim() ? (
            <div className="cpdf-remark">
              <p className="cpdf-remark-label">Observaciones comerciales</p>
              <p className="cpdf-remark-body">
                {proposal.commercialNotes.trim()}
              </p>
            </div>
          ) : null}
        </section>

        <section className="cpdf-accept">
          <p className="cpdf-accept-label">Aceptación</p>
          <p className="cpdf-accept-intro">
            Al firmar, el cliente confirma la aceptación de esta propuesta, sin
            perjuicio del contrato definitivo.
          </p>
          <div className="cpdf-sign-grid">
            <div className="cpdf-sign-card">
              <div className="cpdf-sign-bar">{proposal.companyName}</div>
              <div className="cpdf-sign-body">
                <div className="cpdf-sign-inkline" />
                <p className="cpdf-sign-name-slot">Nombre y firma</p>
                <p className="cpdf-sign-role-slot">Cargo</p>
              </div>
            </div>
            <div className="cpdf-sign-card">
              <div className="cpdf-sign-bar">Zuperio</div>
              <div className="cpdf-sign-body">
                <div className="cpdf-sign-inkline" />
                <p className="cpdf-sign-name-slot">Nombre y firma</p>
                <p className="cpdf-sign-role-slot">Cargo</p>
                <p className="cpdf-sign-fecha">
                  Fecha de aceptación: ___________
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="cpdf-doc-footer">
          <span>
            Propuesta {refCode} · Confidencial · {today}
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
