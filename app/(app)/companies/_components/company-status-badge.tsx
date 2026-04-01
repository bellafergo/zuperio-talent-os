import { TonalBadge } from "@/components/layout";
import type { CompanyStatus } from "@/lib/companies/types";

const toneByStatus: Record<
  CompanyStatus,
  "success" | "neutral" | "warning" | "danger"
> = {
  Activa: "success",
  Prospecto: "neutral",
  "En pausa": "warning",
  Baja: "danger",
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return (
    <TonalBadge tone={toneByStatus[status]} className="whitespace-nowrap">
      {status}
    </TonalBadge>
  );
}
