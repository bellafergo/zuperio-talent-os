import { normalizeSkillNameForCatalog } from "../lib/skills/normalize-skill-name";

/**
 * Maps expansion userCategory labels to canonical Skill.category values.
 * Inputs are matched after normalizeSkillNameForCatalog (no accents / punctuation).
 */
function isErpExpansion(n: string, c: string): boolean {
  const x = `${n} ${c}`;
  if (/\berp\b/.test(x)) return true;
  if (
    /\b(sap|oracle|dynamics|netsuite|workday|odoo|infor|epicor|sage)\b/.test(n)
  ) {
    return true;
  }
  if (
    /sap ecc|fico|sap mm|sap sd|sap pp|sap hcm|abap|btp|ariba|successfactors|oracle ebs|oracle fusion|pl sql|business central|dynamics crm|analytics cloud|low code erp|erp open|erp cloud|erp mid|core erp|desarrollo erp|oracle financials|oracle scm|oracle hcm|plataforma erp|modulo |funcional|tecnico|fit gap|hypercare|go live|data migration erp|master data erp|cleansing erp|testing erp|uat erp|change management erp|erp support|incident management erp|sla management erp|security roles|compliance erp|audit erp|mapping erp|apis erp|integracion middleware|sap pi po|mulesoft|boomi|edi\b|segregation duties|training adoption|implementacion erp|rollout erp|customization erp|configuracion erp|negocio erp|s4hana|s 4hana/i.test(
      x,
    )
  ) {
    return true;
  }
  if (
    /finance processes|procurement processes|inventory management|order management|manufacturing processes|supply chain management|human capital management|payroll|financial reporting|taxation|budgeting forecasting|business process mapping erp/i.test(
      x,
    )
  ) {
    return true;
  }
  return false;
}

export function mapExpansionRow(name: string, userCategory: string): string {
  const n = normalizeSkillNameForCatalog(name);
  const c = normalizeSkillNameForCatalog(userCategory);
  const hay = `${n} ${c}`;

  // --- Disambiguation (canonical buckets only) ---
  if (
    /\bchange management\b/.test(n) &&
    !/\bitil\b/.test(n) &&
    !/\berp\b/.test(n)
  ) {
    return "Project Management & Metodologías";
  }
  if (/\bservice design\b/.test(n) && !/\bitil\b/.test(n)) {
    return "Project Management & Metodologías";
  }
  if (/finops/.test(n) && /\bdata\b/.test(n)) {
    return "Data & BI";
  }
  if (/\biam\b/.test(n) && /data security/.test(n)) {
    return "Data & BI";
  }

  if (c === "arquitectura") {
    if (/\bdata\b/.test(n)) return "Data & BI";
    return "Desarrollo de Software";
  }
  if (c === "modelado") {
    return "Data & BI";
  }
  if (c === "analitica" && /excel/.test(n)) {
    return "Data & BI";
  }
  if (c === "automatizacion") {
    if (/ansible|bash/.test(n)) return "Cloud & Infraestructura";
    if (/power automate|zapier|make integromat/.test(n)) {
      return "RPA & Integración";
    }
    if (/playwright|cypress|selenium|appium/.test(n)) return "QA & Testing";
    return "Cloud & Infraestructura";
  }
  if (
    (c === "operacion" || c === "operacion avanzada") &&
    /\bitil\b/.test(n)
  ) {
    return "ITSM & Operaciones";
  }

  if (isErpExpansion(n, c)) {
    return "ERP & Enterprise";
  }

  // --- QA & Testing ---
  if (
    /\bqa\b|testing|test |e2e|jest|junit|cypress|selenium|playwright|appium|cucumber|mocha|nunit|testng|sonarqube|owasp|accessibility|cross browser|mobile testing|test data|ci testing|swagger|openapi|allure|qmetry|testrail|postman|static code|code review|devsecops|secure coding|unit testing|integration testing|manual testing|test case|test strategy|regression|smoke|performance testing|load testing|security testing|api testing|bdd|calidad codigo|reportes qa|gestion qa|testing api|testing framework|automatizacion qa|jira qa/i.test(
      hay,
    ) &&
    !/\berp\b/.test(n)
  ) {
    return "QA & Testing";
  }

  // --- Gestión de Procesos (BPM) ---
  if (
    /bpmn|process mining|celonis|signavio|bizagi|auraquantic|appian|pega|bpm suite|low code bpm|workflow design|business process management|process mapping|process design|process optimization|reengineering|process automation|process governance|dmn|value stream|six sigma|lean six|optimizacion procesos|modelado procesos|gestion de procesos$/i.test(
      hay,
    ) &&
    !/\berp\b/.test(hay)
  ) {
    return "Gestión de Procesos (BPM)";
  }

  // --- RPA & Integración ---
  if (
    /rpa|uipath|automation anywhere|blue prism|power automate|zapier|make integromat/.test(
      hay,
    )
  ) {
    return "RPA & Integración";
  }

  // --- IA / ML & Generación ---
  if (
    /lenguaje ia|data ia|ia core|ia avanzada|ia especializada|ia generativa|framework ia|infraestructura ia|arquitectura ia|ingenieria ia|backend ia|cloud ai|operacion ia|machine learning|deep learning|nlp|computer vision|generative|prompt|llm|langchain|llamaindex|vector|rag\b|agents|fine tuning|mlops|tensorflow|pytorch|scikit|data preprocessing|feature engineering|model deployment|vertex|azure machine learning|sagemaker|cognitive|openai|claude|gemini|tesseract|abbyy|speech to text|text to speech|chatbot|conversational|ai governance|ai ethics|privacy.*ia|natural language|retrieval augmented|autonomous agents|document ai|ia voz|ia aplicada|gobierno ia|ocr document/i.test(
      hay,
    )
  ) {
    return "IA / ML & Generación";
  }

  // --- ITSM & Operaciones ---
  if (
    /itsm|itil|service design itil|service transition|service operation|continual service improvement|incident management|problem management|release management|request fulfillment|service level|availability management|capacity management|itom|event management|monitoring|observability|apm\b|logging|tracing|root cause|runbooks|knowledge management|service desk|help desk|noc\b|soc\b|endpoint management|itam|cmdb|service catalog|cultura operacion|sre\b|ci cd|iac\b|terraform|ansible|cloud operations|azure monitor|cloudwatch|operations suite|prometheus|grafana|elk|splunk|dynatrace|new relic|datadog|servicenow|bmc helix|ivanti|freshservice|zendesk|jira service|manageengine|cherwell|solarwinds|pagerduty|opsgenie|incident response|disaster recovery|business continuity|backup|security operations|vulnerability|patch management|identity.*access management|compliance.*iso|audit.*governance|finops|cost optimization|sla reporting|dashboarding|gestion servicios|framework itsm|plataforma itsm|monitoreo|alerting|continuidad|configuracion|gestion activos|seguridad/i.test(
      hay,
    ) &&
    !/\berp\b/.test(n)
  ) {
    return "ITSM & Operaciones";
  }

  // --- Project Management & Metodologías ---
  if (
    /gestion proyectos|gestion avanzada|gestion estrategica|metodologias agiles|metodologia agil|escalamiento|mejora continua|metodologia tradicional|hibrida|framework pm|pmbok|prince2|okr|kpi|roadmapping|stakeholder|riesgos|incidencias|gestion del cambio|recursos|capacidad|presupuesto|estimacion|planeacion financiera|gobierno proyectos|pmo|madurez|business analysis|requirements|user stories|use cases|functional spec|uaf|organizational design|operating model|digital transformation|herramienta pm|confluence|ms project|smartsheet|monday|clickup|asana|trello|notion|analitica pm|planeacion estrategica|medicion desempeno|gestion financiera|gestion proveedores|levantamiento|documentacion|validacion negocio|diseno servicios|diseno organizacional|modelo operativo|transformacion digital|agile$/i.test(
      hay,
    )
  ) {
    return "Project Management & Metodologías";
  }

  // --- Data & BI ---
  if (
    /\bdata\b|bi\b|analytics|analitica|warehouse|lake|lakehouse|etl|elt|pipeline|integration|transformation|cleaning|quality|governance|mdm|metadata|lineage|big data|spark|hadoop|databricks|snowflake|redshift|bigquery|synapse|power bi|tableau|looker|qlik|metabase|superset|dax|power query|storytelling|kpi design|dashboard|self service|data engineering|data analyst|data scientist|statistical|predictive|prescriptive|time series|a b testing|airflow|dbt|fivetran|stitch|kafka|streaming|real time|ingenieria datos|visualizacion|plataforma data|cloud data|iam.*data|privacy.*gdpr|ciencia datos|analitica avanzada|modelado|dimensional|orquestacion|streaming data|data apis|rest apis data|excel avanzado/i.test(
      hay,
    ) &&
    !/\berp\b/.test(n)
  ) {
    return "Data & BI";
  }

  // --- Desarrollo de Software ---
  if (
    /lenguaje frontend|frontend|backend|fullstack|framework frontend|framework fullstack|html|css|ui styling|ui framework|backend as service|base datos|cache|orm|microservice|serverless|websocket|grpc|comunicacion|hosting|control versiones|repositorios|bash scripting|javascript|typescript|react|angular|vue|next js|nuxt|nodejs|express|nest|spring|asp net|django|flask|fastapi|go\b|ruby|php|laravel|rest apis|graphql|firebase|redis|prisma|sequelize|mysql|postgres|mongo|vercel|netlify|git|github|gitlab|bitbucket|java\b|csharp/i.test(
      hay,
    )
  ) {
    return "Desarrollo de Software";
  }

  // --- Cloud & Infraestructura ---
  if (
    /\baws\b|\bazure\b|gcp|google cloud|kubernetes|docker|linux|infraestructura|cloud\b/i.test(
      hay,
    )
  ) {
    return "Cloud & Infraestructura";
  }

  return "Soft Skills Técnicos";
}
