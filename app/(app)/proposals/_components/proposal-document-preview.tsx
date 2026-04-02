import type { ProposalDetailUi } from "@/lib/proposals/types";
import {
  DetailedPricingTable,
  SimplePricingTable,
} from "@/lib/proposals/pdf-template/proposal-pricing-blocks";

import "./proposal-document.css";

type ProposalDocumentPreviewProps = {
  proposal: ProposalDetailUi;
  preparedByDisplay: string;
  /** Hide the in-app print hint (PDF export and bare print view). */
  hidePrintHint?: boolean;
};

const STANDARD_CONDITIONS_ES = [
  "Esta propuesta comercial es orientativa y queda sujeta a contrato. Los montos reflejan los supuestos e información registrados en Zuperio a la fecha de emisión.",
  "Las condiciones de prestación del servicio, plazos de aviso y entregables se confirmarán en el contrato marco o en el anexo / statement of work correspondiente.",
  "Esta propuesta conserva su vigencia durante el plazo indicado en el documento, salvo revocación previa por escrito.",
];

export function ProposalDocumentPreview({
  proposal,
  preparedByDisplay,
  hidePrintHint = false,
}: ProposalDocumentPreviewProps) {
  const currency = proposal.currency?.trim() || "MXN";
  const isDetailed = proposal.formatValue === "DETAILED";
  const p = proposal.pricing;

  const today = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="proposal-print-root space-y-3">
      {!hidePrintHint ? (
        <p className="proposal-no-print text-xs text-muted-foreground">
          Vista previa — use{" "}
          <span className="font-medium text-foreground">Descargar PDF</span> en
          esta página, o{" "}
          <span className="font-medium text-foreground">Imprimir</span> →{" "}
          <span className="font-medium text-foreground">Guardar como PDF</span>{" "}
          para conservar el diseño de alta calidad del documento.
        </p>
      ) : null}
      <article
        className="proposal-print-sheet mx-auto max-w-[720px] px-8 py-10"
        aria-label="Proposal preview"
      >
        <header className="border-b border-[var(--proposal-doc-border)] pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
                Zuperio
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Propuesta comercial
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Staff augmentation · {proposal.format} · {proposal.type}
              </p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{today}</p>
              <p>Ref. {proposal.id.slice(0, 8)}</p>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Cliente
            </h3>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {proposal.companyName}
            </p>
            {proposal.opportunityTitle !== "—" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Oportunidad: {proposal.opportunityTitle}
              </p>
            ) : null}
          </div>
          <div>
            <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
              Elaborado por
            </h3>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {preparedByDisplay}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Zuperio Talent OS</p>
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Recurso propuesto
          </h3>
          <table className="mt-3">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Rol / vacante</th>
                <th className="num">Horas mensuales</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-foreground">
                  {proposal.candidateName}
                </td>
                <td className="text-muted-foreground">
                  {proposal.vacancyTitle !== "—"
                    ? proposal.vacancyTitle
                    : proposal.opportunityTitle}
                </td>
                <td className="num tabular-nums text-foreground">
                  {p ? String(p.monthlyHours) : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="mt-8">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            {isDetailed ? "Desglose económico" : "Resumen de precios"}
          </h3>
          {p ? (
            isDetailed ? (
              <DetailedPricingTable currency={currency} proposal={proposal} />
            ) : (
              <SimplePricingTable currency={currency} proposal={proposal} />
            )
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Aún no hay bloque de precios en esta propuesta.
            </p>
          )}
        </section>

        <ProposalNarrativeSections proposal={proposal} />

        <section className="mt-8">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Condiciones generales
          </h3>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            {STANDARD_CONDITIONS_ES.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {proposal.commercialNotes?.trim() ? (
            <div className="mt-4 rounded-md border border-[var(--proposal-doc-border)] bg-muted/20 px-3 py-2 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-muted-foreground">
                Observaciones comerciales
              </p>
              <p className="mt-1 whitespace-pre-wrap">{proposal.commercialNotes}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-10 border-t border-[var(--proposal-doc-border)] pt-6">
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            Aceptación
          </h3>
          <p className="mt-3 text-xs text-muted-foreground">
            Al firmar abajo, el cliente confirma la aceptación de esta propuesta
            comercial, sujeta al contrato definitivo.
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-foreground">
                Por {proposal.companyName}
              </p>
              <div className="mt-10 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                Nombre y cargo
              </div>
              <div className="mt-6 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                Firma y fecha
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Por Zuperio</p>
              <div className="mt-10 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                Nombre y cargo
              </div>
              <div className="mt-6 border-b border-foreground/40 pb-1 text-xs text-muted-foreground">
                Firma y fecha
              </div>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}

function ProposalNarrativeSections({
  proposal,
}: {
  proposal: ProposalDetailUi;
}) {
  const blocks: { title: string; body: string | null }[] = [
    { title: "Resumen ejecutivo", body: proposal.executiveSummary },
    { title: "Perfil del candidato", body: proposal.profileSummary },
    { title: "Alcance", body: proposal.scopeNotes },
  ];
  const filled = blocks.filter((b) => b.body?.trim());
  if (filled.length === 0) return null;
  return (
    <section className="mt-8 space-y-6">
      {filled.map((b) => (
        <div key={b.title}>
          <h3 className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
            {b.title}
          </h3>
          <div className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground">
            {b.body}
          </div>
        </div>
      ))}
    </section>
  );
}
