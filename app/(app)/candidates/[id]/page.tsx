import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import type { ProposalFormDefaults } from "@/app/(app)/proposals/_components/proposal-record-form-fields";
import { canManageCandidates } from "@/lib/auth/candidate-access";
import { canManageProposals } from "@/lib/auth/proposal-access";
import type { CandidateUi } from "@/lib/candidates/types";
import { getCandidateCvPrintData } from "@/lib/candidates/get-candidate-cv-print-data";
import { getCandidateByIdForUi, getCandidateEditData, getCandidateCvFileInfo } from "@/lib/candidates/queries";
import type { CandidateMatchRowUi } from "@/lib/matching/types";
import { listMatchesForCandidateUi } from "@/lib/matching/queries";
import { getCurrentAssignmentForCandidateUi } from "@/lib/placements/queries";
import type { CandidateCurrentAssignmentUi } from "@/lib/placements/types";
import { listCandidateStructuredSkillsForUi, listSkillsForVacancyForm } from "@/lib/skills/queries";
import type { CandidateStructuredSkillUi } from "@/lib/skills/types";
import { listApplicationsForCandidateUi } from "@/lib/vacancy-applications/queries";
import type { CandidateApplicationRowUi } from "@/lib/vacancy-applications/types";
import { listCandidateParticipatingVacanciesUi } from "@/lib/candidates/participating-vacancies-queries";

import { isAnthropicConfigured } from "@/lib/ai/anthropic";
import {
  getVacancyTemplateContext,
  type VacancyTemplateContext,
} from "@/lib/interviews/vacancy-template-context";

import { OptionalClientSectionBoundary } from "@/components/optional-client-section-boundary";
import { CandidateCvAiHighlight } from "../_components/candidate-cv-ai-highlight";
import { CandidateInterviewQuestions } from "../_components/candidate-interview-questions";
import { CandidateAvailabilityBadge } from "../_components/candidate-availability-badge";
import { CandidateRecruitmentStageBadge } from "../_components/candidate-recruitment-stage-badge";
import { CandidateEditDialog } from "../_components/candidate-edit-dialog";
import { CandidateApplicationsSection } from "./_components/candidate-applications-section";
import { CandidateCvDownloadButton } from "./_components/candidate-cv-download-button";
import { CandidateCvFileSection } from "./_components/candidate-cv-file-section";
import { CandidateWhatsAppButton } from "./_components/candidate-whatsapp-button";
import { CandidateCurrentAssignmentSection } from "./_components/candidate-current-assignment-section";
import { CandidateStructuredSkillsSection } from "./_components/candidate-structured-skills-section";
import { CandidateDetailProposalProvider } from "./_components/candidate-detail-proposal-context";
import { CandidateDetailNewProposalButton } from "./_components/candidate-detail-new-proposal-button";
import { CandidateParticipatingVacanciesSection } from "./_components/candidate-participating-vacancies-section";
import { CandidateSuggestedActions } from "./_components/candidate-suggested-actions";
import { CandidateVacancyMatchesSection } from "./_components/candidate-vacancy-matches-section";
import { CandidateZuperioCvPreviewSection } from "./_components/candidate-zuperio-cv-preview-section";
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
import {
  listOpenVacanciesForCandidateForm,
  type OpenVacancyOptionForCandidateForm,
} from "@/lib/vacancies/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

function isPrismaClientValidationError(err: unknown): boolean {
  return err instanceof Error && err.name === "PrismaClientValidationError";
}

function isPrismaMissingColumnMessage(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message;
  return (
    err.name === "PrismaClientKnownRequestError" &&
    (m.includes("does not exist") || m.includes("Column"))
  );
}

/** Core: `getCandidateByIdForUi`. Secondary queries use this wrapper so one failure does not abort the route. */
async function safeCandidateSecondaryFetch<T>(
  label: string,
  promise: Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (isPrismaClientValidationError(err) || isPrismaMissingColumnMessage(err)) {
      console.warn(
        `[candidates/detail] ${label} omitido (cliente Prisma o BD desalineados). \`npx prisma generate\`, migraciones y reiniciar dev.`,
      );
    } else {
      console.error(`[candidates/detail] ${label} failed`, err);
    }
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
    participatingVacancies,
    editData,
    skillsCatalog,
    cvFileInfo,
    proposalCompanies,
    proposalOpportunities,
    proposalVacancies,
    proposalCandidates,
    proposalPrefill,
    openVacanciesForm,
    cvPrintData,
    pipelineVacancyInterviewCtx,
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
    safeCandidateSecondaryFetch(
      "listCandidateParticipatingVacanciesUi",
      listCandidateParticipatingVacanciesUi(id, candidate.pipelineVacancyId),
      [],
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
    canManage
      ? safeCandidateSecondaryFetch(
          "listOpenVacanciesForCandidateForm",
          listOpenVacanciesForCandidateForm(),
          [] as OpenVacancyOptionForCandidateForm[],
        )
      : Promise.resolve([] as OpenVacancyOptionForCandidateForm[]),
    safeCandidateSecondaryFetch(
      "getCandidateCvPrintData",
      getCandidateCvPrintData(id),
      null,
    ),
    candidate.pipelineVacancyId?.trim()
      ? safeCandidateSecondaryFetch(
          "getVacancyTemplateContext",
          getVacancyTemplateContext(candidate.pipelineVacancyId.trim()),
          null as VacancyTemplateContext | null,
        )
      : Promise.resolve(null as VacancyTemplateContext | null),
  ]);

  const headerTitle = safeDetailLine(candidate.displayName);
  const title = headerTitle !== "—" ? headerTitle : "Candidato";

  // AI features — cv text from editData (managers only); pipeline vacancy title from participatingVacancies
  const aiConfigured = isAnthropicConfigured();
  const cvTextForAi = editData?.cvWorkExperienceText?.trim() || editData?.cvRawText?.trim() || null;
  const pipelineVacancyTitle =
    candidate.pipelineVacancyId
      ? (participatingVacancies.find((v) => v.vacancyId === candidate.pipelineVacancyId)?.title ?? null)
      : null;

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
    <CandidateDetailProposalProvider
      canProposals={canProposals}
      companies={proposalCompanies}
      opportunities={proposalOpportunities}
      vacancies={proposalVacancies}
      candidates={proposalCandidates}
      formDefaultsPartial={proposalQuickCreatePartial}
    >
      <div className="space-y-8">
        <PageHeader
          variant="detail"
          backHref="/candidates"
          backLabel="Volver a candidatos"
          title={title}
          description="Perfil de talento, skills estructurados, postulaciones y matches deterministas con vacantes."
          meta={
            <CandidateAvailabilityBadge
              status={candidate.availabilityStatus}
              label={candidate.availabilityBadgeLabel}
            />
          }
          actions={
            <div className="flex items-center gap-2">
              {candidate.phone && safeDetailLine(candidate.phone) !== "—" ? (
                <CandidateWhatsAppButton phone={candidate.phone} />
              ) : null}
              <CandidateCvDownloadButton candidateId={id} />
              {canProposals ? <CandidateDetailNewProposalButton /> : null}
              {canManage && editData ? (
                <CandidateEditDialog
                  candidate={editData}
                  skillsCatalog={skillsCatalog}
                  openVacancies={openVacanciesForm}
                />
              ) : null}
            </div>
          }
        />

      <OptionalClientSectionBoundary
        fallback={
          <p className="text-sm text-muted-foreground">
            No se pudo cargar el bloque de acciones sugeridas.
          </p>
        }
      >
        <CandidateSuggestedActions
          canManage={canManage}
          hasEditData={Boolean(editData)}
          hasCvFile={Boolean(cvFileInfo?.cvFileName?.trim())}
          pipelineVacancyId={candidate.pipelineVacancyId}
          availabilityStatus={candidate.availabilityStatus}
        />
      </OptionalClientSectionBoundary>

      <div id="candidate-section-reclutamiento">
        <SectionCard
          title="Disponibilidad y contexto de reclutamiento"
          description="Cómo está catalogado el candidato para priorización comercial y seguimiento."
        >
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div className="space-y-2">
              <dt className="text-xs font-medium text-muted-foreground">Disponibilidad</dt>
              <dd className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <CandidateAvailabilityBadge
                  status={candidate.availabilityStatus}
                  label={candidate.availabilityBadgeLabel}
                />
                <span className="text-muted-foreground">
                  {safeDetailLine(candidate.availabilityBadgeLabel)}
                </span>
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Etapa del proceso
              </dt>
              <dd>
                <CandidateRecruitmentStageBadge stage={candidate.recruitmentStage} />
              </dd>
            </div>
            <div className="space-y-2">
              <dt className="text-xs font-medium text-muted-foreground">
                Contexto de reclutamiento
              </dt>
              <dd className="text-foreground">
                {safeDetailLine(candidate.pipelineContextLabel)}
              </dd>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <dt className="text-xs font-medium text-muted-foreground">Vacante vinculada</dt>
              <dd className="text-muted-foreground leading-relaxed">
                {candidate.recruitingVacancyDetailLine}
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>

      <DetailGrid
        items={[
          { label: "Rol", value: safeDetailLine(candidate.role) },
          { label: "Senioridad", value: safeDetailLine(candidate.seniority) },
          { label: "Empresa actual", value: safeDetailLine(candidate.currentCompany) },
          { label: "Correo", value: safeDetailLine(candidate.email) },
          { label: "Teléfono", value: safeDetailLine(candidate.phone) },
        ]}
      />

      <CandidateZuperioCvPreviewSection
        candidateId={id}
        cvPrintData={cvPrintData}
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
        <div id="candidate-section-cv">
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
        </div>
      ) : null}

      {canManage && candidate.pipelineVacancyId ? (
        <CandidateCvAiHighlight
          candidateId={id}
          vacancyId={candidate.pipelineVacancyId}
          vacancyTitle={pipelineVacancyTitle}
          cvRawText={cvTextForAi}
          aiConfigured={aiConfigured}
        />
      ) : null}

      <CandidateCurrentAssignmentSection assignment={currentAssignment} />

      <CandidateApplicationsSection applications={applications} />

      <CandidateParticipatingVacanciesSection rows={participatingVacancies} />

      <CandidateVacancyMatchesSection matches={vacancyMatches} />

      <CandidateInterviewQuestions
        candidateId={id}
        vacancyId={candidate.pipelineVacancyId}
        vacancyTitle={pipelineVacancyInterviewCtx?.title ?? pipelineVacancyTitle}
        candidateRole={candidate.role ?? ""}
        vacancySkillsLine={pipelineVacancyInterviewCtx?.skillsLine ?? null}
        vacancyRoleSummary={pipelineVacancyInterviewCtx?.roleSummary ?? null}
        vacancySeniority={pipelineVacancyInterviewCtx?.seniority ?? null}
        vacancyRequirementNames={pipelineVacancyInterviewCtx?.requirementNamesLine ?? null}
        cvRawText={cvTextForAi}
        aiConfigured={aiConfigured}
      />

      <PlaceholderSection
        title="Actividad"
        description="Postulaciones, entrevistas e historial de colocación."
      />
      </div>
    </CandidateDetailProposalProvider>
  );
}
