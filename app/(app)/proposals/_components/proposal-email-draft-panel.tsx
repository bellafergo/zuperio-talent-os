import type { ProposalEmailDraft } from "@/lib/proposals/email-draft";

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
  if (!iso) return "Never exported";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(d) + " UTC"
  );
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
  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Send email</CardTitle>
          <CardDescription>
            Uses the draft below. Both PDFs are attached automatically when you
            send.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ProposalEmailSendForm
            proposalId={proposalId}
            canSend={canSendEmail}
            hasCandidate={hasCandidate}
            defaultTo={draft.recipientEmail}
            defaultSubject={draft.subject}
            defaultBody={draft.bodyPlainText}
          />
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Deterministic draft — no mail is sent until you use{" "}
        <span className="font-medium text-foreground">Send email</span> above.
      </p>
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Routing</CardTitle>
          <CardDescription>Populated from the company contact when available.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
          <Field label="Recipient name" value={draft.recipientName} />
          <Field label="Recipient email" value={draft.recipientEmail} />
          <div className="sm:col-span-2">
            <Field label="Subject" value={draft.subject} />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Body draft</CardTitle>
          <CardDescription>Template-based plain text (editable before send).</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="max-h-[min(420px,55vh)] overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed whitespace-pre-wrap text-foreground">
            {draft.bodyPlainText}
          </pre>
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Attachments</CardTitle>
          <CardDescription>
            Export state is tracked per proposal (economic) and per candidate
            (CV). Sending always regenerates fresh PDFs for the email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {draft.attachments.map((a) => (
            <div
              key={a.kind}
              className="flex flex-col gap-3 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {a.filenameSuggestion}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Last export:{" "}
                  <span className="font-medium text-foreground">
                    {formatExportedAt(a.lastExportedAt)}
                  </span>
                </p>
                {a.downloadHref ? (
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    Endpoint:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
                      {a.downloadHref}
                    </code>
                  </p>
                ) : a.kind === "CANDIDATE_CV_PDF" ? (
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                    Assign a candidate on the proposal to enable the CV PDF
                    endpoint.
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                <Badge variant={a.ready ? "default" : "secondary"} className="w-fit">
                  {a.ready ? "Exported" : "Not exported yet"}
                </Badge>
                {a.downloadHref ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={a.downloadHref} download={a.filenameSuggestion}>
                      Download PDF
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
