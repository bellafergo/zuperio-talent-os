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
import { listContactsForCompanyUi } from "@/lib/contacts/queries";
import { listOpportunitiesForCompanyUi } from "@/lib/opportunities/queries";
import { listPlacementsForCompanyUi } from "@/lib/placements/queries";
import { listVacanciesForCompanyUi } from "@/lib/vacancies/queries";

import { CompanyContactsSection } from "./_components/company-contacts-section";
import { CompanyOpportunitiesSection } from "./_components/company-opportunities-section";
import { CompanyPlacementsSection } from "./_components/company-placements-section";
import { CompanyVacanciesSection } from "./_components/company-vacancies-section";
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

  const [company, placements, opportunities, vacancies, contacts, users] =
    await Promise.all([
      getCompanyByIdForUi(id),
      listPlacementsForCompanyUi(id),
      listOpportunitiesForCompanyUi(id),
      listVacanciesForCompanyUi(id),
      listContactsForCompanyUi(id),
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
        backLabel="Volver a empresas"
        title={company.name}
        description="Cuenta, colocaciones y futuros roll-ups de CRM: campos principales en PostgreSQL."
        meta={<CompanyStatusBadge status={company.status} />}
        actions={
          canManage ? <CompanyEditDialog company={company} users={users} /> : null
        }
      />

      <DetailGrid
        items={[
          { label: "Industria", value: company.industry || "—" },
          { label: "Ubicación", value: company.location || "—" },
          { label: "Responsable", value: company.owner },
        ]}
      />

      <SectionCard
        title="Notas"
        description="Contexto interno y detalles de handoff de la cuenta."
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Notas enriquecidas y resúmenes de actividad aparecerán aquí a medida
          crezca el workspace. El registro principal de la empresa arriba está en
          PostgreSQL.
        </p>
      </SectionCard>

      <CompanyPlacementsSection placements={placements} />

      <CompanyContactsSection contacts={contacts} />

      <CompanyOpportunitiesSection opportunities={opportunities} />

      <CompanyVacanciesSection vacancies={vacancies} />

      <PlaceholderSection
        title="Actividad"
        description="Llamadas, reuniones y eventos de línea de tiempo."
      />
    </div>
  );
}
