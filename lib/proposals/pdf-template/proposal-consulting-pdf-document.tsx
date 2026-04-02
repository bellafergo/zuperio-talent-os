import type { ProposalDetailUi } from "@/lib/proposals/types";

import {
  DetailedPricingTable,
  SimplePricingTable,
} from "@/lib/proposals/pdf-template/proposal-pricing-blocks";

import "@/app/(app)/proposals/_components/proposal-document.css";
import "./proposal-consulting-pdf.css";

const STANDARD_CONDITIONS_ES = [
  "Esta propuesta comercial es orientativa y queda sujeta a contrato. Los montos reflejan los supuestos e información registrados en Zuperio a la fecha de emisión.",
  "Las condiciones de prestación del servicio, plazos de aviso y entregables se confirmarán en el contrato marco o en el anexo / statement of work correspondiente.",
  "Esta propuesta conserva su vigencia durante el plazo indicado en el documento, salvo revocación previa por escrito.",
];

type ProposalConsultingPdfDocumentProps = {
  proposal: ProposalDetailUi;
  preparedByDisplay: string;
};

function formatTodayEsMx(): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function ProposalConsultingPdfDocument({
  proposal,
  preparedByDisplay,
}: ProposalConsultingPdfDocumentProps) {
  const currency = proposal.currency?.trim() || "MXN";
  const isDetailed = proposal.formatValue === "DETAILED";
  const p = proposal.pricing;
  const today = formatTodayEsMx();
  const refShort = proposal.id.slice(0, 8);

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

  return (
    <div className="consulting-pdf-root">
      <article
        className="consulting-pdf-doc proposal-print-sheet border-0 bg-transparent p-0 shadow-none"
        aria-label="Propuesta comercial (PDF)"
      >
        <header className="cpdf-header">
          <div>
            <p className="cpdf-brand">Zuperio</p>
            <p className="cpdf-hero-tagline">Propuesta comercial</p>
          </div>
          <div className="cpdf-header-meta">
            <strong>{today}</strong>
            <span>Ref. {refShort}</span>
            <span>
              {proposal.format} · {proposal.type}
            </span>
          </div>
        </header>

        <div className="cpdf-hero">
          <h1 className="cpdf-hero-title">{proposal.companyName}</h1>
          <p className="cpdf-hero-sub">{proposalName}</p>
          <p className="cpdf-hero-tagline">Staff augmentation</p>
        </div>

        <div className="cpdf-meta-grid">
          <div>
            <p className="cpdf-meta-label">Cliente</p>
            <p className="cpdf-meta-value">{proposal.companyName}</p>
            {proposal.opportunityTitle !== "—" ? (
              <p className="cpdf-meta-note">
                Oportunidad: {proposal.opportunityTitle}
              </p>
            ) : null}
          </div>
          <div>
            <p className="cpdf-meta-label">Elaborado por</p>
            <p className="cpdf-meta-value">{preparedByDisplay}</p>
            <p className="cpdf-meta-note">Zuperio Talent OS</p>
          </div>
        </div>

        <section className="cpdf-section">
          <div className="cpdf-card">
            <h2 className="cpdf-section-title">Resumen ejecutivo</h2>
            {execSummary ? (
              <p className="cpdf-body">{execSummary}</p>
            ) : (
              <p className="cpdf-body cpdf-body--empty">
                Sin resumen ejecutivo registrado.
              </p>
            )}
          </div>
        </section>

        <section className="cpdf-section">
          <div className="cpdf-card cpdf-card--muted">
            <h2 className="cpdf-section-title">Perfil del candidato</h2>
            <table className="cpdf-table">
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Rol / vacante</th>
                  <th className="num">Horas mensuales</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cpdf-table-strong">{proposal.candidateName}</td>
                  <td className="cpdf-table-muted">{roleLine}</td>
                  <td className="num cpdf-tabular">
                    {p ? String(p.monthlyHours) : "—"}
                  </td>
                </tr>
              </tbody>
            </table>
            {profileSummary ? (
              <p className="cpdf-body cpdf-body-follow">{profileSummary}</p>
            ) : (
              <p className="cpdf-body cpdf-body--empty cpdf-body-follow">
                Sin perfil narrativo adicional.
              </p>
            )}
          </div>
        </section>

        <section className="cpdf-section">
          <div className="cpdf-card">
            <h2 className="cpdf-section-title">
              {isDetailed
                ? "Inversión — desglose económico"
                : "Inversión — resumen"}
            </h2>
            {p ? (
              isDetailed ? (
                <DetailedPricingTable currency={currency} proposal={proposal} />
              ) : (
                <SimplePricingTable
                  currency={currency}
                  proposal={proposal}
                  variant="consulting"
                />
              )
            ) : (
              <p className="cpdf-body cpdf-body--empty">
                Aún no hay bloque de precios en esta propuesta.
              </p>
            )}
          </div>
        </section>

        <section className="cpdf-section">
          <div className="cpdf-card">
            <h2 className="cpdf-section-title">Alcance y notas</h2>
            {scopeNotes ? (
              <p className="cpdf-body">{scopeNotes}</p>
            ) : (
              <p className="cpdf-body cpdf-body--empty">
                Sin notas de alcance registradas.
              </p>
            )}
          </div>
        </section>

        <section className="cpdf-section">
          <div className="cpdf-card cpdf-card--muted">
            <h2 className="cpdf-section-title">Condiciones generales</h2>
            <ul className="cpdf-conditions">
              {STANDARD_CONDITIONS_ES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {proposal.commercialNotes?.trim() ? (
              <div className="cpdf-remark-box">
                <p className="cpdf-remark-label">Observaciones comerciales</p>
                <p className="cpdf-remark-body">
                  {proposal.commercialNotes.trim()}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="cpdf-accept">
          <h2 className="cpdf-accept-title">Aceptación</h2>
          <p className="cpdf-accept-intro">
            Al firmar en los espacios señalados, el cliente confirma la
            aceptación de esta propuesta comercial, sin perjuicio del contrato
            definitivo.
          </p>
          <div className="cpdf-sign-grid">
            <div>
              <p className="cpdf-sign-party">Por {proposal.companyName}</p>
              <div className="cpdf-sign-line">Nombre y cargo</div>
              <div className="cpdf-sign-line">Firma y fecha</div>
            </div>
            <div>
              <p className="cpdf-sign-party">Por Zuperio</p>
              <div className="cpdf-sign-line">Nombre y cargo</div>
              <div className="cpdf-sign-line">Firma y fecha</div>
            </div>
          </div>
        </section>

        <footer className="cpdf-doc-footer">
          <span>Zuperio · Propuesta confidencial</span>
          <span>
            {proposal.companyName} · Ref. {refShort} · {today}
          </span>
        </footer>
      </article>
    </div>
  );
}
