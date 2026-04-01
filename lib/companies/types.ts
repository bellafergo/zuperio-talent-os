export type CompanyStatus = "Active" | "Prospect" | "Paused" | "Churned";

export type Company = {
  id: string;
  name: string;
  industry: string;
  location: string;
  owner: string;
  status: CompanyStatus;
};

export type CompanyFilterState = {
  query: string;
  status: string;
  industry: string;
  owner: string;
};
