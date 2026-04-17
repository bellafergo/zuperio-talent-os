/**
 * Structured skill catalog and junction seeds (aligned with legacy free-text fields).
 */

export type SeedSkill = {
  id: string;
  name: string;
  category: string | null;
};

export const SEED_SKILLS: SeedSkill[] = [
  // ── Project Management & Metodologías ──────────────────────────────────────
  { id: "skill_agile",        name: "Agile",                category: "Project Management & Metodologías" },
  { id: "skill_scrum",        name: "Scrum",                category: "Project Management & Metodologías" },
  { id: "skill_jira",         name: "Jira",                 category: "Project Management & Metodologías" },
  { id: "skill_stakeholder",  name: "Stakeholder management", category: "Project Management & Metodologías" },
  { id: "skill_risk",         name: "Risk management",      category: "Project Management & Metodologías" },
  { id: "skill_pm",           name: "Project Management",   category: "Project Management & Metodologías" },
  { id: "skill_kanban",       name: "Kanban",               category: "Project Management & Metodologías" },
  { id: "skill_safe",         name: "SAFe",                 category: "Project Management & Metodologías" },
  { id: "skill_pmo",          name: "PMO",                  category: "Project Management & Metodologías" },
  { id: "skill_release_mgmt", name: "Release Management",   category: "Project Management & Metodologías" },
  { id: "skill_waterfall",    name: "Waterfall",            category: "Project Management & Metodologías" },
  { id: "skill_prince2",      name: "PRINCE2",              category: "Project Management & Metodologías" },
  { id: "skill_pmp",          name: "PMP",                  category: "Project Management & Metodologías" },

  // ── Desarrollo de Software ─────────────────────────────────────────────────
  { id: "skill_javascript",   name: "JavaScript",           category: "Desarrollo de Software" },
  { id: "skill_typescript",   name: "TypeScript",           category: "Desarrollo de Software" },
  { id: "skill_python",       name: "Python",               category: "Desarrollo de Software" },
  { id: "skill_java",         name: "Java",                 category: "Desarrollo de Software" },
  { id: "skill_react",        name: "React",                category: "Desarrollo de Software" },
  { id: "skill_nextjs",       name: "Next.js",              category: "Desarrollo de Software" },
  { id: "skill_node",         name: "Node.js",              category: "Desarrollo de Software" },
  { id: "skill_spring",       name: "Spring Boot",          category: "Desarrollo de Software" },
  { id: "skill_rest",         name: "REST APIs",            category: "Desarrollo de Software" },
  { id: "skill_graphql",      name: "GraphQL",              category: "Desarrollo de Software" },
  { id: "skill_microservices",name: "Microservices",        category: "Desarrollo de Software" },
  { id: "skill_docker",       name: "Docker",               category: "Desarrollo de Software" },
  { id: "skill_kubernetes",   name: "Kubernetes",           category: "Desarrollo de Software" },
  { id: "skill_kotlin",       name: "Kotlin",               category: "Desarrollo de Software" },
  { id: "skill_tailwind",     name: "Tailwind CSS",         category: "Desarrollo de Software" },
  { id: "skill_git",          name: "Git",                  category: "Desarrollo de Software" },
  { id: "skill_kafka",        name: "Kafka",                category: "Desarrollo de Software" },
  { id: "skill_csharp",       name: "C#",                   category: "Desarrollo de Software" },
  { id: "skill_go",           name: "Go",                   category: "Desarrollo de Software" },
  { id: "skill_rust",         name: "Rust",                 category: "Desarrollo de Software" },
  { id: "skill_php",          name: "PHP",                  category: "Desarrollo de Software" },
  { id: "skill_ruby",         name: "Ruby",                 category: "Desarrollo de Software" },
  { id: "skill_vuejs",        name: "Vue.js",               category: "Desarrollo de Software" },
  { id: "skill_angular",      name: "Angular",              category: "Desarrollo de Software" },
  { id: "skill_fastapi",      name: "FastAPI",              category: "Desarrollo de Software" },
  { id: "skill_django",       name: "Django",               category: "Desarrollo de Software" },

  // ── Data & BI ──────────────────────────────────────────────────────────────
  { id: "skill_sql",          name: "SQL",                  category: "Data & BI" },
  { id: "skill_postgres",     name: "PostgreSQL",           category: "Data & BI" },
  { id: "skill_dbt",          name: "dbt",                  category: "Data & BI" },
  { id: "skill_airflow",      name: "Airflow",              category: "Data & BI" },
  { id: "skill_snowflake",    name: "Snowflake",            category: "Data & BI" },
  { id: "skill_bigquery",     name: "BigQuery",             category: "Data & BI" },
  { id: "skill_excel",        name: "Excel",                category: "Data & BI" },
  { id: "skill_looker",       name: "Looker",               category: "Data & BI" },
  { id: "skill_mysql",        name: "MySQL",                category: "Data & BI" },
  { id: "skill_mongodb",      name: "MongoDB",              category: "Data & BI" },
  { id: "skill_redis",        name: "Redis",                category: "Data & BI" },
  { id: "skill_elasticsearch",name: "Elasticsearch",        category: "Data & BI" },
  { id: "skill_powerbi",      name: "Power BI",             category: "Data & BI" },
  { id: "skill_tableau",      name: "Tableau",              category: "Data & BI" },
  { id: "skill_spark",        name: "Apache Spark",         category: "Data & BI" },
  { id: "skill_python_data",  name: "Python (Data)",        category: "Data & BI" },
  { id: "skill_pandas",       name: "Pandas",               category: "Data & BI" },
  { id: "skill_numpy",        name: "NumPy",                category: "Data & BI" },

  // ── Cloud & Infraestructura ────────────────────────────────────────────────
  { id: "skill_aws",          name: "AWS",                  category: "Cloud & Infraestructura" },
  { id: "skill_terraform",    name: "Terraform",            category: "Cloud & Infraestructura" },
  { id: "skill_cicd",         name: "CI/CD",                category: "Cloud & Infraestructura" },
  { id: "skill_linux",        name: "Linux",                category: "Cloud & Infraestructura" },
  { id: "skill_prometheus",   name: "Prometheus",           category: "Cloud & Infraestructura" },
  { id: "skill_azure",        name: "Azure",                category: "Cloud & Infraestructura" },
  { id: "skill_gcp",          name: "GCP",                  category: "Cloud & Infraestructura" },
  { id: "skill_ansible",      name: "Ansible",              category: "Cloud & Infraestructura" },
  { id: "skill_github_actions",name: "GitHub Actions",      category: "Cloud & Infraestructura" },
  { id: "skill_jenkins",      name: "Jenkins",              category: "Cloud & Infraestructura" },
  { id: "skill_nginx",        name: "Nginx",                category: "Cloud & Infraestructura" },

  // ── QA & Testing ──────────────────────────────────────────────────────────
  { id: "skill_selenium",     name: "Selenium",             category: "QA & Testing" },
  { id: "skill_cypress",      name: "Cypress",              category: "QA & Testing" },
  { id: "skill_jest",         name: "Jest",                 category: "QA & Testing" },
  { id: "skill_qa_manual",    name: "QA Manual",            category: "QA & Testing" },
  { id: "skill_qa_auto",      name: "QA Automation",        category: "QA & Testing" },
  { id: "skill_playwright",   name: "Playwright",           category: "QA & Testing" },
  { id: "skill_pytest",       name: "Pytest",               category: "QA & Testing" },
  { id: "skill_postman",      name: "Postman",              category: "QA & Testing" },
  { id: "skill_jmeter",       name: "JMeter",               category: "QA & Testing" },
  { id: "skill_testrail",     name: "TestRail",             category: "QA & Testing" },

  // ── ERP & Enterprise ──────────────────────────────────────────────────────
  { id: "skill_sap",          name: "SAP",                  category: "ERP & Enterprise" },
  { id: "skill_oracle_erp",   name: "Oracle",               category: "ERP & Enterprise" },
  { id: "skill_salesforce",   name: "Salesforce",           category: "ERP & Enterprise" },
  { id: "skill_servicenow",   name: "ServiceNow",           category: "ERP & Enterprise" },
  { id: "skill_dynamics365",  name: "Dynamics 365",         category: "ERP & Enterprise" },
  { id: "skill_itsm",         name: "ITSM",                 category: "ERP & Enterprise" },

  // ── Soft Skills Técnicos ───────────────────────────────────────────────────
  { id: "skill_tech_leadership", name: "Technical Leadership", category: "Soft Skills Técnicos" },
  { id: "skill_team_lead",    name: "Team Lead",            category: "Soft Skills Técnicos" },
  { id: "skill_architecture", name: "Architecture Design",  category: "Soft Skills Técnicos" },
  { id: "skill_code_review",  name: "Code Review",          category: "Soft Skills Técnicos" },
  { id: "skill_mentoring",    name: "Mentoring",            category: "Soft Skills Técnicos" },
  { id: "skill_client_comm",  name: "Client Communication", category: "Soft Skills Técnicos" },
  { id: "skill_figma",        name: "Figma",                category: "Soft Skills Técnicos" },

  // ── Mobile ────────────────────────────────────────────────────────────────
  { id: "skill_react_native", name: "React Native",         category: "Mobile" },
  { id: "skill_swift",        name: "Swift",                category: "Mobile" },
  { id: "skill_kotlin_mobile",name: "Kotlin (mobile)",      category: "Mobile" },

  // ── Healthcare ────────────────────────────────────────────────────────────
  { id: "skill_hl7",          name: "HL7",                  category: "Healthcare" },
  { id: "skill_fhir",         name: "FHIR",                 category: "Healthcare" },
  { id: "skill_regulatory",   name: "Regulatory (healthcare)", category: "Healthcare" },
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
