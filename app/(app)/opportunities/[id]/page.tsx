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
        backLabel="Back to opportunities"
        title={opportunity.title}
        description={`Deal record · estimate in ${opportunity.currency} · stored in PostgreSQL.`}
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
            label: "Company",
            value: opportunity.companyName,
            href: `/companies/${opportunity.companyId}`,
          },
          { label: "Owner", value: opportunity.ownerName },
          { label: "Estimated value", value: valueDisplay },
        ]}
      />

      <SectionCard
        title="Description"
        description="Scope, stakeholders, and commercial framing for this opportunity."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          A structured description and win criteria will live here as the deal
          evolves. Financials above reflect the current estimate in{" "}
          {opportunity.currency}.
        </p>
      </SectionCard>

      <PlaceholderSection
        title="Vacancies"
        description="Open roles or hiring tracks tied to this deal."
      />
      <PlaceholderSection
        title="Activity"
        description="Meetings, emails, and stage changes."
      />
    </div>
  );
}
