"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileTextIcon, Loader2Icon, PaperclipIcon, RotateCcwIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ProposalEmailAttachmentPlaceholder } from "@/lib/proposals/email-draft";
import {
  buildDefaultBodyText,
  buildProposalEmailHtml,
  type ProposalEmailTemplateData,
} from "@/lib/email/templates/proposal-email";

// ─── constants ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_ADDRESS = "admin@zuperio.com.mx";
const MAX_EXTRA_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPT_TYPES = ".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg";

// ─── helpers ──────────────────────────────────────────────────────────────────

function coerceEmail(raw: string): string {
  const t = raw.trim();
  return t && !t.startsWith("[") && EMAIL_RE.test(t) ? t : "";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

// ─── ChipInput ────────────────────────────────────────────────────────────────

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
  const [value, setValue] = React.useState("");

  function add(raw: string) {
    const email = raw.trim().replace(/,+$/, "");
    if (!email || !EMAIL_RE.test(email) || chips.includes(email)) {
      setValue("");
      return;
    }
    onChange([...chips, email]);
    setValue("");
  }

  function remove(email: string) {
    onChange(chips.filter((c) => c !== email));
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground" htmlFor={htmlFor}>
        {label}
      </label>
      <div
        className="flex min-h-9 flex-wrap items-center gap-1.5 cursor-text rounded-lg border border-input bg-background px-3 py-2 text-sm transition-all focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50"
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
              onClick={(e) => { e.stopPropagation(); remove(email); }}
              className="leading-none text-muted-foreground hover:text-foreground"
              aria-label={`Quitar ${email}`}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={htmlFor}
          type="text"
          inputMode="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(value); }
            else if (e.key === "Backspace" && !value && chips.length > 0) remove(chips[chips.length - 1]);
          }}
          onBlur={() => { if (value.trim()) add(value); }}
          className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-sm"
          placeholder={chips.length === 0 ? "correo@empresa.com" : "Añadir…"}
        />
      </div>
    </div>
  );
}

// ─── ProposalEmailComposer ────────────────────────────────────────────────────

type LoadingStep = "idle" | "pdf" | "sending";

type Props = {
  proposalId: string;
  canSend: boolean;
  hasCandidate: boolean;
  resendConfigured: boolean;
  templateData: ProposalEmailTemplateData;
  defaultTo: string;
  defaultSubject: string;
  autoAttachments: ProposalEmailAttachmentPlaceholder[];
};

export function ProposalEmailComposer({
  proposalId,
  canSend,
  hasCandidate,
  resendConfigured,
  templateData,
  defaultTo,
  defaultSubject,
  autoAttachments,
}: Props) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ── address fields
  const [to, setTo] = React.useState(() => coerceEmail(defaultTo));
  const [cc, setCc] = React.useState<string[]>([]);
  const [bcc, setBcc] = React.useState<string[]>([]);

  // ── subject
  const [subject, setSubject] = React.useState(defaultSubject);

  // ── body editor
  const defaultBody = React.useMemo(() => buildDefaultBodyText(templateData), [templateData]);
  const [bodyText, setBodyText] = React.useState(defaultBody);
  const isDirty = bodyText !== defaultBody;

  // ── content tab
  const [contentTab, setContentTab] = React.useState<"preview" | "editor">("preview");

  // ── preview HTML (auto-recomputed when bodyText changes)
  const previewHtml = React.useMemo(
    () => buildProposalEmailHtml(templateData, bodyText),
    [templateData, bodyText],
  );

  // ── extra file attachments
  const [extraFiles, setExtraFiles] = React.useState<File[]>([]);
  const [fileErrors, setFileErrors] = React.useState<string[]>([]);

  // ── send state
  const [loadingStep, setLoadingStep] = React.useState<LoadingStep>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [successAt, setSuccessAt] = React.useState<Date | null>(null);

  const isPending = loadingStep !== "idle";
  const canSubmit = canSend && hasCandidate && resendConfigured && !isPending && Boolean(to);

  // ── file picker
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    const errors: string[] = [];
    const valid: File[] = [];

    for (const file of incoming) {
      if (extraFiles.length + valid.length >= MAX_EXTRA_FILES) {
        errors.push(`Máximo ${MAX_EXTRA_FILES} archivos adicionales`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        errors.push(`${file.name}: demasiado grande (máx 5 MB)`);
      } else {
        valid.push(file);
      }
    }

    setExtraFiles((prev) => [...prev, ...valid].slice(0, MAX_EXTRA_FILES));
    setFileErrors(errors);
    e.target.value = "";
  }

  function removeExtraFile(index: number) {
    setExtraFiles((prev) => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  }

  // ── submit
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessAt(null);
    setLoadingStep("pdf");

    const timer = setTimeout(() => setLoadingStep("sending"), 6000);

    const fd = new FormData();
    fd.append("to", to);
    fd.append("cc", JSON.stringify(cc));
    fd.append("bcc", JSON.stringify(bcc));
    fd.append("subject", subject.trim() || defaultSubject);
    fd.append("bodyText", bodyText);
    for (const file of extraFiles) {
      fd.append("extraFile", file);
    }

    try {
      const res = await fetch(`/api/proposals/${proposalId}/send-email`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      clearTimeout(timer);
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        messageId?: string;
      };
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setSuccessAt(new Date());
      router.refresh();
    } catch (err) {
      clearTimeout(timer);
      setError(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setLoadingStep("idle");
    }
  }

  const buttonLabel =
    loadingStep === "pdf"
      ? "Generando PDFs…"
      : loadingStep === "sending"
        ? "Enviando…"
        : "Enviar correo";

  const buttonDisabledTitle = !resendConfigured
    ? "Configura RESEND_API_KEY en .env para habilitar el envío"
    : !hasCandidate
      ? "Asigna un candidato en la propuesta antes de enviar"
      : !canSend
        ? "Solo Sales y Director pueden enviar correos al cliente"
        : undefined;

  return (
    <Card className="shadow-sm ring-1 ring-foreground/[0.04]">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-semibold">Redactar y enviar</CardTitle>
        <CardDescription>
          Los PDF de propuesta y CV se adjuntan automáticamente al enviar.
        </CardDescription>
      </CardHeader>

      <form onSubmit={onSubmit}>
        <CardContent className="p-0">
          <div className="divide-y divide-border">

            {/* ── Restriction banners ── */}
            {(!canSend || !hasCandidate) && (
              <div className="p-5 space-y-2">
                {!canSend && (
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Solo <span className="font-medium text-foreground">Sales</span> y{" "}
                    <span className="font-medium text-foreground">Director</span> pueden enviar correos al cliente.
                  </div>
                )}
                {!hasCandidate && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-foreground">
                    Asigne un <span className="font-medium">candidato</span> en esta propuesta para habilitar el envío.
                  </div>
                )}
              </div>
            )}

            {/* ── Address fields ── */}
            <div className="p-5 space-y-3">
              {/* From */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp-from">
                  De
                </label>
                <Input
                  id="cmp-from"
                  type="text"
                  value={`Zuperio <${FROM_ADDRESS}>`}
                  readOnly
                  tabIndex={-1}
                  className="cursor-default select-none text-muted-foreground"
                />
              </div>
              {/* To */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp-to">
                  Para
                </label>
                <Input
                  id="cmp-to"
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  autoComplete="email"
                  placeholder="cliente@empresa.com"
                />
              </div>
              {/* CC */}
              <ChipInput label="CC" htmlFor="cmp-cc" chips={cc} onChange={setCc} />
              {/* BCC */}
              <ChipInput label="CCO (BCC)" htmlFor="cmp-bcc" chips={bcc} onChange={setBcc} />
            </div>

            {/* ── Subject ── */}
            <div className="p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="cmp-subject">
                  Asunto
                </label>
                <Input
                  id="cmp-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>

            {/* ── Preview / Editor tabs ── */}
            <div className="p-5 space-y-3">
              {/* Tab switcher */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={() => setContentTab("preview")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      contentTab === "preview"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentTab("editor")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      contentTab === "editor"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Editar cuerpo
                  </button>
                </div>
                {contentTab === "editor" && isDirty && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground text-xs"
                    onClick={() => setBodyText(defaultBody)}
                  >
                    <RotateCcwIcon className="size-3" aria-hidden />
                    Restaurar original
                  </Button>
                )}
              </div>

              {/* Preview tab */}
              {contentTab === "preview" && (
                <div className="space-y-2">
                  <iframe
                    srcDoc={previewHtml}
                    title="Preview del correo"
                    className="w-full rounded-lg border border-border"
                    style={{ height: "500px" }}
                    sandbox=""
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {isDirty
                      ? "Preview actualizado · así verá el cliente el correo"
                      : "Así verá el cliente el correo"}
                  </p>
                </div>
              )}

              {/* Editor tab */}
              {contentTab === "editor" && (
                <div className="space-y-2">
                  <textarea
                    id="cmp-body"
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    rows={18}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-all focus:border-ring focus:ring-[3px] focus:ring-ring/50 font-mono resize-y"
                    style={{ minHeight: "300px", height: "500px" }}
                    placeholder="Cuerpo del correo…"
                  />
                  <p className="text-xs text-muted-foreground">
                    Texto editable · El encabezado Zuperio, perfil del candidato y bloque de tarifas son fijos.
                  </p>
                </div>
              )}
            </div>

            {/* ── Attachments ── */}
            <div className="p-5 space-y-4">
              <p className="text-sm font-medium text-foreground">Adjuntos</p>

              {/* Auto (fixed) */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Automáticos · siempre incluidos
                </p>
                <div className="space-y-1.5">
                  {autoAttachments.map((a) => (
                    <div
                      key={a.kind}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <FileTextIcon className="size-4 shrink-0 text-red-500" aria-hidden />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {a.filenameSuggestion}
                          </p>
                          <p className="text-xs text-muted-foreground">{a.label}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          Automático
                        </Badge>
                        {a.downloadHref && (
                          <a
                            href={a.downloadHref}
                            download={a.filenameSuggestion}
                            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                          >
                            Descargar
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Se generan al enviar · No se pueden quitar
                </p>
              </div>

              {/* Extra files */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Archivos adicionales (opcional · máx {MAX_EXTRA_FILES})
                </p>

                {extraFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {extraFiles.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-background px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <PaperclipIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          <div className="min-w-0">
                            <p className="truncate text-sm text-foreground">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExtraFile(i)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label={`Quitar ${file.name}`}
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {fileErrors.length > 0 && (
                  <div className="space-y-1">
                    {fileErrors.map((err, i) => (
                      <p key={i} className="text-xs text-destructive">{err}</p>
                    ))}
                  </div>
                )}

                {extraFiles.length < MAX_EXTRA_FILES && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_TYPES}
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PaperclipIcon className="size-3.5" aria-hidden />
                      + Agregar archivo
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* ── Send button ── */}
            <div className="p-5 space-y-3">
              <Button
                type="submit"
                disabled={!canSubmit}
                title={buttonDisabledTitle}
                className="w-full gap-2"
                size="lg"
              >
                {isPending && <Loader2Icon className="size-4 animate-spin" aria-hidden />}
                {buttonLabel}
              </Button>

              {!resendConfigured && (
                <p className="text-center text-xs text-muted-foreground">
                  Email no configurado —{" "}
                  <code className="rounded bg-muted px-1">RESEND_API_KEY</code> requerido.
                </p>
              )}
              {successAt && (
                <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ Correo enviado a {to} · {formatTime(successAt)}
                </p>
              )}
              {error && (
                <p className="text-center text-sm text-destructive">{error}</p>
              )}
            </div>

          </div>
        </CardContent>
      </form>
    </Card>
  );
}
