export function ContactsHeader() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Contacts
      </h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        People across your accounts. Records are loaded from PostgreSQL; search
        and filters run in the browser on the current page.
      </p>
    </div>
  );
}
