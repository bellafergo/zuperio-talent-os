export function CandidatesHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Candidates
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Consultant and contractor pool for staff augmentation. Profiles are
        stored in PostgreSQL; matching to vacancies will layer on later.
      </p>
    </div>
  );
}
