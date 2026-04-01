export type PlacementStatusUi = "Active" | "Completed" | "Cancelled";

/** Row for company list, /active-employees, etc. */
export type PlacementListRowUi = {
  id: string;
  candidateId: string;
  candidateName: string;
  companyId: string;
  companyName: string;
  vacancyId: string;
  vacancyTitle: string;
  startDateLabel: string;
  status: PlacementStatusUi;
  /** ISO yyyy-mm-dd for edit forms. */
  startDateValue: string;
  endDateValue: string | null;
  /** Prisma enum value for edit defaults. */
  statusValue: "ACTIVE" | "COMPLETED" | "CANCELLED";
  rateClientAmount: number | null;
  rateCandidateAmount: number | null;
};

export type CandidateCurrentAssignmentUi = {
  placementId: string;
  companyId: string;
  companyName: string;
  vacancyId: string;
  vacancyTitle: string;
  startDateLabel: string;
  endDateLabel: string | null;
  status: PlacementStatusUi;
};
