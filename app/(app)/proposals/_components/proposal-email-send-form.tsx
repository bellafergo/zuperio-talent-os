"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ADDRESS = "admin@zuperio.com.mx";

function coerceEmailField(raw: string): string {
  const t = raw.trim();
  if (!t || t.startsWith("[")) return "";
  return EMAIL_RE.test(t) ? t : "";
}

function ChipInput({
  label,
  htmlFor,
  chips,
  onChange,
}: {
  label: string;
  htmlFor: string;
  chips: string[];
  onChange: (chips: string[]) => void;
}) {
  const [inputValue, setInputValue] = React.useState("");

  function addChip(value: string) {
    const email = value.trim().replace(/,+$/, "");
    if (!email || !EMAIL_RE.test(email) || chips.includes(email)) {
      setInputValue("");
      return;
    }
    onChange([...chips, email]);
    setInputValue("");
  }

  function removeChip(email: string) {
    onChange(chips.filter((c) => c !== email));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(inputValue);
    } else if (e.key === "Backspace" && !inputValue && chips.length > 0) {
      removeChip(chips[chips.length - 1]);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 cursor-text transition-all"
        onClick={() => document.getElementById(htmlFor)?.focus()}
      >
        {chips.map((email) => (
          <span
            key={email}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium"
          >
            {email}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeChip(email); }}
              className="text-muted-foreground hover:text-foreground leading-none"
              aria-label={`Quitar ${email}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={htmlFor}
          type="text"
          inputMode="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (inputValue.trim()) addChip(inputValue); }}
          className="min-w-[140px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
          placeholder={chips.length === 0 ? "correo@empresa.com" : "Añadir…"}
        />
      </div>
    </div>
  );
}

export function ProposalEmailSendForm({
  proposalId,
  canSend,
  hasCandidate,
  resendConfigured,
  defaultTo,
}: {
  proposalId: string;
  canSend: boolean;
  hasCandidate: boolean;
  resendConfigured: boolean;
  defaultTo: string;
}) {
  const router = useRouter();
  const [to, setTo] = React.useState(() => coerceEmailField(defaultTo));
  const [cc, setCc] = React.useState<string[]>([]);
  const [bcc, setBcc] = React.useState<string[]>([]);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/send-email`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, cc, bcc }),
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
          ? `Correo enviado. ID: ${data.messageId}`
          : "Correo enviado.",
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setPending(false);
    }
  }

  if (!canSend) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Solo <span className="font-medium text-foreground">Sales</span> y{" "}
        <span className="font-medium text-foreground">Director</span> pueden
        enviar correos al cliente. Puede copiar el borrador.
      </div>
    );
  }

  if (!hasCandidate) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
        Asigne un <span className="font-medium">candidato</span> en esta
        propuesta antes de enviar — el correo siempre incluye el CV en PDF.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {/* From — read-only */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="send-from">
            De
          </label>
          <Input
            id="send-from"
            type="text"
            value={`Zuperio <${FROM_ADDRESS}>`}
            readOnly
            className="text-muted-foreground cursor-default select-none"
            tabIndex={-1}
          />
        </div>

        {/* To */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground" htmlFor="send-to">
            Para
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

        {/* CC */}
        <div className="sm:col-span-2">
          <ChipInput
            label="CC"
            htmlFor="send-cc"
            chips={cc}
            onChange={setCc}
          />
        </div>

        {/* BCC */}
        <div className="sm:col-span-2">
          <ChipInput
            label="CCO (BCC)"
            htmlFor="send-bcc"
            chips={bcc}
            onChange={setBcc}
          />
        </div>
      </div>

      {/* Template note */}
      <div className="rounded-lg border border-border bg-muted/25 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          El correo se enviará con el <span className="font-medium text-foreground">diseño HTML Zuperio</span>:
          encabezado azul, perfil del candidato y bloque de tarifas. Los PDF se adjuntan al enviar.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          disabled={pending || !resendConfigured}
          title={!resendConfigured ? "Email no configurado (RESEND_API_KEY)" : undefined}
          className="w-fit"
        >
          {pending ? "Enviando…" : "Enviar correo"}
        </Button>
        {!resendConfigured ? (
          <p className="text-xs text-muted-foreground">
            Email no configurado —{" "}
            <code className="rounded bg-muted px-1">RESEND_API_KEY</code>{" "}
            requerido.
          </p>
        ) : null}
        {success ? (
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {success}
          </p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>
    </form>
  );
}
