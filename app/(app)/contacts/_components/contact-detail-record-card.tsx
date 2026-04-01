import Link from "next/link";

import {
  Building2Icon,
  BriefcaseIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

function PrimaryChannel({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof MailIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const empty = value === "—" || !value.trim();

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-gradient-to-b from-muted/30 to-muted/5 p-4 shadow-sm",
        "ring-1 ring-foreground/[0.04]",
      )}
    >
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="size-3.5 opacity-80" aria-hidden />
        {label}
      </div>
      {empty ? (
        <p className="text-base text-muted-foreground">Sin dato principal</p>
      ) : href ? (
        <a
          href={href}
          className="text-lg font-semibold leading-snug tracking-tight text-foreground underline-offset-4 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-lg font-semibold leading-snug tracking-tight text-foreground break-all">
          {value}
        </p>
      )}
    </div>
  );
}

/**
 * Commercial-friendly CRM block: empresa, puesto, última actualización, canales principales.
 */
export function ContactDetailRecordCard({
  companyName,
  companyId,
  title,
  email,
  phone,
  updatedAtLabel,
}: {
  companyName: string;
  companyId: string;
  title: string;
  email: string;
  phone: string;
  updatedAtLabel: string;
}) {
  const emailRaw = email === "—" ? "" : email.trim();
  const phoneRaw = phone === "—" ? "" : phone.trim();

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-foreground/[0.04]">
      <div className="border-b border-border/80 bg-muted/15 px-5 py-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Resumen del contacto
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Empresa</p>
              <Link
                href={`/companies/${companyId}`}
                className="inline-flex max-w-full items-center gap-2 text-base font-semibold text-foreground underline-offset-4 hover:underline"
              >
                <Building2Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="break-words">{companyName}</span>
              </Link>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Puesto</p>
              <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <BriefcaseIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span>{title === "—" ? "—" : title}</span>
              </p>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-border/60 bg-background px-3 py-2.5 sm:text-right">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Última actualización
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold tabular-nums text-foreground sm:justify-end">
              <ClockIcon className="size-3.5 text-muted-foreground sm:order-2" aria-hidden />
              <span>{updatedAtLabel}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Canales principales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <PrimaryChannel
            icon={MailIcon}
            label="Correo principal"
            value={email}
            href={emailRaw ? `mailto:${emailRaw}` : undefined}
          />
          <PrimaryChannel
            icon={PhoneIcon}
            label="Teléfono principal"
            value={phone}
            href={phoneRaw ? `tel:${phoneRaw.replace(/\s/g, "")}` : undefined}
          />
        </div>
      </div>
    </section>
  );
}
