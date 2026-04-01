import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { canManageContacts } from "@/lib/auth/contact-access";
import { getContactByIdForUi, listCompaniesForContactForm } from "@/lib/contacts/queries";

import { ContactEditDialog } from "../_components/contact-edit-dialog";
import { ContactStatusBadge } from "../_components/contact-status-badge";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const canManage = canManageContacts(session?.user?.role);

  const [contact, companies] = await Promise.all([
    getContactByIdForUi(id),
    canManage ? listCompaniesForContactForm() : Promise.resolve([]),
  ]);

  if (!contact) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/contacts"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4 shrink-0" aria-hidden />
        Back to contacts
      </Link>

      <div className="space-y-1">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {contact.displayName}
            </h1>
            <ContactStatusBadge status={contact.status} />
          </div>
          {canManage ? <ContactEditDialog contact={contact} companies={companies} /> : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Person record · loaded from database
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Title / role" value={contact.title} />
        <DetailField label="Email" value={contact.email} />
        <DetailField label="Phone" value={contact.phone} />
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5">
        <p className="text-xs font-medium text-muted-foreground">Company</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          <Link
            href={`/companies/${contact.companyId}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {contact.companyName}
          </Link>
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-medium">Notes</CardTitle>
          <CardDescription>
            Context, preferences, and conversation history.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Notes and timeline entries will live here as the CRM layer grows.
            Core contact fields above are stored in PostgreSQL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-foreground/5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
