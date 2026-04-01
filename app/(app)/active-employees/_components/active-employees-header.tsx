export function ActiveEmployeesHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Active employees
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Placements link candidates to client accounts through vacancies. Active
        and completed assignments are loaded from PostgreSQL.
      </p>
    </div>
  );
}
