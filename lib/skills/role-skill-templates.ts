/**
 * Deterministic skill templates per role profile.
 * Values are `Skill.id` from the catalog (seed). Shared by candidate and vacancy UIs.
 */
export const ROLE_SKILL_TEMPLATES: Record<string, string[]> = {
  "Backend Developer": [
    "skill_node",
    "skill_rest",
    "skill_graphql",
    "skill_typescript",
    "skill_microservices",
    "skill_docker",
    "skill_aws",
    "skill_postgres",
    "skill_git",
  ],
  "Frontend Developer": [
    "skill_react",
    "skill_nextjs",
    "skill_javascript",
    "skill_typescript",
    "skill_tailwind",
    "skill_git",
  ],
  "Full Stack Developer": [
    "skill_react",
    "skill_nextjs",
    "skill_typescript",
    "skill_javascript",
    "skill_node",
    "skill_rest",
    "skill_postgres",
    "skill_docker",
    "skill_git",
  ],
  "Data Engineer": [
    "skill_python",
    "skill_sql",
    "skill_postgres",
    "skill_bigquery",
    "skill_snowflake",
    "skill_dbt",
    "skill_airflow",
    "skill_kafka",
    "skill_docker",
  ],
  "Data Analyst": [
    "skill_python",
    "skill_sql",
    "skill_excel",
    "skill_bigquery",
    "skill_looker",
    "skill_snowflake",
  ],
  "QA Engineer": [
    "skill_jest",
    "skill_cypress",
    "skill_selenium",
    "skill_scrum",
    "skill_jira",
  ],
  "DevOps / SRE": [
    "skill_docker",
    "skill_kubernetes",
    "skill_terraform",
    "skill_aws",
    "skill_cicd",
    "skill_prometheus",
    "skill_kafka",
    "skill_linux",
    "skill_git",
  ],
  "Mobile (React Native)": [
    "skill_react_native",
    "skill_javascript",
    "skill_typescript",
    "skill_git",
  ],
  "iOS Developer": ["skill_swift", "skill_git"],
  "Android Developer": ["skill_kotlin_mobile", "skill_git"],
  "Project Manager / PM": [
    "skill_agile",
    "skill_scrum",
    "skill_jira",
    "skill_stakeholder",
    "skill_risk",
    "skill_figma",
  ],
  "Tech Lead / Architect": [
    "skill_typescript",
    "skill_node",
    "skill_react",
    "skill_microservices",
    "skill_docker",
    "skill_kubernetes",
    "skill_aws",
    "skill_postgres",
    "skill_git",
  ],
};

export const ROLE_SKILL_TEMPLATE_NAMES = Object.keys(ROLE_SKILL_TEMPLATES).sort(
  (a, b) => a.localeCompare(b),
);

export function getRoleSkillTemplateIds(templateName: string): string[] {
  return ROLE_SKILL_TEMPLATES[templateName] ?? [];
}
