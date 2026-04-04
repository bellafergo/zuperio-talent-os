import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { getCandidateByIdForUi, getCandidateEditData, getCandidateCvFileInfo } from "@/lib/candidates/queries";
import type { CandidateMatchRowUi } from "@/lib/matching/types";
import { listMatchesForCandidateUi } from "@/lib/matching/queries";
import { getCurrentAssignmentForCandidateUi } from "@/lib/placements/queries";
import type { CandidateCurrentAssignmentUi } from "@/lib/placements/types";
import { listCandidateStructuredSkillsForUi, listSkillsForVacancyForm } from "@/lib/skills/queries";
import type { CandidateStructuredSkillUi } from "@/lib/skills/types";
import { listApplicationsForCandidateUi } from "@/lib/vacancy-applications/queries";
import type { CandidateApplicationRowUi } from "@/lib/vacancy-applications/types";

import { OptionalClientSectionBoundary } from "@/components/optional-client-section-boundary";
import { CandidateAvailabilityBadge } from "../_components/candidate-availability-badge";
import { CandidateEditDialog } from "../_components/candidate-edit-dialog";
import { CandidateApplicationsSection } from "./_components/candidate-applications-section";
import { CandidateCvDownloadButton } from "./_components/candidate-cv-download-button";
import { CandidateCvFileSection } from "./_components/candidate-cv-file-section";
import { CandidateWhatsAppButton } from "./_components/candidate-whatsapp-button";
import { CandidateCurrentAssignmentSection } from "./_components/candidate-current-assignment-section";
import { CandidateStructuredSkillsSection } from "./_components/candidate-structured-skills-section";
import { CandidateVacancyMatchesSection } from "./_components/candidate-vacancy-matches-section";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const isDirector = session?.user?.role === "DIRECTOR";

  const [
    candidate,
    vacancyMatches,
    currentAssignment,
    structuredSkills,
    applications,
    editData,
    skillsCatalog,
    cvFileInfo,
  ] = await Promise.all([
    getCandidateByIdForUi(id),
    listMatchesForCandidateUi(id),
    getCurrentAssignmentForCandidateUi(id),
    listCandidateStructuredSkillsForUi(id),
    listApplicationsForCandidateUi(id),
    canManage ? getCandidateEditData(id) : Promise.resolve(null),
    canManage ? listSkillsForVacancyForm() : Promise.resolve([]),
    canManage ? getCandidateCvFileInfo(id) : Promise.resolve(null),
  ]);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/candidates"
        backLabel="Volver a candidatos"
        title={candidate.displayName}
        description="Perfil de talento, skills estructurados, postulaciones y matches deterministas con vacantes."
        meta={<CandidateAvailabilityBadge status={candidate.availabilityStatus} />}
        actions={
          <div className="flex items-center gap-2">
            {candidate.phone ? (
              <CandidateWhatsAppButton phone={candidate.phone} />
            ) : null}
            <CandidateCvDownloadButton candidateId={id} />
            {canManage && editData ? (
              <CandidateEditDialog candidate={editData} skillsCatalog={skillsCatalog} />
            ) : null}
          </div>
        }
      />

      <DetailGrid
        items={[
          { label: "Rol", value: candidate.role },
          { label: "Senioridad", value: candidate.seniority },
          { label: "Empresa actual", value: candidate.currentCompany },
          { label: "Correo", value: candidate.email },
          { label: "Teléfono", value: candidate.phone },
        ]}
      />

      <CandidateStructuredSkillsSection
        skills={structuredSkills}
        legacySkillsLine={candidate.skills}
      />

      <SectionCard
        title="Notas"
        description="Contexto interno, preferencias y notas de evaluación."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">{candidate.notes}</p>
      </SectionCard>

      {canManage ? (
        <SectionCard
          title="CV original"
          description="Archivo CV subido por el equipo de reclutamiento."
        >
          <OptionalClientSectionBoundary
            fallback={
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el bloque de CV original.
              </p>
            }
          >
            <CandidateCvFileSection
              candidateId={id}
              cvFileName={cvFileInfo?.cvFileName ?? null}
              cvUploadedAt={cvFileInfo?.cvUploadedAt ?? null}
              canUpload={canManage}
              canDelete={isDirector}
            />
          </OptionalClientSectionBoundary>
        </SectionCard>
      ) : null}

      <CandidateCurrentAssignmentSection assignment={currentAssignment} />

      <CandidateApplicationsSection applications={applications} />

      <CandidateVacancyMatchesSection matches={vacancyMatches} />

      <PlaceholderSection
        title="Actividad"
        description="Postulaciones, entrevistas e historial de colocación."
      />
    </div>
  );
}
