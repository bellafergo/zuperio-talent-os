/**
 * Structured skill catalog and junction seeds (aligned with legacy free-text fields).
 */

export type SeedSkill = {
  id: string;
  name: string;
  category: string | null;
};

export const SEED_SKILLS: SeedSkill[] = [
  { id: "skill_react", name: "React", category: "Frontend" },
  { id: "skill_typescript", name: "TypeScript", category: "Frontend" },
  { id: "skill_nextjs", name: "Next.js", category: "Frontend" },
  { id: "skill_tailwind", name: "Tailwind CSS", category: "Frontend" },
  { id: "skill_javascript", name: "JavaScript", category: "Frontend" },
  { id: "skill_node", name: "Node.js", category: "Backend" },
  { id: "skill_java", name: "Java", category: "Backend" },
  { id: "skill_spring", name: "Spring Boot", category: "Backend" },
  { id: "skill_kotlin", name: "Kotlin", category: "Backend" },
  { id: "skill_graphql", name: "GraphQL", category: "Backend" },
  { id: "skill_rest", name: "REST APIs", category: "Backend" },
  { id: "skill_microservices", name: "Microservices", category: "Backend" },
  { id: "skill_sql", name: "SQL", category: "Data" },
  { id: "skill_postgres", name: "PostgreSQL", category: "Data" },
  { id: "skill_python", name: "Python", category: "Data" },
  { id: "skill_dbt", name: "dbt", category: "Data" },
  { id: "skill_airflow", name: "Airflow", category: "Data" },
  { id: "skill_snowflake", name: "Snowflake", category: "Data" },
  { id: "skill_bigquery", name: "BigQuery", category: "Data" },
  { id: "skill_excel", name: "Excel", category: "Data" },
  { id: "skill_looker", name: "Looker", category: "Data" },
  { id: "skill_aws", name: "AWS", category: "Cloud & DevOps" },
  { id: "skill_docker", name: "Docker", category: "Cloud & DevOps" },
  { id: "skill_kubernetes", name: "Kubernetes", category: "Cloud & DevOps" },
  { id: "skill_terraform", name: "Terraform", category: "Cloud & DevOps" },
  { id: "skill_kafka", name: "Kafka", category: "Cloud & DevOps" },
  { id: "skill_prometheus", name: "Prometheus", category: "Cloud & DevOps" },
  { id: "skill_cicd", name: "CI/CD", category: "Cloud & DevOps" },
  { id: "skill_git", name: "Git", category: "General" },
  { id: "skill_linux", name: "Linux", category: "General" },
  { id: "skill_selenium", name: "Selenium", category: "Quality" },
  { id: "skill_cypress", name: "Cypress", category: "Quality" },
  { id: "skill_jest", name: "Jest", category: "Quality" },
  { id: "skill_react_native", name: "React Native", category: "Mobile" },
  { id: "skill_swift", name: "Swift", category: "Mobile" },
  { id: "skill_kotlin_mobile", name: "Kotlin (mobile)", category: "Mobile" },
  { id: "skill_agile", name: "Agile", category: "Delivery" },
  { id: "skill_scrum", name: "Scrum", category: "Delivery" },
  { id: "skill_jira", name: "Jira", category: "Delivery" },
  { id: "skill_stakeholder", name: "Stakeholder management", category: "Delivery" },
  { id: "skill_risk", name: "Risk management", category: "Delivery" },
  { id: "skill_figma", name: "Figma", category: "Product" },
  { id: "skill_hl7", name: "HL7", category: "Healthcare" },
  { id: "skill_fhir", name: "FHIR", category: "Healthcare" },
  { id: "skill_regulatory", name: "Regulatory (healthcare)", category: "Healthcare" },
];

export type SeedCandidateSkill = {
  id: string;
  candidateId: string;
  skillId: string;
  yearsExperience?: number | null;
  level?: string | null;
};

export const SEED_CANDIDATE_SKILLS: SeedCandidateSkill[] = [
  // cand_1 Ricardo — Backend / logistics
  { id: "cs_1_1", candidateId: "cand_1", skillId: "skill_java", yearsExperience: 9, level: "Senior" },
  { id: "cs_1_2", candidateId: "cand_1", skillId: "skill_spring", yearsExperience: 7 },
  { id: "cs_1_3", candidateId: "cand_1", skillId: "skill_postgres", yearsExperience: 6 },
  { id: "cs_1_4", candidateId: "cand_1", skillId: "skill_kafka", yearsExperience: 4 },
  { id: "cs_1_5", candidateId: "cand_1", skillId: "skill_docker", yearsExperience: 5 },
  { id: "cs_1_6", candidateId: "cand_1", skillId: "skill_rest", yearsExperience: 8 },
  // cand_2 Sofia — Frontend
  { id: "cs_2_1", candidateId: "cand_2", skillId: "skill_react", yearsExperience: 5 },
  { id: "cs_2_2", candidateId: "cand_2", skillId: "skill_typescript", yearsExperience: 4 },
  { id: "cs_2_3", candidateId: "cand_2", skillId: "skill_nextjs", yearsExperience: 3 },
  { id: "cs_2_4", candidateId: "cand_2", skillId: "skill_tailwind", yearsExperience: 3 },
  { id: "cs_2_5", candidateId: "cand_2", skillId: "skill_jest", yearsExperience: 2 },
  // cand_3 Miguel — QA
  { id: "cs_3_1", candidateId: "cand_3", skillId: "skill_selenium", yearsExperience: 5 },
  { id: "cs_3_2", candidateId: "cand_3", skillId: "skill_cypress", yearsExperience: 3 },
  { id: "cs_3_3", candidateId: "cand_3", skillId: "skill_java", yearsExperience: 4 },
  { id: "cs_3_4", candidateId: "cand_3", skillId: "skill_rest", yearsExperience: 5 },
  { id: "cs_3_5", candidateId: "cand_3", skillId: "skill_cicd", yearsExperience: 4 },
  // cand_4 Laura — TPM
  { id: "cs_4_1", candidateId: "cand_4", skillId: "skill_agile", yearsExperience: 10, level: "Lead" },
  { id: "cs_4_2", candidateId: "cand_4", skillId: "skill_jira", yearsExperience: 10 },
  { id: "cs_4_3", candidateId: "cand_4", skillId: "skill_stakeholder", yearsExperience: 12 },
  { id: "cs_4_4", candidateId: "cand_4", skillId: "skill_aws", yearsExperience: 4 },
  { id: "cs_4_5", candidateId: "cand_4", skillId: "skill_risk", yearsExperience: 8 },
  // cand_5 André — Data engineer
  { id: "cs_5_1", candidateId: "cand_5", skillId: "skill_sql", yearsExperience: 8 },
  { id: "cs_5_2", candidateId: "cand_5", skillId: "skill_dbt", yearsExperience: 4 },
  { id: "cs_5_3", candidateId: "cand_5", skillId: "skill_python", yearsExperience: 6 },
  { id: "cs_5_4", candidateId: "cand_5", skillId: "skill_airflow", yearsExperience: 5 },
  { id: "cs_5_5", candidateId: "cand_5", skillId: "skill_snowflake", yearsExperience: 3 },
  { id: "cs_5_6", candidateId: "cand_5", skillId: "skill_bigquery", yearsExperience: 2 },
  // cand_6 Yuki — Full-stack
  { id: "cs_6_1", candidateId: "cand_6", skillId: "skill_node", yearsExperience: 7 },
  { id: "cs_6_2", candidateId: "cand_6", skillId: "skill_react", yearsExperience: 6 },
  { id: "cs_6_3", candidateId: "cand_6", skillId: "skill_graphql", yearsExperience: 4 },
  { id: "cs_6_4", candidateId: "cand_6", skillId: "skill_aws", yearsExperience: 5 },
  { id: "cs_6_5", candidateId: "cand_6", skillId: "skill_postgres", yearsExperience: 6 },
  // cand_7 Clara — Junior frontend
  { id: "cs_7_1", candidateId: "cand_7", skillId: "skill_react", yearsExperience: 1 },
  { id: "cs_7_2", candidateId: "cand_7", skillId: "skill_javascript", yearsExperience: 2 },
  { id: "cs_7_3", candidateId: "cand_7", skillId: "skill_git", yearsExperience: 1 },
  // cand_8 Oliver — Architect
  { id: "cs_8_1", candidateId: "cand_8", skillId: "skill_java", yearsExperience: 18, level: "Principal" },
  { id: "cs_8_2", candidateId: "cand_8", skillId: "skill_kotlin", yearsExperience: 6 },
  { id: "cs_8_3", candidateId: "cand_8", skillId: "skill_microservices", yearsExperience: 10 },
  { id: "cs_8_4", candidateId: "cand_8", skillId: "skill_kubernetes", yearsExperience: 7 },
  { id: "cs_8_5", candidateId: "cand_8", skillId: "skill_kafka", yearsExperience: 5 },
  // cand_9 Beatriz — PM
  { id: "cs_9_1", candidateId: "cand_9", skillId: "skill_agile", yearsExperience: 5 },
  { id: "cs_9_2", candidateId: "cand_9", skillId: "skill_sql", yearsExperience: 3 },
  { id: "cs_9_3", candidateId: "cand_9", skillId: "skill_figma", yearsExperience: 4 },
  { id: "cs_9_4", candidateId: "cand_9", skillId: "skill_jira", yearsExperience: 6 },
  // cand_10 James — DevOps
  { id: "cs_10_1", candidateId: "cand_10", skillId: "skill_kubernetes", yearsExperience: 6 },
  { id: "cs_10_2", candidateId: "cand_10", skillId: "skill_terraform", yearsExperience: 5 },
  { id: "cs_10_3", candidateId: "cand_10", skillId: "skill_cicd", yearsExperience: 7 },
  { id: "cs_10_4", candidateId: "cand_10", skillId: "skill_aws", yearsExperience: 6 },
  { id: "cs_10_5", candidateId: "cand_10", skillId: "skill_prometheus", yearsExperience: 4 },
  // cand_11 Helena — Data analyst
  { id: "cs_11_1", candidateId: "cand_11", skillId: "skill_sql", yearsExperience: 2 },
  { id: "cs_11_2", candidateId: "cand_11", skillId: "skill_excel", yearsExperience: 3 },
  { id: "cs_11_3", candidateId: "cand_11", skillId: "skill_looker", yearsExperience: 1 },
  { id: "cs_11_4", candidateId: "cand_11", skillId: "skill_python", yearsExperience: 1 },
  // cand_12 Pablo — Mobile
  { id: "cs_12_1", candidateId: "cand_12", skillId: "skill_react_native", yearsExperience: 4 },
  { id: "cs_12_2", candidateId: "cand_12", skillId: "skill_swift", yearsExperience: 3 },
  { id: "cs_12_3", candidateId: "cand_12", skillId: "skill_kotlin_mobile", yearsExperience: 2 },
  // cand_13 Emma — EM
  { id: "cs_13_1", candidateId: "cand_13", skillId: "skill_java", yearsExperience: 10 },
  { id: "cs_13_2", candidateId: "cand_13", skillId: "skill_aws", yearsExperience: 5 },
  { id: "cs_13_3", candidateId: "cand_13", skillId: "skill_agile", yearsExperience: 8 },
  { id: "cs_13_4", candidateId: "cand_13", skillId: "skill_stakeholder", yearsExperience: 9 },
  // cand_14 Diogo — Intern
  { id: "cs_14_1", candidateId: "cand_14", skillId: "skill_python", yearsExperience: 1 },
  { id: "cs_14_2", candidateId: "cand_14", skillId: "skill_git", yearsExperience: 1 },
  { id: "cs_14_3", candidateId: "cand_14", skillId: "skill_rest", yearsExperience: 1 },
  { id: "cs_14_4", candidateId: "cand_14", skillId: "skill_linux", yearsExperience: 1 },
];

export type SeedVacancyRequirement = {
  id: string;
  vacancyId: string;
  skillId: string;
  required: boolean;
  minimumYears?: number | null;
};

export const SEED_VACANCY_REQUIREMENTS: SeedVacancyRequirement[] = [
  // vac_1 Senior Logistics Engineer
  { id: "vr_1_1", vacancyId: "vac_1", skillId: "skill_java", required: true, minimumYears: 5 },
  { id: "vr_1_2", vacancyId: "vac_1", skillId: "skill_spring", required: true, minimumYears: 4 },
  { id: "vr_1_3", vacancyId: "vac_1", skillId: "skill_postgres", required: true, minimumYears: 3 },
  { id: "vr_1_4", vacancyId: "vac_1", skillId: "skill_docker", required: false },
  { id: "vr_1_5", vacancyId: "vac_1", skillId: "skill_kafka", required: false },
  // vac_2 Operations Analyst
  { id: "vr_2_1", vacancyId: "vac_2", skillId: "skill_sql", required: true },
  { id: "vr_2_2", vacancyId: "vac_2", skillId: "skill_excel", required: true },
  { id: "vr_2_3", vacancyId: "vac_2", skillId: "skill_python", required: false },
  // vac_3 Retail Program Manager
  { id: "vr_3_1", vacancyId: "vac_3", skillId: "skill_agile", required: true, minimumYears: 5 },
  { id: "vr_3_2", vacancyId: "vac_3", skillId: "skill_jira", required: true },
  { id: "vr_3_3", vacancyId: "vac_3", skillId: "skill_stakeholder", required: true, minimumYears: 5 },
  { id: "vr_3_4", vacancyId: "vac_3", skillId: "skill_risk", required: false },
  // vac_4 Healthcare Data Engineer
  { id: "vr_4_1", vacancyId: "vac_4", skillId: "skill_sql", required: true, minimumYears: 3 },
  { id: "vr_4_2", vacancyId: "vac_4", skillId: "skill_python", required: true },
  { id: "vr_4_3", vacancyId: "vac_4", skillId: "skill_dbt", required: true },
  { id: "vr_4_4", vacancyId: "vac_4", skillId: "skill_snowflake", required: false },
  { id: "vr_4_5", vacancyId: "vac_4", skillId: "skill_airflow", required: false },
  { id: "vr_4_6", vacancyId: "vac_4", skillId: "skill_fhir", required: false },
  // vac_5 Clinical SME
  { id: "vr_5_1", vacancyId: "vac_5", skillId: "skill_hl7", required: true },
  { id: "vr_5_2", vacancyId: "vac_5", skillId: "skill_fhir", required: true },
  { id: "vr_5_3", vacancyId: "vac_5", skillId: "skill_regulatory", required: true },
  { id: "vr_5_4", vacancyId: "vac_5", skillId: "skill_stakeholder", required: false },
  // vac_6 Cloud Platform Engineer
  { id: "vr_6_1", vacancyId: "vac_6", skillId: "skill_kubernetes", required: true, minimumYears: 4 },
  { id: "vr_6_2", vacancyId: "vac_6", skillId: "skill_terraform", required: true },
  { id: "vr_6_3", vacancyId: "vac_6", skillId: "skill_aws", required: true },
  { id: "vr_6_4", vacancyId: "vac_6", skillId: "skill_docker", required: true },
  { id: "vr_6_5", vacancyId: "vac_6", skillId: "skill_cicd", required: false },
  { id: "vr_6_6", vacancyId: "vac_6", skillId: "skill_prometheus", required: false },
  // vac_7 Compliance Automation Developer
  { id: "vr_7_1", vacancyId: "vac_7", skillId: "skill_java", required: true },
  { id: "vr_7_2", vacancyId: "vac_7", skillId: "skill_selenium", required: true },
  { id: "vr_7_3", vacancyId: "vac_7", skillId: "skill_rest", required: true },
  { id: "vr_7_4", vacancyId: "vac_7", skillId: "skill_cicd", required: false },
  // vac_8 Manufacturing HR Partner
  { id: "vr_8_1", vacancyId: "vac_8", skillId: "skill_sql", required: false },
  { id: "vr_8_2", vacancyId: "vac_8", skillId: "skill_excel", required: true },
  { id: "vr_8_3", vacancyId: "vac_8", skillId: "skill_stakeholder", required: true },
  // vac_9 Merchandising Coordinator
  { id: "vr_9_1", vacancyId: "vac_9", skillId: "skill_excel", required: true },
  { id: "vr_9_2", vacancyId: "vac_9", skillId: "skill_sql", required: false },
  // vac_10 Full-stack R&D
  { id: "vr_10_1", vacancyId: "vac_10", skillId: "skill_react", required: true, minimumYears: 4 },
  { id: "vr_10_2", vacancyId: "vac_10", skillId: "skill_node", required: true, minimumYears: 4 },
  { id: "vr_10_3", vacancyId: "vac_10", skillId: "skill_typescript", required: true },
  { id: "vr_10_4", vacancyId: "vac_10", skillId: "skill_postgres", required: true },
  { id: "vr_10_5", vacancyId: "vac_10", skillId: "skill_graphql", required: false },
  { id: "vr_10_6", vacancyId: "vac_10", skillId: "skill_aws", required: false },
  // vac_11 Supply Chain Analyst
  { id: "vr_11_1", vacancyId: "vac_11", skillId: "skill_sql", required: true },
  { id: "vr_11_2", vacancyId: "vac_11", skillId: "skill_python", required: false },
  { id: "vr_11_3", vacancyId: "vac_11", skillId: "skill_excel", required: true },
  // vac_12 Payroll Specialist
  { id: "vr_12_1", vacancyId: "vac_12", skillId: "skill_excel", required: true },
  { id: "vr_12_2", vacancyId: "vac_12", skillId: "skill_sql", required: false },
  { id: "vr_12_3", vacancyId: "vac_12", skillId: "skill_jira", required: false },
  // vac_13 Customs Integration Developer
  { id: "vr_13_1", vacancyId: "vac_13", skillId: "skill_java", required: true, minimumYears: 5 },
  { id: "vr_13_2", vacancyId: "vac_13", skillId: "skill_spring", required: true },
  { id: "vr_13_3", vacancyId: "vac_13", skillId: "skill_postgres", required: true },
  { id: "vr_13_4", vacancyId: "vac_13", skillId: "skill_docker", required: false },
  { id: "vr_13_5", vacancyId: "vac_13", skillId: "skill_rest", required: true },
  // vac_14 Security & Residency
  { id: "vr_14_1", vacancyId: "vac_14", skillId: "skill_kubernetes", required: true },
  { id: "vr_14_2", vacancyId: "vac_14", skillId: "skill_java", required: false },
  { id: "vr_14_3", vacancyId: "vac_14", skillId: "skill_aws", required: true },
  { id: "vr_14_4", vacancyId: "vac_14", skillId: "skill_risk", required: true },
];
