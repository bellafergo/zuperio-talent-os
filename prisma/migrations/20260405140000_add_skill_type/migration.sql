-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('TECHNOLOGY', 'METHODOLOGY');

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN "skillType" "SkillType" NOT NULL DEFAULT 'TECHNOLOGY';

-- Classify existing rows by canonical category (category string unchanged).
UPDATE "Skill" SET "skillType" = 'METHODOLOGY' WHERE "category" IN (
  'Project Management & Metodologías',
  'Gestión de Procesos (BPM)',
  'Soft Skills Técnicos',
  'ITSM & Operaciones'
);

-- CreateIndex
CREATE INDEX "Skill_skillType_idx" ON "Skill"("skillType");
