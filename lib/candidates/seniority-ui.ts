import type { VacancySeniority } from "@/generated/prisma/enums";

const LABELS: Record<VacancySeniority, string> = {
  INTERN: "Intern",
  JUNIOR: "Junior",
  MID: "Mid-level",
  SENIOR: "Senior",
  LEAD: "Lead",
  PRINCIPAL: "Principal",
};

export function vacancySeniorityLabel(s: VacancySeniority): string {
  return LABELS[s] ?? s;
}
