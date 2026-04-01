import { PageHeader } from "@/components/layout";

export function MatchingHeader({ pairCount }: { pairCount: number }) {
  return (
    <PageHeader
      variant="list"
      eyebrow="Talent matching"
      title="Matching"
      description="Candidate–vacancy pairs scored from structured skills (requirements vs profile), seniority, availability (including active placements elsewhere), and role keywords. No AI — same inputs always yield the same score."
      meta={
        <span className="text-sm tabular-nums text-muted-foreground">
          {pairCount === 0
            ? "No scored pairs in catalog"
            : `${pairCount.toLocaleString()} scored ${pairCount === 1 ? "pair" : "pairs"}`}
        </span>
      }
    />
  );
}
