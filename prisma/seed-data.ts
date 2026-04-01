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
