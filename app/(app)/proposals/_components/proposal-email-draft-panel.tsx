import type { ProposalEmailDraft } from "@/lib/proposals/email-draft";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProposalEmailDraftPanel({ draft }: { draft: ProposalEmailDraft }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Deterministic draft for a future send flow — no mail is sent from Zuperio
        yet. Copy into your client or wire to an email provider when ready.
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
          <CardDescription>Template-based plain text.</CardDescription>
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
            Placeholders for the matching + proposal + CV workflow — files are not
            generated in-app yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {draft.attachments.map((a) => (
            <div
              key={a.kind}
              className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                  {a.filenameSuggestion}
                </p>
              </div>
              <Badge variant="secondary" className="w-fit shrink-0">
                {a.ready ? "Ready" : "Pending export"}
              </Badge>
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
