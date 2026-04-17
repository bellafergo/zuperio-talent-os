import { SectionCard } from "@/components/layout";

export function VacancyWorkModalitySection({
  workModality,
}: {
  workModality: string | null;
}) {
  const text = workModality?.trim() ? workModality.trim() : null;

  return (
    <SectionCard
      title="Modalidad de trabajo"
      description="Definida al crear o editar la vacante (Híbrido, Home office, Presencial). Misma escala que en fichas de candidato."
    >
      {text ? (
        <p className="text-sm font-medium text-foreground">{text}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Sin especificar. Puedes completarla desde{" "}
          <span className="font-medium text-foreground">Editar vacante</span>.
        </p>
      )}
    </SectionCard>
  );
}
