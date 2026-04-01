import { Badge } from "@/components/ui/badge";
import type { ContactStatusUi } from "@/lib/contacts/types";

const variantByStatus: Record<
  ContactStatusUi,
  "default" | "secondary" | "outline"
> = {
  Active: "default",
  Inactive: "secondary",
};

export function ContactStatusBadge({ status }: { status: ContactStatusUi }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
