export type OpportunityStageUi =
  | "Prospección"
  | "Calificación"
  | "Propuesta"
  | "Negociación"
  | "Cerrada ganada"
  | "Cerrada perdida";

export type OpportunityListRow = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  ownerId: string | null;
  ownerName: string;
  stage: OpportunityStageUi;
  /** Prisma enum value for form defaults. */
  stageValue: "PROSPECTING" | "QUALIFICATION" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";
  valueLabel: string;
  valueAmount: number | null;
  currency: string;
  updatedAtLabel: string;
};

export type OpportunityFilterState = {
  query: string;
  stage: string;
  companyId: string;
  ownerId: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type OwnerOption = {
  id: string;
  name: string;
};
