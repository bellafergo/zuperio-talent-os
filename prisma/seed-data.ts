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

export type SeedOpportunityStage =
  | "PROSPECTING"
  | "QUALIFICATION"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type SeedOpportunity = {
  id: string;
  title: string;
  stage: SeedOpportunityStage;
  /** Major currency units (e.g. EUR). */
  value: number;
  currency?: string;
  companyId: string;
  ownerEmail: string;
};

export const SEED_OPPORTUNITIES: SeedOpportunity[] = [
  {
    id: "opp_1",
    title: "National logistics retainer — Acme",
    stage: "NEGOTIATION",
    value: 420000,
    companyId: "1",
    ownerEmail: "fernanda.costa@zuperio.internal",
  },
  {
    id: "opp_2",
    title: "Iberia retail expansion",
    stage: "QUALIFICATION",
    value: 185000,
    companyId: "2",
    ownerEmail: "joao.silva@zuperio.internal",
  },
  {
    id: "opp_3",
    title: "Healthcare analytics pilot",
    stage: "PROPOSAL",
    value: 96000,
    companyId: "3",
    ownerEmail: "fernanda.costa@zuperio.internal",
  },
  {
    id: "opp_4",
    title: "Cloud migration phase 2",
    stage: "PROSPECTING",
    value: 310000,
    companyId: "4",
    ownerEmail: "maria.santos@zuperio.internal",
  },
  {
    id: "opp_5",
    title: "Compliance automation suite",
    stage: "CLOSED_WON",
    value: 275000,
    companyId: "5",
    ownerEmail: "joao.silva@zuperio.internal",
  },
  {
    id: "opp_6",
    title: "Manufacturing workforce program",
    stage: "QUALIFICATION",
    value: 142000,
    companyId: "6",
    ownerEmail: "maria.santos@zuperio.internal",
  },
  {
    id: "opp_7",
    title: "Toy category relaunch consulting",
    stage: "CLOSED_LOST",
    value: 48000,
    companyId: "7",
    ownerEmail: "fernanda.costa@zuperio.internal",
  },
  {
    id: "opp_8",
    title: "R&D platform subscription",
    stage: "PROPOSAL",
    value: 198000,
    companyId: "8",
    ownerEmail: "joao.silva@zuperio.internal",
  },
  {
    id: "opp_9",
    title: "Private-label sourcing deal",
    stage: "NEGOTIATION",
    value: 88000,
    currency: "EUR",
    companyId: "9",
    ownerEmail: "maria.santos@zuperio.internal",
  },
  {
    id: "opp_10",
    title: "Energy HR shared services",
    stage: "PROSPECTING",
    value: 520000,
    currency: "USD",
    companyId: "10",
    ownerEmail: "joao.silva@zuperio.internal",
  },
  {
    id: "opp_11",
    title: "Acme — customs integration",
    stage: "QUALIFICATION",
    value: 67000,
    companyId: "1",
    ownerEmail: "maria.santos@zuperio.internal",
  },
  {
    id: "opp_12",
    title: "Contoso — data residency review",
    stage: "PROPOSAL",
    value: 54000,
    companyId: "3",
    ownerEmail: "joao.silva@zuperio.internal",
  },
];

export type SeedVacancySeniority =
  | "INTERN"
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD"
  | "PRINCIPAL";

export type SeedVacancyStatus =
  | "DRAFT"
  | "OPEN"
  | "ON_HOLD"
  | "SOURCING"
  | "INTERVIEWING"
  | "FILLED"
  | "CANCELLED";

export type SeedVacancy = {
  id: string;
  title: string;
  seniority: SeedVacancySeniority;
  status: SeedVacancyStatus;
  targetRate: number;
  currency?: string;
  opportunityId: string;
};

/** Roles tied to seeded opportunities (`opportunityId` matches `SEED_OPPORTUNITIES.id`). */
export const SEED_VACANCIES: SeedVacancy[] = [
  {
    id: "vac_1",
    title: "Senior Logistics Engineer",
    seniority: "SENIOR",
    status: "INTERVIEWING",
    targetRate: 95,
    opportunityId: "opp_1",
  },
  {
    id: "vac_2",
    title: "Operations Analyst",
    seniority: "JUNIOR",
    status: "OPEN",
    targetRate: 52,
    opportunityId: "opp_1",
  },
  {
    id: "vac_3",
    title: "Retail Program Manager",
    seniority: "LEAD",
    status: "SOURCING",
    targetRate: 110,
    opportunityId: "opp_2",
  },
  {
    id: "vac_4",
    title: "Healthcare Data Engineer",
    seniority: "MID",
    status: "OPEN",
    targetRate: 88,
    opportunityId: "opp_3",
  },
  {
    id: "vac_5",
    title: "Clinical SME (part-time)",
    seniority: "PRINCIPAL",
    status: "ON_HOLD",
    targetRate: 140,
    opportunityId: "opp_3",
  },
  {
    id: "vac_6",
    title: "Cloud Platform Engineer",
    seniority: "SENIOR",
    status: "OPEN",
    targetRate: 102,
    opportunityId: "opp_4",
  },
  {
    id: "vac_7",
    title: "Compliance Automation Developer",
    seniority: "MID",
    status: "FILLED",
    targetRate: 79,
    opportunityId: "opp_5",
  },
  {
    id: "vac_8",
    title: "Manufacturing HR Partner",
    seniority: "MID",
    status: "INTERVIEWING",
    targetRate: 68,
    opportunityId: "opp_6",
  },
  {
    id: "vac_9",
    title: "Merchandising Coordinator",
    seniority: "JUNIOR",
    status: "CANCELLED",
    targetRate: 45,
    opportunityId: "opp_7",
  },
  {
    id: "vac_10",
    title: "Full-stack Engineer (R&D tools)",
    seniority: "SENIOR",
    status: "OPEN",
    targetRate: 98,
    opportunityId: "opp_8",
  },
  {
    id: "vac_11",
    title: "Supply Chain Analyst",
    seniority: "MID",
    status: "SOURCING",
    targetRate: 72,
    opportunityId: "opp_9",
  },
  {
    id: "vac_12",
    title: "Energy — Payroll Specialist",
    seniority: "MID",
    status: "OPEN",
    targetRate: 65,
    currency: "USD",
    opportunityId: "opp_10",
  },
  {
    id: "vac_13",
    title: "Customs Integration Developer",
    seniority: "SENIOR",
    status: "DRAFT",
    targetRate: 91,
    opportunityId: "opp_11",
  },
  {
    id: "vac_14",
    title: "Security & Residency Consultant",
    seniority: "LEAD",
    status: "OPEN",
    targetRate: 125,
    opportunityId: "opp_12",
  },
];

export type SeedCandidateAvailability =
  | "AVAILABLE"
  | "IN_PROCESS"
  | "ASSIGNED"
  | "NOT_AVAILABLE";

export type SeedCandidateSeniority = SeedVacancySeniority;

export type SeedCandidate = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: string;
  seniority: SeedCandidateSeniority;
  skills: string;
  availabilityStatus: SeedCandidateAvailability;
  currentCompany?: string;
  notes?: string;
};

export const SEED_CANDIDATES: SeedCandidate[] = [
  {
    id: "cand_1",
    firstName: "Ricardo",
    lastName: "Sousa",
    email: "ricardo.sousa@talent.example",
    phone: "+351 910 100 201",
    role: "Senior Backend Engineer",
    seniority: "SENIOR",
    skills: "Java, Spring Boot, PostgreSQL, Kafka, Docker",
    availabilityStatus: "IN_PROCESS",
    currentCompany: "TechPartner Lda",
    notes: "Strong logistics domain; open to hybrid in Lisbon.",
  },
  {
    id: "cand_2",
    firstName: "Sofia",
    lastName: "Martins",
    email: "sofia.martins@talent.example",
    role: "Frontend Developer",
    seniority: "MID",
    skills: "React, TypeScript, Next.js, Tailwind CSS, Jest",
    availabilityStatus: "AVAILABLE",
    notes: "Prefer product teams; EU remote.",
  },
  {
    id: "cand_3",
    firstName: "Miguel",
    lastName: "Torres",
    email: "miguel.torres@talent.example",
    role: "QA Automation Engineer",
    seniority: "MID",
    skills: "Selenium, Cypress, Java, REST APIs, CI/CD",
    availabilityStatus: "AVAILABLE",
    currentCompany: "QA Works Remote",
  },
  {
    id: "cand_4",
    firstName: "Laura",
    lastName: "Schmidt",
    email: "laura.schmidt@talent.example",
    phone: "+49 170 2200330",
    role: "Technical Program Manager",
    seniority: "LEAD",
    skills: "Agile, Jira, Stakeholder management, Cloud programs, Risk",
    availabilityStatus: "ASSIGNED",
    currentCompany: "Northwind Partner",
    notes: "Assignment ends Q3; book early for retail programs.",
  },
  {
    id: "cand_5",
    firstName: "André",
    lastName: "Pinto",
    email: "andre.pinto@talent.example",
    role: "Data Engineer",
    seniority: "SENIOR",
    skills: "SQL, dbt, Python, Airflow, Snowflake, BigQuery",
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "cand_6",
    firstName: "Yuki",
    lastName: "Tanaka",
    email: "yuki.tanaka@talent.example",
    role: "Full-stack Engineer",
    seniority: "SENIOR",
    skills: "Node.js, React, GraphQL, AWS, PostgreSQL",
    availabilityStatus: "IN_PROCESS",
    currentCompany: "Fabrikam Alumni",
  },
  {
    id: "cand_7",
    firstName: "Clara",
    lastName: "Ibáñez",
    email: "clara.ibanez@talent.example",
    role: "Junior Frontend Developer",
    seniority: "JUNIOR",
    skills: "React, JavaScript, HTML, CSS, Git",
    availabilityStatus: "AVAILABLE",
    notes: "Bootcamp graduate; eager on design systems.",
  },
  {
    id: "cand_8",
    firstName: "Oliver",
    lastName: "Berg",
    email: "oliver.berg@talent.example",
    phone: "+46 70 440 8899",
    role: "Principal Software Architect",
    seniority: "PRINCIPAL",
    skills: "Java, Kotlin, Microservices, Kubernetes, Event-driven design",
    availabilityStatus: "NOT_AVAILABLE",
    currentCompany: "Enterprise Hold Co",
    notes: "Not taking new mandates until next year.",
  },
  {
    id: "cand_9",
    firstName: "Beatriz",
    lastName: "Nunes",
    email: "beatriz.nunes@talent.example",
    role: "Product Manager",
    seniority: "MID",
    skills: "Roadmaps, Discovery, Analytics, SQL, Figma",
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "cand_10",
    firstName: "James",
    lastName: "Okafor",
    email: "james.okafor@talent.example",
    role: "DevOps Engineer",
    seniority: "SENIOR",
    skills: "Kubernetes, Terraform, GitHub Actions, AWS, Prometheus",
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "cand_11",
    firstName: "Helena",
    lastName: "Costa",
    email: "helena.costa@talent.example",
    role: "Data Analyst",
    seniority: "JUNIOR",
    skills: "SQL, Excel, Looker, Python, Statistics",
    availabilityStatus: "IN_PROCESS",
  },
  {
    id: "cand_12",
    firstName: "Pablo",
    lastName: "Romero",
    email: "pablo.romero@talent.example",
    role: "Mobile Engineer",
    seniority: "MID",
    skills: "React Native, Swift, Kotlin, Firebase",
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "cand_13",
    firstName: "Emma",
    lastName: "Lindqvist",
    email: "emma.lindqvist@talent.example",
    phone: "+46 76 900 1122",
    role: "Engineering Manager",
    seniority: "LEAD",
    skills: "People leadership, Hiring, Java, Cloud, OKRs",
    availabilityStatus: "AVAILABLE",
    notes: "Open to interim EM roles (3–6 months).",
  },
  {
    id: "cand_14",
    firstName: "Diogo",
    lastName: "Ferreira",
    email: "diogo.ferreira@talent.example",
    role: "Intern — Software",
    seniority: "INTERN",
    skills: "Python, Git, REST basics, Linux",
    availabilityStatus: "AVAILABLE",
    notes: "University final year; part-time possible.",
  },
];
