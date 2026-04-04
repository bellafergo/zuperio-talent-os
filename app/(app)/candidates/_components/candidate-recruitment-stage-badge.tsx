import { Badge } from "@/components/ui/badge";
import {
  CANDIDATE_RECRUITMENT_STAGE_LABELS,
} from "@/lib/candidates/constants";
import type { CandidateRecruitmentStage } from "@/generated/prisma/enums";

const variantByStage: Record<
  CandidateRecruitmentStage,
  "default" | "secondary" | "outline" | "destructive"
> = {
  NUEVO: "secondary",
  CONTACTADO: "outline",
  ENTREVISTA: "secondary",
  PERFIL_ENVIADO: "default",
  NEGOCIACION: "default",
  COLOCADO: "default",
  DESCARTADO: "destructive",
};

export function CandidateRecruitmentStageBadge({
  stage,
}: {
  stage: CandidateRecruitmentStage;
}) {
  const variant = variantByStage[stage] ?? "outline";
  const text = CANDIDATE_RECRUITMENT_STAGE_LABELS[stage] ?? "Nuevo";
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {text}
    </Badge>
  );
}
