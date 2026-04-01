import { TonalBadge } from "@/components/layout";
import type { ContactStatusUi } from "@/lib/contacts/types";

const toneByStatus: Record<ContactStatusUi, "success" | "neutral"> = {
  Active: "success",
  Inactive: "neutral",
};

export function ContactStatusBadge({ status }: { status: ContactStatusUi }) {
  return (
    <TonalBadge tone={toneByStatus[status]} className="whitespace-nowrap">
      {status}
    </TonalBadge>
  );
}
