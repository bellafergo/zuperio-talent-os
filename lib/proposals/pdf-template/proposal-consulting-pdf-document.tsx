/**
 * Economic proposal PDF body — print route: app/(print)/proposals/[id]/document-print/page.tsx
 * (Puppeteer loads that URL). In-app preview: ProposalConsultingPdfDocument variant="screen".
 */
import type { ProposalDetailUi } from "@/lib/proposals/types";
import type { ComparisonMatrixBundle } from "@/lib/matching/queries";
import {
  formatProposalCurrencyAmount,
  formatProposalPercent,
} from "@/lib/proposals/presentation";

import "./proposal-consulting-pdf.css";

/** Términos compactos (PDF ejecutivo 1 página) */
const STANDARD_CONDITIONS_ES = [
  "Propuesta orientativa y sujeta al contrato definitivo entre las partes.",
  "Montos según supuestos registrados en Zuperio a la fecha de emisión.",
  "Condiciones de servicio y entregables se formalizan en contrato marco o anexo.",
  "Vigencia según este documento; modificaciones económicas por acuerdo escrito.",
];

export type ProposalPdfContact = {
  name: string;
  title: string | null;
};

export type ProposalPdfOwner = {
  name: string;
  /** Prisma UserRole value: SALES | RECRUITER | DIRECTOR */
  role: string;
  email: string;
};

const USER_ROLE_LABEL: Record<string, string> = {
  SALES: "Key Account Manager",
  RECRUITER: "Recruiter",
  DIRECTOR: "Director",
};

export type ProposalConsultingPdfDocumentProps = {
  proposal: ProposalDetailUi;
  preparedByDisplay: string;
  comparisonMatrix?: ComparisonMatrixBundle | null;
  /** Primary active contact for the client company. */
  primaryContact?: ProposalPdfContact | null;
  /** Opportunity or company owner (KAM). Null → falls back to preparedByDisplay. */
  accountOwner?: ProposalPdfOwner | null;
  /** `screen` — vista previa en la app (misma escala base que PDF vía CSS). */
  variant?: "pdf" | "screen";
};

function formatTodayEsMx(): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function safeTrim(s: string | null | undefined): string {
  return typeof s === "string" ? s.trim() : "";
}

function proposalRefCode(id: string | null | undefined): string {
  const raw = safeTrim(id);
  if (!raw) return "ZUP-00000000";
  return `ZUP-${raw.slice(0, 8).toUpperCase()}`;
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

function isPlaceholderDash(s: string): boolean {
  return !s.trim() || s.trim() === "—";
}

/** Vacancy / opportunity / neutral fallback — never bare "—" in PDF copy */
function proposalPerfilLabel(p: ProposalDetailUi): string {
  if (!isPlaceholderDash(p.vacancyTitle)) return p.vacancyTitle.trim();
  if (!isPlaceholderDash(p.opportunityTitle)) return p.opportunityTitle.trim();
  return "Perfil comercial (definir con el cliente)";
}

function proposalCandidateDisplay(p: ProposalDetailUi): string {
  const n = p.candidateName.trim();
  if (!n || isPlaceholderDash(n)) return "Candidato por asignar";
  return n;
}

function proposalCompanyDisplay(p: ProposalDetailUi): string {
  const n = p.companyName.trim();
  return n || "Cliente";
}

export function ProposalConsultingPdfDocument({
  proposal,
  preparedByDisplay,
  comparisonMatrix = null,
  primaryContact = null,
  accountOwner = null,
  variant = "pdf",
}: ProposalConsultingPdfDocumentProps) {
  const currency = proposal.currency?.trim() || "MXN";
  const p = proposal.pricing;
  const today = formatTodayEsMx();
  const refCode = proposalRefCode(proposal.id);

  const roleLine = proposalPerfilLabel(proposal);
  const candidateDisplay = proposalCandidateDisplay(proposal);
  const companyDisplay = proposalCompanyDisplay(proposal);

  const execSummary = proposal.executiveSummary?.trim();
  const profileSummary = proposal.profileSummary?.trim();
  const scopeNotes = proposal.scopeNotes?.trim();

  const rateExcl =
    p?.finalMonthlyRate != null
      ? formatProposalCurrencyAmount(p.finalMonthlyRate, currency, 0)
      : "—";

  const { left: termsLeft, right: termsRight } =
    splitTermsForColumns(STANDARD_CONDITIONS_ES);

  const isSimpleFormat = proposal.formatValue === "SIMPLE";

  const rootClass = [
    "consulting-pdf-root",
    "consulting-pdf-root--proposal-executive",
    variant === "screen" ? "consulting-pdf-root--screen" : "",
  ]
    .filter(Boolean)
    .join(" ");

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
            <div className="cpdf-top-meta-folio">{refCode}</div>
            <div className="cpdf-top-meta-line">{today}</div>
            <div className="cpdf-top-meta-line">
              Pág. 1 de 1 · Vigencia {proposal.validityDays} días
            </div>
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
            {primaryContact ? (
              <>
                <p className="cpdf-party-name">{primaryContact.name}</p>
                <p className="cpdf-party-lines">
                  {primaryContact.title ? (
                    <>
                      {primaryContact.title}
                      <br />
                    </>
                  ) : null}
                  {companyDisplay}
                </p>
              </>
            ) : (
              <>
                <p className="cpdf-party-name">{companyDisplay}</p>
                <p className="cpdf-party-lines">Contacto por definir</p>
              </>
            )}
          </div>
          <div className="cpdf-party">
            <p className="cpdf-party-label">Elabora</p>
            {accountOwner ? (
              <>
                <p className="cpdf-party-name">{accountOwner.name}</p>
                <p className="cpdf-party-lines">
                  Zuperio · {USER_ROLE_LABEL[accountOwner.role] ?? "Gestión comercial"}
                  <br />
                  <a
                    className="cpdf-party-email"
                    href={`mailto:${accountOwner.email}`}
                  >
                    {accountOwner.email}
                  </a>
                </p>
              </>
            ) : (
              <>
                <p className="cpdf-party-name">{preparedByDisplay}</p>
                <p className="cpdf-party-lines">
                  Zuperio · Gestión comercial
                  <br />
                  <a className="cpdf-party-email" href="mailto:contacto@zuperio.com.mx">
                    contacto@zuperio.com.mx
                  </a>
                </p>
              </>
            )}
          </div>
        </div>

        {!isSimpleFormat && execSummary ? (
          <p className="cpdf-lead">{execSummary}</p>
        ) : null}
        {!isSimpleFormat && !execSummary ? (
          <p className="cpdf-lead">
            Propuesta comercial para{" "}
            <span className="cpdf-em">{candidateDisplay}</span>
            {" — "}
            <span className="cpdf-em">{roleLine}</span>
            {" — "}
            <span className="cpdf-em">{companyDisplay}</span>.
            {comparisonMatrix?.skillMatchActive &&
            comparisonMatrix.computedMatch != null ? (
              <>
                {" "}
                Cobertura de competencias requeridas:{" "}
                <span className="cpdf-em">
                  {comparisonMatrix.computedMatch.score}%
                </span>
                .
              </>
            ) : (
              " Puede completar el resumen ejecutivo en Zuperio cuando corresponda."
            )}
          </p>
        ) : null}

        <section className="cpdf-section">
          <p className="cpdf-sec-label">Recurso propuesto</p>
          <div className="cpdf-resource-card">
            <div className="cpdf-avatar">
              {initialsFromDisplayName(candidateDisplay)}
            </div>
            <div className="cpdf-resource-body">
              <div className="cpdf-resource-head">
                <div>
                  <p className="cpdf-resource-name">{candidateDisplay}</p>
                  <p className="cpdf-resource-role">
                    {profileSummary
                      ? profileSummary.split(/\n/)[0].trim().slice(0, 140) ||
                        "Especialización según perfil vinculado en Zuperio."
                      : !isPlaceholderDash(proposal.opportunityTitle)
                        ? safeTrim(proposal.opportunityTitle)
                        : roleLine}
                  </p>
                </div>
                {!isPlaceholderDash(proposal.vacancyTitle) ? (
                  <span className="cpdf-pill">{safeTrim(proposal.vacancyTitle)}</span>
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

        {comparisonMatrix?.skillMatchActive &&
        comparisonMatrix.computedMatch != null ? (
          <p className="cpdf-match-inline">
            <strong>Alineación por competencias:</strong>{" "}
            {comparisonMatrix.computedMatch.score}% —{" "}
            {comparisonMatrix.computedMatch.explanation ?? ""}
          </p>
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
                      {candidateDisplay}
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
                          Complete el bloque económico en Zuperio.
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
              Sin datos económicos. Complete la propuesta en Zuperio.
            </p>
          )}
        </section>

        {!isSimpleFormat && scopeNotes?.trim() ? (
          <section className="cpdf-section cpdf-section--compact">
            <p className="cpdf-sec-label">Alcance</p>
            <p className="cpdf-closing cpdf-closing--tight">{scopeNotes.trim()}</p>
          </section>
        ) : null}

        {isSimpleFormat ? (
          <div className="cpdf-terms-accept-wrap">
            <section className="cpdf-section cpdf-section--terms-in-wrap">
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

            <section className="cpdf-accept cpdf-accept--in-wrap">
              <p className="cpdf-accept-label">Aceptación</p>
              <div className="cpdf-accept-email-box">
                <p className="cpdf-accept-email-text">
                  Para aceptar esta propuesta, responda este correo con su
                  confirmación o comuníquese con su ejecutivo de cuenta en
                  Zuperio. La aceptación por escrito (correo electrónico) tiene
                  la misma validez que la firma de este documento como acuerdo
                  de intención de servicio.
                </p>
              </div>
            </section>
          </div>
        ) : (
          <>
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
              <div className="cpdf-accept-email-box">
                <p className="cpdf-accept-email-text">
                  Para aceptar esta propuesta, responda este correo con su
                  confirmación o comuníquese con su ejecutivo de cuenta en
                  Zuperio. La aceptación por escrito (correo electrónico) tiene
                  la misma validez que la firma de este documento como acuerdo
                  de intención de servicio.
                </p>
              </div>
            </section>
          </>
        )}

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
