"use client";

import {
  ContactStatus as StatusConst,
  type ContactStatus,
} from "@/generated/prisma/enums";
import type { CompanyOption } from "@/lib/contacts/types";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

const STATUS_LABELS: Record<ContactStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export type ContactFormDefaults = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  companyId: string;
  statusValue: ContactStatus;
};

export function ContactRecordFormFields({
  companies,
  defaults,
  contactId,
  fieldErrors,
  variant = "create",
}: {
  companies: CompanyOption[];
  defaults?: ContactFormDefaults;
  contactId?: string;
  fieldErrors?: Record<string, string>;
  /** `edit` omits correo/teléfono (se gestionan con métodos de contacto). */
  variant?: "create" | "edit";
}) {
  const statusOrder = Object.values(StatusConst) as ContactStatus[];
  const isEdit = variant === "edit";

  return (
    <div className="grid gap-4">
      {contactId ? <input type="hidden" name="contactId" value={contactId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor={contactId ? `edit-first-${contactId}` : "new-first"}
            className="text-sm font-medium"
          >
            Nombre <span className="text-destructive">*</span>
          </label>
          <Input
            id={contactId ? `edit-first-${contactId}` : "new-first"}
            name="firstName"
            required
            maxLength={120}
            defaultValue={defaults?.firstName ?? ""}
            aria-invalid={Boolean(fieldErrors?.firstName)}
          />
          {fieldErrors?.firstName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.firstName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={contactId ? `edit-last-${contactId}` : "new-last"}
            className="text-sm font-medium"
          >
            Apellido
          </label>
          <Input
            id={contactId ? `edit-last-${contactId}` : "new-last"}
            name="lastName"
            maxLength={120}
            defaultValue={defaults?.lastName ?? ""}
            aria-invalid={Boolean(fieldErrors?.lastName)}
          />
          {fieldErrors?.lastName ? (
            <p className="text-sm text-destructive" role="alert">
              {fieldErrors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Empresa <span className="text-destructive">*</span>
        </label>
        <select
          name="companyId"
          required
          className={selectClass}
          defaultValue={defaults?.companyId ?? ""}
          aria-invalid={Boolean(fieldErrors?.companyId)}
        >
          <option value="" disabled>
            Selecciona una empresa…
          </option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {fieldErrors?.companyId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.companyId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Estado <span className="text-destructive">*</span>
        </label>
        <select
          name="status"
          required
          className={selectClass}
          defaultValue={defaults?.statusValue ?? "ACTIVE"}
          aria-invalid={Boolean(fieldErrors?.status)}
        >
          {statusOrder.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        {fieldErrors?.status ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.status}
          </p>
        ) : null}
      </div>

      {!isEdit ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={contactId ? `edit-email-${contactId}` : "new-email"}
              className="text-sm font-medium"
            >
              Correo
            </label>
            <Input
              id={contactId ? `edit-email-${contactId}` : "new-email"}
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={defaults?.email ?? ""}
              aria-invalid={Boolean(fieldErrors?.email)}
            />
            {fieldErrors?.email ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={contactId ? `edit-phone-${contactId}` : "new-phone"}
              className="text-sm font-medium"
            >
              Teléfono
            </label>
            <Input
              id={contactId ? `edit-phone-${contactId}` : "new-phone"}
              name="phone"
              defaultValue={defaults?.phone ?? ""}
              aria-invalid={Boolean(fieldErrors?.phone)}
            />
            {fieldErrors?.phone ? (
              <p className="text-sm text-destructive" role="alert">
                {fieldErrors.phone}
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-muted/25 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
          El correo y teléfono de la ficha son los <span className="font-medium text-foreground">principales</span>
          . Para añadir canales usa <span className="font-medium text-foreground">Agregar dato de contacto</span>
          ; el Director puede revisar el historial completo abajo.
        </p>
      )}

      <div className="space-y-2">
        <label
          htmlFor={contactId ? `edit-title-${contactId}` : "new-title"}
          className="text-sm font-medium"
        >
          Puesto
        </label>
        <Input
          id={contactId ? `edit-title-${contactId}` : "new-title"}
          name="title"
          maxLength={200}
          defaultValue={defaults?.title ?? ""}
          aria-invalid={Boolean(fieldErrors?.title)}
        />
        {fieldErrors?.title ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.title}
          </p>
        ) : null}
      </div>
    </div>
  );
}

