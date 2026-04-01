/**
 * Seed definitions for Companies (and owning Users).
 * Matches the former UI mock list for stable IDs and URLs (`/companies/1`, etc.).
 */

export const SEED_USERS = [
  {
    id: "usr_seed_fernanda",
    email: "fernanda.costa@zuperio.internal",
    name: "Fernanda Costa",
  },
  {
    id: "usr_seed_joao",
    email: "joao.silva@zuperio.internal",
    name: "João Silva",
  },
  {
    id: "usr_seed_maria",
    email: "maria.santos@zuperio.internal",
    name: "Maria Santos",
  },
] as const;

export type SeedCompanyStatus =
  | "ACTIVE"
  | "PROSPECT"
  | "PAUSED"
  | "CHURNED";

export type SeedCompany = {
  id: string;
  name: string;
  industry: string;
  location: string;
  status: SeedCompanyStatus;
  ownerEmail: string;
};

export const SEED_COMPANIES: SeedCompany[] = [
  {
    id: "1",
    name: "Acme Logistics",
    industry: "Transportation",
    location: "São Paulo, BR",
    ownerEmail: "fernanda.costa@zuperio.internal",
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Northwind Trading",
    industry: "Retail",
    location: "Porto, PT",
    ownerEmail: "joao.silva@zuperio.internal",
    status: "PROSPECT",
  },
  {
    id: "3",
    name: "Contoso Health",
    industry: "Healthcare",
    location: "Lisbon, PT",
    ownerEmail: "fernanda.costa@zuperio.internal",
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Fabrikam Tech",
    industry: "Technology",
    location: "Remote",
    ownerEmail: "maria.santos@zuperio.internal",
    status: "PAUSED",
  },
  {
    id: "5",
    name: "Wide World Insurance",
    industry: "Financial services",
    location: "Madrid, ES",
    ownerEmail: "joao.silva@zuperio.internal",
    status: "ACTIVE",
  },
  {
    id: "6",
    name: "Adventure Works",
    industry: "Manufacturing",
    location: "Curitiba, BR",
    ownerEmail: "maria.santos@zuperio.internal",
    status: "PROSPECT",
  },
  {
    id: "7",
    name: "Tailspin Toys",
    industry: "Retail",
    location: "Barcelona, ES",
    ownerEmail: "fernanda.costa@zuperio.internal",
    status: "CHURNED",
  },
  {
    id: "8",
    name: "Litware Labs",
    industry: "Technology",
    location: "Berlin, DE",
    ownerEmail: "joao.silva@zuperio.internal",
    status: "ACTIVE",
  },
  {
    id: "9",
    name: "Blue Yonder Foods",
    industry: "Consumer goods",
    location: "Lisbon, PT",
    ownerEmail: "maria.santos@zuperio.internal",
    status: "PROSPECT",
  },
  {
    id: "10",
    name: "Southridge Energy",
    industry: "Energy",
    location: "Houston, US",
    ownerEmail: "joao.silva@zuperio.internal",
    status: "PAUSED",
  },
];

export type SeedContactStatus = "ACTIVE" | "INACTIVE";

export type SeedContact = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  status: SeedContactStatus;
  companyId: string;
};

/** People linked to seeded companies (`companyId` matches `SEED_COMPANIES.id`). */
export const SEED_CONTACTS: SeedContact[] = [
  {
    id: "ctc_1",
    firstName: "Ana",
    lastName: "Ribeiro",
    email: "ana.ribeiro@acme.example",
    phone: "+55 11 90000-1001",
    title: "Head of Operations",
    status: "ACTIVE",
    companyId: "1",
  },
  {
    id: "ctc_2",
    firstName: "Bruno",
    lastName: "Almeida",
    email: "bruno.almeida@acme.example",
    phone: "+55 11 90000-1002",
    title: "Procurement Lead",
    status: "ACTIVE",
    companyId: "1",
  },
  {
    id: "ctc_3",
    firstName: "Carla",
    lastName: "Mendes",
    email: "carla.m@northwind.example",
    phone: "+351 220 100 200",
    title: "Store Director",
    status: "ACTIVE",
    companyId: "2",
  },
  {
    id: "ctc_4",
    firstName: "Diego",
    lastName: "Fernández",
    email: "diego.fernandez@contoso-health.example",
    phone: "+351 21 300 4000",
    title: "Clinical Partnerships",
    status: "ACTIVE",
    companyId: "3",
  },
  {
    id: "ctc_5",
    firstName: "Elena",
    lastName: "Vasquez",
    email: "elena.v@contoso-health.example",
    title: "IT Manager",
    status: "INACTIVE",
    companyId: "3",
  },
  {
    id: "ctc_6",
    firstName: "Felix",
    lastName: "Keller",
    email: "felix.k@fabrikam.example",
    phone: "+49 30 2000 5500",
    title: "Engineering Director",
    status: "ACTIVE",
    companyId: "4",
  },
  {
    id: "ctc_7",
    firstName: "Gabriela",
    lastName: "Ruiz",
    email: "g.ruiz@wideworld.example",
    phone: "+34 91 400 7700",
    title: "Risk Officer",
    status: "ACTIVE",
    companyId: "5",
  },
  {
    id: "ctc_8",
    firstName: "Henrik",
    lastName: "Larsson",
    email: "henrik.larsson@adventure.example",
    phone: "+55 41 3300-8800",
    title: "Plant Manager",
    status: "ACTIVE",
    companyId: "6",
  },
  {
    id: "ctc_9",
    firstName: "Inês",
    lastName: "Correia",
    email: "ines.correia@tailspin.example",
    phone: "+34 93 500 1200",
    title: "Merchandising",
    status: "INACTIVE",
    companyId: "7",
  },
  {
    id: "ctc_10",
    firstName: "Jonas",
    lastName: "Weber",
    email: "jonas.weber@litware.example",
    phone: "+49 30 8800-3300",
    title: "Product Lead",
    status: "ACTIVE",
    companyId: "8",
  },
  {
    id: "ctc_11",
    firstName: "Kate",
    lastName: "Morgan",
    email: "kate.morgan@blueyonder.example",
    phone: "+351 21 770 0099",
    title: "Supply Chain VP",
    status: "ACTIVE",
    companyId: "9",
  },
  {
    id: "ctc_12",
    firstName: "Lucas",
    lastName: "Oliveira",
    email: "lucas.oliveira@blueyonder.example",
    title: "Quality Assurance",
    status: "ACTIVE",
    companyId: "9",
  },
  {
    id: "ctc_13",
    firstName: "Monica",
    lastName: "Reyes",
    email: "monica.reyes@southridge.example",
    phone: "+1 713 555 0140",
    title: "Head of HR",
    status: "ACTIVE",
    companyId: "10",
  },
  {
    id: "ctc_14",
    firstName: "Nina",
    lastName: "Patel",
    email: "nina.patel@southridge.example",
    title: "Facilities",
    status: "INACTIVE",
    companyId: "10",
  },
];
