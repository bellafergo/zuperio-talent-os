export function VacanciesHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Vacancies
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Open roles mapped to deals and accounts. Rows are loaded from PostgreSQL;
        filters apply to the current page in the browser.
      </p>
    </div>
  );
}
