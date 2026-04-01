export type ContactStatusUi = "Activo" | "Inactivo";

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
  /** Contact row `updatedAt` (also moves when primaries sync from methods). */
  updatedAtLabel: string;
};

export type ContactMethodTypeUi =
  | "Teléfono"
  | "Correo"
  | "WhatsApp"
  | "LinkedIn";

export type ContactMethodRowUi = {
  id: string;
  type: ContactMethodTypeUi;
  typeValue: "PHONE" | "EMAIL" | "WHATSAPP" | "LINKEDIN";
  value: string;
  label: string | null;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
  createdAtLabel: string;
  createdByLabel: string;
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
