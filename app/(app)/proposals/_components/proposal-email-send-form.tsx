"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function coerceEmailField(raw: string): string {
  const t = raw.trim();
  if (!t || t.startsWith("[")) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : "";
}

export function ProposalEmailSendForm({
  proposalId,
  canSend,
  hasCandidate,
  defaultTo,
  defaultSubject,
  defaultBody,
}: {
  proposalId: string;
  canSend: boolean;
  hasCandidate: boolean;
  defaultTo: string;
  defaultSubject: string;
  defaultBody: string;
}) {
  const router = useRouter();
  const [to, setTo] = useState(() => coerceEmailField(defaultTo));
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/send-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        messageId?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || res.statusText);
      }
      setSuccess(
        data.messageId
          ? `Email sent. Provider message id: ${data.messageId}`
          : "Email sent.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setPending(false);
    }
  }

  if (!canSend) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Only <span className="font-medium text-foreground">Sales</span> and{" "}
        <span className="font-medium text-foreground">Director</span> can send
        client emails. You can still copy the draft below.
      </div>
    );
  }

  if (!hasCandidate) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
        Assign a <span className="font-medium">candidate</span> on this proposal
        before sending — the client email always includes the Zuperio CV PDF.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="send-to">
            To
          </label>
          <Input
            id="send-to"
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="send-subject"
          >
            Subject
          </label>
          <Input
            id="send-subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="send-body">
            Body (plain text)
          </label>
          <textarea
            id="send-body"
            required
            rows={10}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Sending…" : "Send email"}
        </Button>
        {success ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {success}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Sends synchronously with the economic proposal and CV PDFs attached
        (regenerated at send time). Requires{" "}
        <code className="rounded bg-muted px-1">RESEND_API_KEY</code> and a
        verified <code className="rounded bg-muted px-1">EMAIL_FROM</code>.
      </p>
    </form>
  );
}
