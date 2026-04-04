"use client";

import { DetailRouteError } from "@/components/detail-route-error";

export default function ProposalDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <DetailRouteError
      error={error}
      reset={reset}
      backHref="/proposals"
      backLabel="Volver a propuestas"
      contextTitle="esta propuesta"
    />
  );
}
