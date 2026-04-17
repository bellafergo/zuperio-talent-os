"use client";

import { useCandidateOpenProposalDialog } from "./candidate-detail-proposal-context";
import { Button } from "@/components/ui/button";

export function CandidateDetailNewProposalButton() {
  const openProposal = useCandidateOpenProposalDialog();
  return (
    <Button
      type="button"
      variant="outline"
      className="shrink-0"
      onClick={openProposal}
    >
      Crear propuesta
    </Button>
  );
}
