"use client";

import { DetailRouteError } from "@/components/detail-route-error";

export default function CandidateDetailError({
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
      backHref="/candidates"
      backLabel="Volver a candidatos"
      contextTitle="este candidato"
    />
  );
}
