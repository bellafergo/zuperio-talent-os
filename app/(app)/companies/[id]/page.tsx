import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  DetailGrid,
  PageHeader,
  PlaceholderSection,
  SectionCard,
} from "@/components/layout";
import { canManageCompanies } from "@/lib/auth/company-access";
import {
  getCompanyByIdForUi,
  listUsersForCompanyForm,
} from "@/lib/companies/queries";
import { listPlacementsForCompanyUi } from "@/lib/placements/queries";

import { CompanyPlacementsSection } from "./_components/company-placements-section";
import { CompanyEditDialog } from "../_components/company-edit-dialog";
import { CompanyStatusBadge } from "../_components/company-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageCompanies(session?.user?.role);

  const [company, placements, users] = await Promise.all([
    getCompanyByIdForUi(id),
    listPlacementsForCompanyUi(id),
    canManage ? listUsersForCompanyForm() : Promise.resolve([]),
  ]);

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        variant="detail"
        backHref="/companies"
        backLabel="Back to companies"
        title={company.name}
        description="Account record, placements, and future CRM roll-ups — core fields from PostgreSQL."
        meta={<CompanyStatusBadge status={company.status} />}
        actions={
          canManage ? <CompanyEditDialog company={company} users={users} /> : null
        }
      />

      <DetailGrid
        items={[
          { label: "Industry", value: company.industry || "—" },
          { label: "Location", value: company.location || "—" },
          { label: "Owner", value: company.owner },
        ]}
      />

      <SectionCard
        title="Notes"
        description="Internal context and handoff details for this account."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Rich notes and activity summaries will appear here as the workspace
          grows. The core company record above is stored in PostgreSQL.
        </p>
      </SectionCard>

      <CompanyPlacementsSection placements={placements} />

      <PlaceholderSection
        title="Contacts"
        description="People associated with this company."
      />
      <PlaceholderSection
        title="Opportunities"
        description="Deals and pursuits linked to this account."
      />
      <PlaceholderSection
        title="Activity"
        description="Calls, meetings, and timeline events."
      />
    </div>
  );
}
