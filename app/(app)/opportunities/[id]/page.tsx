import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { canManageOpportunities } from "@/lib/auth/opportunity-access";
import { formatOpportunityCurrency } from "@/lib/opportunities/mappers";
import {
  getOpportunityByIdForUi,
  listCompaniesForOpportunityForm,
  listUsersForOpportunityForm,
} from "@/lib/opportunities/queries";

import { OpportunityEditDialog } from "../_components/opportunity-edit-dialog";
import { OpportunityStageBadge } from "../_components/opportunity-stage-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageOpportunities(session?.user?.role);

  const [opportunity, companies, owners] = await Promise.all([
    getOpportunityByIdForUi(id),
    canManage ? listCompaniesForOpportunityForm() : Promise.resolve([]),
    canManage ? listUsersForOpportunityForm() : Promise.resolve([]),
  ]);

  if (!opportunity) {
    notFound();
  }

  const valueDisplay = formatOpportunityCurrency(
    opportunity.valueAmount,
    opportunity.currency,
  );

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/opportunities"
        backLabel="Volver a oportunidades"
        title={opportunity.title}
        description={`Registro del negocio · estimación en ${opportunity.currency} · almacenado en PostgreSQL.`}
        meta={
          <div className="shrink-0">
            <OpportunityStageBadge stage={opportunity.stage} />
          </div>
        }
        actions={
          canManage ? (
            <OpportunityEditDialog
              opportunity={opportunity}
              companies={companies}
              owners={owners}
            />
          ) : null
        }
      />

      <DetailGrid
        items={[
          {
            label: "Empresa",
            value: opportunity.companyName,
            href: `/companies/${opportunity.companyId}`,
          },
          { label: "Responsable", value: opportunity.ownerName },
          { label: "Valor estimado", value: valueDisplay },
        ]}
      />

      <SectionCard
        title="Descripción"
        description="Alcance, stakeholders y encuadre comercial de la oportunidad."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Aquí vivirá la descripción estructurada y los criterios de cierre a
          medida que evolucione el negocio. Lo financiero arriba refleja la
          estimación actual en {opportunity.currency}.
        </p>
      </SectionCard>

      <PlaceholderSection
        title="Vacantes"
        description="Roles abiertos o líneas de contratación ligadas a este negocio."
      />
      <PlaceholderSection
        title="Actividad"
        description="Reuniones, correos y cambios de etapa."
      />
    </div>
  );
}
