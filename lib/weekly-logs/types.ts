export type WeeklyLogStatusUi = "Draft" | "Submitted" | "Approved" | "Returned";

export type WeeklyLogListRowUi = {
  id: string;
  placementId: string;
  candidateName: string;
  companyName: string;
  vacancyTitle: string;
  weekLabel: string;
  weekStartValue: string;
  weekEndValue: string;
  status: WeeklyLogStatusUi;
  statusValue: "DRAFT" | "SUBMITTED" | "APPROVED" | "RETURNED";
  hoursTotalAmount: number | null;
  summary: string | null;
  achievements: string | null;
  blockers: string | null;
};

export type WeeklyLogPlacementOption = {
  id: string;
  candidateName: string;
  companyName: string;
  vacancyTitle: string;
};

