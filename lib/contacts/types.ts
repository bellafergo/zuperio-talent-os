export type ContactStatusUi = "Active" | "Inactive";

export type ContactListRow = {
  id: string;
  displayName: string;
  title: string;
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  status: ContactStatusUi;
};

export type ContactFilterState = {
  query: string;
  status: string;
  companyId: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};
