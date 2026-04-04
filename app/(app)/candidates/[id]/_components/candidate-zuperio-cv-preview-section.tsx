import Link from "next/link";

import { SectionCard } from "@/components/layout";
import {
  isSafeCandidateCvPrintData,
  type CandidateCvPrintData,
} from "@/lib/candidates/get-candidate-cv-print-data";
import { CandidateCvConsultingDocument } from "@/lib/candidates/pdf-template/candidate-cv-consulting";

export function CandidateZuperioCvPreviewSection({
  candidateId,
  cvPrintData,
}: {
  candidateId: string;
  cvPrintData: CandidateCvPrintData | null;
}) {
  const safe = isSafeCandidateCvPrintData(cvPrintData);

  return (
    <SectionCard
      title="CV Zuperio (vista previa)"
      description="Misma plantilla que el PDF exportable y la vista previa en propuestas. La experiencia laboral se toma del texto persistido del CV (campo «Experiencia laboral (texto del CV)»), no de asignaciones internas."
    >
      {!safe ? (
        <p className="text-sm text-muted-foreground">
          No fue posible cargar la vista previa del CV Zuperio.
        </p>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            <Link
              href={`/candidates/${candidateId}/cv-print`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Abrir vista de impresión
            </Link>{" "}
            (útil para revisar el layout antes de exportar).
          </p>
          <div className="mx-auto w-full max-w-[210mm] rounded-xl border border-border/80 bg-white p-4 shadow-sm ring-1 ring-foreground/[0.04] sm:p-6">
            <CandidateCvConsultingDocument data={cvPrintData} variant="screen" />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
