import {
  CompanyStatus as CompanyStatusConst,
  type CompanyStatus as CompanyStatusEnum,
} from "@/generated/prisma/enums";
import type { CompanyOwnerOption } from "@/lib/companies/queries";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<CompanyStatusEnum, string> = {
  ACTIVE: "Active",
  PROSPECT: "Prospect",
  PAUSED: "Paused",
  CHURNED: "Churned",
};

const selectClass = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  "dark:bg-input/30",
);

type Defaults = {
  name: string;
  industry: string;
  location: string;
  statusValue: CompanyStatusEnum;
  ownerId: string | null;
};

export function CompanyRecordFormFields({
  users,
  defaults,
  companyId,
  fieldErrors,
}: {
  users: CompanyOwnerOption[];
  defaults?: Defaults;
  companyId?: string;
  fieldErrors?: Record<string, string>;
}) {
  const statusOrder = Object.values(CompanyStatusConst) as CompanyStatusEnum[];

  return (
    <div className="grid gap-4">
      {companyId ? (
        <input type="hidden" name="companyId" value={companyId} />
      ) : null}

      <div className="space-y-2">
        <label htmlFor={companyId ? `edit-name-${companyId}` : "new-name"} className="text-sm font-medium">
          Name <span className="text-destructive">*</span>
        </label>
        <Input
          id={companyId ? `edit-name-${companyId}` : "new-name"}
          name="name"
          required
          maxLength={200}
          defaultValue={defaults?.name ?? ""}
          aria-invalid={Boolean(fieldErrors?.name)}
        />
        {fieldErrors?.name ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={companyId ? `edit-industry-${companyId}` : "new-industry"}
          className="text-sm font-medium"
        >
          Industry
        </label>
        <Input
          id={companyId ? `edit-industry-${companyId}` : "new-industry"}
          name="industry"
          maxLength={200}
          defaultValue={defaults?.industry ?? ""}
          aria-invalid={Boolean(fieldErrors?.industry)}
        />
        {fieldErrors?.industry ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.industry}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={companyId ? `edit-location-${companyId}` : "new-location"}
          className="text-sm font-medium"
        >
          Location
        </label>
        <Input
          id={companyId ? `edit-location-${companyId}` : "new-location"}
          name="location"
          maxLength={200}
          defaultValue={defaults?.location ?? ""}
          aria-invalid={Boolean(fieldErrors?.location)}
        />
        {fieldErrors?.location ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.location}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={companyId ? `edit-status-${companyId}` : "new-status"}
          className="text-sm font-medium"
        >
          Status <span className="text-destructive">*</span>
        </label>
        <select
          id={companyId ? `edit-status-${companyId}` : "new-status"}
          name="status"
          required
          className={selectClass}
          defaultValue={defaults?.statusValue ?? "PROSPECT"}
          aria-invalid={Boolean(fieldErrors?.status)}
        >
          {statusOrder.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        {fieldErrors?.status ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.status}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label
          htmlFor={companyId ? `edit-owner-${companyId}` : "new-owner"}
          className="text-sm font-medium"
        >
          Owner
        </label>
        <select
          id={companyId ? `edit-owner-${companyId}` : "new-owner"}
          name="ownerId"
          className={selectClass}
          defaultValue={defaults?.ownerId ?? ""}
          aria-invalid={Boolean(fieldErrors?.ownerId)}
        >
          <option value="">No owner</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name?.trim() || u.email}
            </option>
          ))}
        </select>
        {fieldErrors?.ownerId ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldErrors.ownerId}
          </p>
        ) : null}
      </div>
    </div>
  );
}
