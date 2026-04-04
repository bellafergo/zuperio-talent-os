import { FileTextIcon } from "lucide-react";

import type {
  ProposalEmailAttachmentPlaceholder,
  ProposalEmailDraft,
} from "@/lib/proposals/email-draft";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProposalEmailSendForm } from "./proposal-email-send-form";

function formatExportedAt(iso: string | null): string {
  if (!iso) return "Sin exportar aún";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return (
      new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(d) + " UTC"
    );
  } catch {
    return "Sin exportar aún";
  }
}

function normalizeEmailDraftForPanel(
  draft: ProposalEmailDraft,
  proposalId: string,
): ProposalEmailDraft {
  const pid = typeof proposalId === "string" && proposalId.trim() ? proposalId.trim() : "";
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

  const attachments =
    normalized.length > 0
      ? normalized
      : [
          {
            kind: "ECONOMIC_PROPOSAL_PDF" as const,
            label: "Propuesta económica",
            subtitle: "Documento PDF",
            filenameSuggestion: "propuesta.pdf",
            mimeType: "application/pdf" as const,
            ready: false,
            lastExportedAt: null,
            downloadHref: proposalPdfHref,
          },
          {
            kind: "CANDIDATE_CV_PDF" as const,
            label: "CV del candidato",
            subtitle: "Documento PDF",
            filenameSuggestion: "cv.pdf",
            mimeType: "application/pdf" as const,
            ready: false,
            lastExportedAt: null,
            downloadHref: null,
          },
        ];

  return {
    recipientName:
      typeof draft.recipientName === "string"
        ? draft.recipientName
        : "[Nombre del contacto]",
    recipientEmail:
      typeof draft.recipientEmail === "string"
        ? draft.recipientEmail
        : "[contacto@empresa.com]",
    subject:
      typeof draft.subject === "string" && draft.subject.trim()
        ? draft.subject
        : "Propuesta comercial · Zuperio",
    bodyPlainText:
      typeof draft.bodyPlainText === "string" ? draft.bodyPlainText : "",
    attachments,
  };
}

export function ProposalEmailDraftPanel({
  draft,
  proposalId,
  canSendEmail,
  hasCandidate,
}: {
  draft: ProposalEmailDraft;
  proposalId: string;
  canSendEmail: boolean;
  hasCandidate: boolean;
}) {
  const safeProposalId =
    typeof proposalId === "string" && proposalId.trim() ? proposalId.trim() : "";
  const d = normalizeEmailDraftForPanel(draft, safeProposalId);

  return (
    <div className="space-y-5">
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
            Borrador determinista con el mismo tono comercial que la propuesta en
            PDF. No se envía correo hasta que confirme en el formulario.
          </p>
        </div>
      </div>

      <Card className="shadow-sm ring-1 ring-foreground/[0.04]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Enviar correo</CardTitle>
          <CardDescription>
            Los PDF se adjuntan al enviar (se regeneran en el servidor).
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ProposalEmailSendForm
            proposalId={safeProposalId || proposalId}
            canSend={canSendEmail}
            hasCandidate={hasCandidate}
            defaultTo={d.recipientEmail}
            defaultSubject={d.subject}
            defaultBody={d.bodyPlainText}
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-foreground/[0.04]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Destinatario y asunto</CardTitle>
          <CardDescription>
            Tomados del contacto preferido de la empresa cuando existe.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
          <Field label="Para" value={d.recipientName} />
          <Field label="Correo" value={d.recipientEmail} />
          <div className="sm:col-span-2">
            <Field label="Asunto" value={d.subject} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-foreground/[0.04]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Cuerpo del mensaje</CardTitle>
          <CardDescription>
            Texto plano editable antes de enviar. Puede personalizar saludo y
            cifras.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="max-h-[min(420px,55vh)] overflow-auto rounded-lg border border-border/80 bg-muted/25 p-4 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {d.bodyPlainText}
          </pre>
        </CardContent>
      </Card>

      <Card className="shadow-sm ring-1 ring-foreground/[0.04]">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-semibold">Adjuntos previstos</CardTitle>
          <CardDescription>
            Vista previa de lo que el cliente recibirá junto al correo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {d.attachments.map((a) => (
            <div
              key={a.kind}
              className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-3">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-red-50 ring-1 ring-red-100 dark:bg-red-950/40 dark:ring-red-900/50"
                  aria-hidden
                >
                  <FileTextIcon className="size-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{a.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.subtitle}</p>
                  <p className="mt-1.5 truncate font-mono text-[0.7rem] text-muted-foreground">
                    {a.filenameSuggestion}
                  </p>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Última exportación:{" "}
                    <span className="font-medium text-foreground">
                      {formatExportedAt(a.lastExportedAt)}
                    </span>
                  </p>
                  {a.kind === "CANDIDATE_CV_PDF" && !a.downloadHref ? (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      Asigne un candidato en la propuesta para habilitar el CV en
                      PDF.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                <Badge variant={a.ready ? "default" : "secondary"} className="w-fit">
                  {a.ready ? "Exportado antes" : "Pendiente de exportar"}
                </Badge>
                {a.downloadHref ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={a.downloadHref} download={a.filenameSuggestion}>
                      Descargar PDF
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
