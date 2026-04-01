export type OpportunityStageUi =
  | "Prospecting"
  | "Qualification"
  | "Proposal"
  | "Negotiation"
  | "Closed won"
  | "Closed lost";

export type OpportunityListRow = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  ownerId: string | null;
  ownerName: string;
  stage: OpportunityStageUi;
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
