"use client";

import { DownloadIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  candidateId: string;
  cvFileName: string | null;
  cvUploadedAt: Date | null;
  canUpload: boolean;
  canDelete: boolean;
};

export function CandidateCvFileSection({
  candidateId,
  cvFileName,
  cvUploadedAt,
  canUpload,
  canDelete,
}: Props) {
  const safeId = typeof candidateId === "string" ? candidateId.trim() : "";
  if (!safeId) {
    return (
      <p className="text-sm text-muted-foreground">
        No se puede gestionar el CV: identificador de candidato no válido.
      </p>
    );
  }

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/candidates/${candidateId}/cv-upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? res.statusText);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar el CV original de este candidato?")) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/candidates/${safeId}/cv-file`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? res.statusText);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el archivo");
    } finally {
      setDeleting(false);
    }
  }

  let uploadedAtLabel: string | null = null;
  if (cvUploadedAt) {
    try {
      const d = new Date(cvUploadedAt);
      if (!Number.isNaN(d.getTime())) {
        uploadedAtLabel = new Intl.DateTimeFormat("es-MX", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(d);
      }
    } catch {
      uploadedAtLabel = null;
    }
  }

  return (
    <div className="space-y-3">
      {cvFileName && typeof cvFileName === "string" ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{cvFileName}</p>
            {uploadedAtLabel ? (
              <p className="text-xs text-muted-foreground">Subido el {uploadedAtLabel}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`/api/candidates/${safeId}/cv-file`}
              download
              className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <DownloadIcon className="size-3.5" aria-hidden />
              Descargar
            </a>
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={deleting}
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                aria-label="Eliminar CV"
              >
                <Trash2Icon className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No hay CV original subido.
        </p>
      )}

      {canUpload ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-1.5"
          >
            <UploadIcon className="size-3.5" aria-hidden />
            {uploading ? "Subiendo…" : cvFileName ? "Reemplazar CV" : "Subir CV original"}
          </Button>
        </>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
