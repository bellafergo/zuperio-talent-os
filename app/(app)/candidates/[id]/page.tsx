import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { ProposalsNewProposalDialog } from "@/app/(app)/proposals/_components/proposals-new-proposal-dialog";
import type { ProposalFormDefaults } from "@/app/(app)/proposals/_components/proposal-record-form-fields";
import { Button } from "@/components/ui/button";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { canManageProposals } from "@/lib/auth/proposal-access";
import type { CandidateUi } from "@/lib/candidates/types";
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
import {
  getProposalQuickCreatePrefillForCandidate,
  listCandidatesForProposalForm,
  listCompaniesForProposalForm,
  listOpportunitiesForProposalForm,
  listVacanciesForProposalForm,
  type ProposalQuickCreatePrefill,
} from "@/lib/proposals/queries";
import type {
  ProposalCandidateOption,
  ProposalCompanyOption,
  ProposalOpportunityOption,
  ProposalVacancyOption,
} from "@/lib/proposals/types";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Core: `getCandidateByIdForUi`. Secondary queries use this wrapper so one failure does not abort the route. */
async function safeCandidateSecondaryFetch<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    console.error(`[candidates/detail] ${label} failed`, err);
    return fallback;
  }
}

function safeDetailLine(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "—";
}

const emptyProposalQuickCreatePrefill: ProposalQuickCreatePrefill = {
  companyId: null,
  opportunityId: null,
  vacancyId: null,
  vacancyTitle: null,
};

function buildCandidateProposalProfileSummary(
  candidate: CandidateUi,
  vacancyTitle: string | null,
): string {
  const name = candidate.displayName?.trim();
  const role = candidate.role?.trim();
  const seniority = `${candidate.seniority}`.trim();
  const roleLine = [role, seniority].filter(Boolean).join(" · ");
  const head = [name, roleLine].filter(Boolean).join(" — ");
  const lines: string[] = [];
  if (head) lines.push(head);
  const vt = vacancyTitle?.trim();
  if (vt) lines.push(`Vacante: ${vt}`);
  return lines.join("\n");
}

export default async function CandidateDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = typeof rawId === "string" ? rawId.trim() : "";
  if (!id) {
    notFound();
  }

  const session = await auth();
  const canManage = canManageCandidates(session?.user?.role);
  const canProposals = canManageProposals(session?.user?.role);
  const isDirector = session?.user?.role === "DIRECTOR";

  const candidate = await getCandidateByIdForUi(id);
  if (!candidate) {
    notFound();
  }

  const [
    vacancyMatches,
    currentAssignment,
    structuredSkills,
    applications,
    editData,
    skillsCatalog,
    cvFileInfo,
    proposalCompanies,
    proposalOpportunities,
    proposalVacancies,
    proposalCandidates,
    proposalPrefill,
  ] = await Promise.all([
    safeCandidateSecondaryFetch(
      "listMatchesForCandidateUi",
      listMatchesForCandidateUi(id),
      [] as CandidateMatchRowUi[],
    ),
    safeCandidateSecondaryFetch(
      "getCurrentAssignmentForCandidateUi",
      getCurrentAssignmentForCandidateUi(id),
      null as CandidateCurrentAssignmentUi | null,
    ),
    safeCandidateSecondaryFetch(
      "listCandidateStructuredSkillsForUi",
      listCandidateStructuredSkillsForUi(id),
      [] as CandidateStructuredSkillUi[],
    ),
    safeCandidateSecondaryFetch(
      "listApplicationsForCandidateUi",
      listApplicationsForCandidateUi(id),
      [] as CandidateApplicationRowUi[],
    ),
    canManage
      ? safeCandidateSecondaryFetch(
          "getCandidateEditData",
          getCandidateEditData(id),
          null,
        )
      : Promise.resolve(null),
    canManage
      ? safeCandidateSecondaryFetch(
          "listSkillsForVacancyForm",
          listSkillsForVacancyForm(),
          [],
        )
      : Promise.resolve([]),
    canManage
      ? safeCandidateSecondaryFetch(
          "getCandidateCvFileInfo",
          getCandidateCvFileInfo(id),
          null,
        )
      : Promise.resolve(null),
    canProposals
      ? safeCandidateSecondaryFetch(
          "listCompaniesForProposalForm",
          listCompaniesForProposalForm(),
          [] as ProposalCompanyOption[],
        )
      : Promise.resolve([] as ProposalCompanyOption[]),
    canProposals
      ? safeCandidateSecondaryFetch(
          "listOpportunitiesForProposalForm",
          listOpportunitiesForProposalForm(),
          [] as ProposalOpportunityOption[],
        )
      : Promise.resolve([] as ProposalOpportunityOption[]),
    canProposals
      ? safeCandidateSecondaryFetch(
          "listVacanciesForProposalForm",
          listVacanciesForProposalForm(),
          [] as ProposalVacancyOption[],
        )
      : Promise.resolve([] as ProposalVacancyOption[]),
    canProposals
      ? safeCandidateSecondaryFetch(
          "listCandidatesForProposalForm",
          listCandidatesForProposalForm(),
          [] as ProposalCandidateOption[],
        )
      : Promise.resolve([] as ProposalCandidateOption[]),
    canProposals
      ? safeCandidateSecondaryFetch(
          "getProposalQuickCreatePrefillForCandidate",
          getProposalQuickCreatePrefillForCandidate(id),
          emptyProposalQuickCreatePrefill,
        )
      : Promise.resolve(emptyProposalQuickCreatePrefill),
  ]);

  const headerTitle = safeDetailLine(candidate.displayName);
  const title = headerTitle !== "—" ? headerTitle : "Candidato";

  const proposalQuickCreatePartial: Partial<ProposalFormDefaults> | undefined =
    canProposals
      ? {
          candidateId: id,
          companyId: proposalPrefill.companyId ?? "",
          opportunityId: proposalPrefill.opportunityId,
          vacancyId: proposalPrefill.vacancyId,
          profileSummary: buildCandidateProposalProfileSummary(
            candidate,
            proposalPrefill.vacancyTitle,
          ),
        }
      : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/candidates"
        backLabel="Volver a candidatos"
        title={title}
        description="Perfil de talento, skills estructurados, postulaciones y matches deterministas con vacantes."
        meta={<CandidateAvailabilityBadge status={candidate.availabilityStatus} />}
        actions={
          <div className="flex items-center gap-2">
            {candidate.phone && safeDetailLine(candidate.phone) !== "—" ? (
              <CandidateWhatsAppButton phone={candidate.phone} />
            ) : null}
            <CandidateCvDownloadButton candidateId={id} />
            {canProposals ? (
              <ProposalsNewProposalDialog
                companies={proposalCompanies}
                opportunities={proposalOpportunities}
                vacancies={proposalVacancies}
                candidates={proposalCandidates}
                formDefaultsPartial={proposalQuickCreatePartial}
                trigger={
                  <Button type="button" variant="outline" className="shrink-0">
                    Crear propuesta
                  </Button>
                }
              />
            ) : null}
            {canManage && editData ? (
              <CandidateEditDialog candidate={editData} skillsCatalog={skillsCatalog} />
            ) : null}
          </div>
        }
      />

      <DetailGrid
        items={[
          { label: "Rol", value: safeDetailLine(candidate.role) },
          { label: "Senioridad", value: safeDetailLine(candidate.seniority) },
          { label: "Empresa actual", value: safeDetailLine(candidate.currentCompany) },
          { label: "Correo", value: safeDetailLine(candidate.email) },
          { label: "Teléfono", value: safeDetailLine(candidate.phone) },
        ]}
      />

      <CandidateStructuredSkillsSection
        skills={structuredSkills}
        legacySkillsLine={
          typeof candidate.skills === "string" ? candidate.skills : ""
        }
      />

      <SectionCard
        title="Notas"
        description="Contexto interno, preferencias y notas de evaluación."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          {safeDetailLine(candidate.notes)}
        </p>
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
