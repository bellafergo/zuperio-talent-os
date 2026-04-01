"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";

import { ProposalStatus as StatusConst, type ProposalStatus } from "@/generated/prisma/enums";

import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: { value: ProposalStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  ...(
    [
      "DRAFT",
      "SENT",
      "VIEWED",
      "IN_NEGOTIATION",
      "WON",
      "LOST",
    ] as const satisfies readonly ProposalStatus[]
  ).map((value) => ({
    value,
    label: STATUS_LABEL(value),
  })),
];

function STATUS_LABEL(s: ProposalStatus): string {
  const map: Record<ProposalStatus, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    VIEWED: "Vista",
    IN_NEGOTIATION: "En negociación",
    WON: "Ganada",
    LOST: "Perdida",
  };
  return map[s];
}

export function ProposalsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";
  const followUp = searchParams.get("followUp") === "1";

  const setQuery = useCallback(
    (next: { status?: string; followUp?: boolean }) => {
      const p = new URLSearchParams(searchParams.toString());
      const st = next.status !== undefined ? next.status : status;
      const fu = next.followUp !== undefined ? next.followUp : followUp;

      if (st && Object.values(StatusConst).includes(st as ProposalStatus)) {
        p.set("status", st);
      } else {
        p.delete("status");
      }
      if (fu) p.set("followUp", "1");
      else p.delete("followUp");

      startTransition(() => {
        router.push(`/proposals?${p.toString()}`);
      });
    },
    [router, searchParams, status, followUp],
  );

  const selectClass = useMemo(
    () =>
      "h-8 rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 dark:bg-input/30",
    [],
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="shrink-0">Estado</span>
        <select
          className={selectClass}
          disabled={pending}
          value={status}
          onChange={(e) => setQuery({ status: e.target.value })}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.label + String(o.value)} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          className="size-3.5 rounded border-input"
          checked={followUp}
          disabled={pending}
          onChange={(e) => setQuery({ followUp: e.target.checked })}
        />
        Seguimiento pendiente (&gt;2 días desde envío)
      </label>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 text-muted-foreground"
        disabled={pending || (!status && !followUp)}
        onClick={() => {
          startTransition(() => router.push("/proposals"));
        }}
      >
        Limpiar filtros
      </Button>
    </div>
  );
}
