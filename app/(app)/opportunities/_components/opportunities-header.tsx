export function OpportunitiesHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Opportunities
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Pipeline and deal tracking tied to accounts. Data comes from PostgreSQL;
        search and filters apply to the loaded page.
      </p>
    </div>
  );
}
