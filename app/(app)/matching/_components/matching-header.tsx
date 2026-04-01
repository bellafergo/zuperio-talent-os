export function MatchingHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Matching
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Candidate–vacancy pairs scored with deterministic rules (seniority,
        availability, skills overlap, role keywords). No AI — same data always
        produces the same score.
      </p>
    </div>
  );
}
