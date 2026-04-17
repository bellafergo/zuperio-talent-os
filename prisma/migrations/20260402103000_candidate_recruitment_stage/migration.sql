-- CreateEnum
CREATE TYPE "CandidateRecruitmentStage" AS ENUM (
  'NUEVO',
  'CONTACTADO',
  'ENTREVISTA',
  'PERFIL_ENVIADO',
  'NEGOCIACION',
  'COLOCADO',
  'DESCARTADO'
);

-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN "recruitmentStage" "CandidateRecruitmentStage" NOT NULL DEFAULT 'NUEVO';
