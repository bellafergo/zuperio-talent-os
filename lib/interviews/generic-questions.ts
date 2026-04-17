import type { InterviewQuestionGroup, InterviewTemplateKey } from "./types";

const PM: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica / gestión de entrega",
    questions: [
      "Describe cómo armarías un plan de proyecto con dependencias críticas y buffer realista.",
      "¿Cómo priorizas backlog cuando negocio pide todo “urgente” y el equipo tiene capacidad finita?",
      "¿Qué métricas usarías para saber si un proyecto va a tiempo y con calidad (no solo % avance)?",
      "Explica cómo manejas el alcance cuando aparecen cambios mid-sprint sin ajustar fecha ni presupuesto.",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un proyecto donde falló la estimación: qué pasó, qué hiciste y qué cambió después.",
      "¿Alguna vez tuviste un stakeholder hostil o desalineado? ¿Cómo lo llevaste a decisiones concretas?",
      "Describe una situación donde tuviste que escalar un riesgo a dirección: qué datos llevaste y qué pediste.",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "El equipo lleva 2 semanas bloqueado por una dependencia externa: ¿qué pasos sigues el día 1 y el día 5?",
      "Cómo actuarías si QA encuentra un bug crítico 48h antes del go-live acordado con el cliente.",
      "Si la velocidad del equipo cae sin causa obvia, ¿cómo diagnosticarías y qué experimentarías primero?",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación y stakeholders",
    questions: [
      "¿Cómo comunicas un retraso sin perder confianza del cliente?",
      "Dame un ejemplo de acta o reporte que consideres útil vs. uno que solo “cumple formalidad”.",
      "¿Cómo facilitas una reunión donde técnicos y negocio hablan distinto idioma?",
    ],
  },
];

const BACKEND: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "Diseña (a alto nivel) una API REST para un dominio con reglas de negocio no triviales: versionado, errores, idempotencia.",
      "¿Cómo abordas N+1 queries, índices y paginación en listados grandes?",
      "Explica trade-offs entre consistencia fuerte, eventual y sagas en microservicios.",
      "¿Cómo instrumentarías latencia p95/p99 y errores en producción?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame el bug o incidente de producción más difícil que hayas depurado: hipótesis, herramientas, fix.",
      "Describe una refactorización grande: cómo la fragmentaste y cómo mitigaste regresiones.",
      "¿Has migrado datos en caliente? ¿Qué estrategia usaste (dual-write, CDC, batch)?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Un endpoint pasa de 200ms a 8s tras un deploy: ¿cómo aislas causa raíz en <1h?",
      "Cómo diseñarías rate limiting y protección ante abuso sin afectar usuarios legítimos.",
      "Si dos servicios deben compartir estado transaccional, ¿qué opciones evaluarías?",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación / colaboración",
    questions: [
      "¿Cómo explicas a producto por qué una feature “simple” es riesgosa técnicamente?",
      "Describe cómo documentarías un contrato de API para otro equipo consumidor.",
    ],
  },
];

const FRONTEND: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "¿Cómo manejas estado global vs. local y cuándo evitar contextos gigantes?",
      "Explica el ciclo de render, reconciliación y cómo evitar renders innecesarios en tu stack.",
      "¿Cómo implementarías accesibilidad (teclado, ARIA) en un componente complejo?",
      "Estrategias para code-splitting, lazy routes y métricas Web Vitals.",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame una UI que debía ser performante con listas grandes: qué técnica aplicaste.",
      "Describe un bug cross-browser o mobile que te costó; cómo lo reprodujiste y cerraste.",
      "¿Has integrado diseño (Figma) con componentes reutilizables? ¿Qué convenciones usaste?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "La app “parpadea” o pierde foco al actualizar datos: ¿cómo depuras?",
      "Cómo aislarías si un problema es de red, de API o de capa de presentación.",
      "Si el bundle crece mucho, ¿qué herramientas y pasos usarías para recortar?",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación / stakeholders",
    questions: [
      "¿Cómo negocias con UX cuando una animación afecta rendimiento?",
      "Cómo presentarías a negocio un hallazgo de deuda técnica en front con impacto en roadmap.",
    ],
  },
];

const QA: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "¿Cómo diseñarías una matriz de pruebas para una feature con muchas reglas condicionales?",
      "Diferencias entre pruebas funcionales, regresión, smoke y exploratorias — cuándo usar cada una.",
      "¿Cómo automatizarías pruebas críticas sin volverlas frágiles ante cambios de UI?",
      "¿Qué información mínima necesitas en un bug report para que desarrollo lo reproduzca rápido?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un defecto que escapó a producción: qué faltó en tu proceso y qué mejoraste.",
      "Describe cómo colaboraste con devs en un entorno ágil (definición de hecho, criterios de aceptación).",
      "¿Has liderado pruebas de performance o carga? ¿Qué métricas miraste?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Hay poco tiempo antes del release y cobertura insuficiente: ¿cómo priorizas qué probar?",
      "Cómo actuarías si no puedes reproducir un bug reportado solo en ambiente cliente.",
      "Si automatización falla intermitente en CI, ¿cómo reduces ruido sin ocultar fallos reales?",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación",
    questions: [
      "¿Cómo comunicas severidad y prioridad de un hallazgo sin generar fricción con el equipo?",
      "Ejemplo de cómo facilitarías una sesión de pruebas exploratorias con stakeholders.",
    ],
  },
];

const SAP: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica / dominio",
    questions: [
      "Describe un módulo SAP que domines: configuración vs. desarrollo y límites de cada uno.",
      "¿Cómo abordas una interfase IDoc/BAPI/RFC entre SAP y sistemas externos?",
      "Explica consideraciones de transporte, mandantes y paisaje DEV→QAS→PRD.",
      "¿Cómo documentarías una especificación funcional/técnica para un cambio en S/4HANA?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un proyecto SAP con cambios de alcance o customizations que generaron deuda.",
      "Describe una incidente post-go-live: causa, contención y solución permanente.",
      "¿Has trabajado con equipos funcionales (FI/CO/MM)? ¿Cómo alineaste criterios de prueba?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Un batch crítico falla intermitente: ¿qué revisarías en SAP y en integraciones?",
      "Cómo priorizarías cuando hay backlog de notas OSS y pedidos del negocio en paralelo.",
    ],
  },
  {
    id: "communication",
    titleEs: "Stakeholders / consultoría",
    questions: [
      "¿Cómo explicas a negocio por qué un requerimiento “estándar” requiere desarrollo?",
      "Cómo manejas expectativas cuando el estándar SAP no cubre un proceso local.",
    ],
  },
];

const DATA: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "Diseña un pipeline ETL/ELT: ingesta, calidad de datos, idempotencia y reprocesos.",
      "¿Cómo modelarías un star schema vs. wide tables para un caso de reporting frecuente?",
      "Explica deduplicación, slowly changing dimensions y manejo de datos tardíos.",
      "¿Qué pruebas harías para validar transformaciones antes de exponer datos a BI?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un proyecto donde los datos “en producción” no coincidían con negocio: cómo cerraste la brecha.",
      "Describe cómo optimizaste una consulta o job que escalaba mal con el volumen.",
      "¿Has expuesto métricas a stakeholders no técnicos? ¿Qué visualización/guardrails usaste?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Los números del dashboard no cuadran con fuente operativa: ¿cómo depuras linaje y joins?",
      "Cómo manejarías PII / cumplimiento en un dataset compartido con analistas.",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación",
    questions: [
      "¿Cómo explicas limitaciones de los datos sin que pierdan confianza en el análisis?",
      "Cómo priorizarías backlog de mejoras de datos vs. nuevos reportes pedidos por ventas.",
    ],
  },
];

const DEVOPS: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "Describe una pipeline CI/CD segura: secretos, firmas, ambientes y promotions.",
      "¿Cómo diseñarías alta disponibilidad para un servicio stateless vs. con estado?",
      "Explica IaC: módulos, drift detection y rollback.",
      "¿Cómo observarías un cluster (logs, métricas, traces) y qué alertas evitarías?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un incidente de disponibilidad: timeline, postmortem y acciones preventivas.",
      "Describe una migración cloud (lift-and-shift vs. refactor) que hayas apoyado.",
      "¿Has endurecido imágenes o runtime (SBOM, policies)? ¿Qué tooling usaste?",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Un deploy canary muestra errores 5xx crecientes: ¿qué haces en los primeros minutos?",
      "Cómo diagnosticarías costos cloud que subieron 40% de un mes a otro.",
    ],
  },
  {
    id: "communication",
    titleEs: "Colaboración",
    questions: [
      "¿Cómo convences a desarrollo de adoptar checks obligatorios en CI sin frenar entregas?",
      "Cómo documentarías runbooks para guardias fuera de horario.",
    ],
  },
];

const GENERAL: InterviewQuestionGroup[] = [
  {
    id: "technical",
    titleEs: "Profundidad técnica",
    questions: [
      "Resume el sistema más complejo en el que hayas trabajado: componentes, integraciones y puntos de fallo.",
      "¿Cómo garantizas calidad (pruebas, revisiones, observabilidad) en tus entregas?",
      "¿Qué criterios usarías para elegir tecnología en un proyecto nuevo con restricciones reales?",
    ],
  },
  {
    id: "experience",
    titleEs: "Experiencia real",
    questions: [
      "Cuéntame un proyecto donde tuviste que aprender rápido un dominio desconocido.",
      "Describe un conflicto técnico con un compañero y cómo llegaron a decisión.",
    ],
  },
  {
    id: "problemSolving",
    titleEs: "Resolución de problemas",
    questions: [
      "Te dan un problema ambiguo sin spec clara: ¿cómo avanzas las primeras 48 horas?",
      "¿Cómo priorizas cuando hay presión de tiempo y riesgo técnico alto?",
    ],
  },
  {
    id: "communication",
    titleEs: "Comunicación",
    questions: [
      "¿Cómo presentarías avances a un cliente no técnico en 5 minutos?",
      "Describe cómo pedirías ayuda o escalación sin sonar a “no sé hacerlo”.",
    ],
  },
];

const BANK: Record<InterviewTemplateKey, InterviewQuestionGroup[]> = {
  "project-manager": PM,
  "backend-developer": BACKEND,
  "frontend-developer": FRONTEND,
  qa: QA,
  sap: SAP,
  data: DATA,
  devops: DEVOPS,
  general: GENERAL,
};

export function getGenericInterviewGroups(
  key: InterviewTemplateKey,
): InterviewQuestionGroup[] {
  return BANK[key] ?? GENERAL;
}

export function genericInterviewTemplateLabelEs(key: InterviewTemplateKey): string {
  const labels: Record<InterviewTemplateKey, string> = {
    "project-manager": "Project Manager / entrega",
    "backend-developer": "Backend Developer",
    "frontend-developer": "Frontend Developer",
    qa: "QA / pruebas",
    sap: "SAP consultor / arquitectura funcional-técnica",
    data: "Data Analyst / Engineer",
    devops: "DevOps / Cloud",
    general: "General (TI / consultoría)",
  };
  return labels[key];
}
