import { Badge } from "@/components/ui/badge";
import type { CompanyStatus } from "@/lib/companies/types";

const variantByStatus: Record<
  CompanyStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  Active: "default",
  Prospect: "outline",
  Paused: "secondary",
  Churned: "destructive",
};

export function CompanyStatusBadge({ status }: { status: CompanyStatus }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
