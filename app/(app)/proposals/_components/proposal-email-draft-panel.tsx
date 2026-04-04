import type {
  ProposalEmailAttachmentPlaceholder,
  ProposalEmailDraft,
} from "@/lib/proposals/email-draft";
import type { ProposalEmailTemplateData } from "@/lib/email/templates/proposal-email";

import { ProposalEmailComposer } from "./proposal-email-composer";

function normalizeAutoAttachments(
  draft: ProposalEmailDraft,
  proposalId: string,
): ProposalEmailAttachmentPlaceholder[] {
  const pid = typeof proposalId === "string" ? proposalId.trim() : "";
  const proposalPdfHref = pid ? `/api/proposals/${pid}/pdf` : null;

  const attachmentsIn = Array.isArray(draft.attachments) ? draft.attachments : [];
  const normalized: ProposalEmailAttachmentPlaceholder[] = [];
  for (const raw of attachmentsIn) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as ProposalEmailAttachmentPlaceholder;
    if (a.kind !== "ECONOMIC_PROPOSAL_PDF" && a.kind !== "CANDIDATE_CV_PDF") continue;
    normalized.push({
      kind: a.kind,
      label: typeof a.label === "string" ? a.label : "Adjunto",
      subtitle: typeof a.subtitle === "string" ? a.subtitle : "",
      filenameSuggestion:
        typeof a.filenameSuggestion === "string" ? a.filenameSuggestion : "documento.pdf",
      mimeType: "application/pdf",
      ready: Boolean(a.ready),
      lastExportedAt:
        a.lastExportedAt === null || typeof a.lastExportedAt === "string"
          ? a.lastExportedAt
          : null,
      downloadHref:
        a.downloadHref === null || typeof a.downloadHref === "string"
          ? a.downloadHref
          : null,
    });
  }

  if (normalized.length > 0) return normalized;

  return [
    {
      kind: "ECONOMIC_PROPOSAL_PDF",
      label: "Propuesta económica",
      subtitle: "PDF de la propuesta comercial",
      filenameSuggestion: "propuesta.pdf",
      mimeType: "application/pdf",
      ready: false,
      lastExportedAt: null,
      downloadHref: proposalPdfHref,
    },
    {
      kind: "CANDIDATE_CV_PDF",
      label: "CV del candidato",
      subtitle: "CV en formato Zuperio",
      filenameSuggestion: "cv.pdf",
      mimeType: "application/pdf",
      ready: false,
      lastExportedAt: null,
      downloadHref: null,
    },
  ];
}

export function ProposalEmailDraftPanel({
  draft,
  proposalId,
  canSendEmail,
  hasCandidate,
  resendConfigured,
  templateData,
  defaultSubject,
}: {
  draft: ProposalEmailDraft;
  proposalId: string;
  canSendEmail: boolean;
  hasCandidate: boolean;
  resendConfigured: boolean;
  templateData: ProposalEmailTemplateData;
  defaultSubject: string;
}) {
  const pid = typeof proposalId === "string" ? proposalId.trim() : "";
  const recipientEmail =
    typeof draft.recipientEmail === "string" &&
    draft.recipientEmail.trim() &&
    !draft.recipientEmail.startsWith("[")
      ? draft.recipientEmail.trim()
      : "";
  const autoAttachments = normalizeAutoAttachments(draft, pid);

  return (
    <div className="space-y-5">
      {/* Step banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-white px-4 py-3.5 shadow-sm dark:border-blue-900/40 dark:from-blue-950/30 dark:via-background dark:to-background">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
          aria-hidden
        >
          2
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-semibold text-foreground">
            Correo sugerido — listo para enviar
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Borrador determinista con el mismo tono comercial que la propuesta en PDF.
            El cuerpo es editable y el preview refleja los cambios en tiempo real.
          </p>
        </div>
      </div>

      <ProposalEmailComposer
        proposalId={pid || proposalId}
        canSend={canSendEmail}
        hasCandidate={hasCandidate}
        resendConfigured={resendConfigured}
        templateData={templateData}
        defaultTo={recipientEmail}
        defaultSubject={defaultSubject}
        autoAttachments={autoAttachments}
      />
    </div>
  );
}
