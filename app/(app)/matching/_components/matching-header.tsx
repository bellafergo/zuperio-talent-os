import { PageHeader } from "@/components/layout";

export function MatchingHeader() {
  return (
    <PageHeader
      variant="list"
      title="Matching"
      description="Candidate–vacancy pairs scored from structured skills (requirements vs profile), seniority, availability (including active placements elsewhere), and role keywords. No AI — same inputs always yield the same score."
    />
  );
}
