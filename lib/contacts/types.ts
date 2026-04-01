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
  /** For edit forms */
  firstName: string;
  lastName: string;
  titleValue: string;
  emailValue: string;
  phoneValue: string;
  statusValue: "ACTIVE" | "INACTIVE";
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
