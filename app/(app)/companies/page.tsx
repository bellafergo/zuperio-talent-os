import { CompaniesHeader } from "./_components/companies-header";
import { CompaniesModule } from "./_components/companies-module";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <CompaniesHeader />
      <CompaniesModule />
    </div>
  );
}
