import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canViewCommercialDashboard } from "@/lib/auth/commercial-dashboard-access";
import { resolveDashboardMonthFromSearchParams } from "@/lib/datetime/dashboard-month";
import {
  listActiveVacanciesByCompany,
  listMonthlyCommercialClosures,
  listMonthlyHiredPlacements,
  sumClosureMonthlyValue,
} from "@/lib/dashboard/monthly-queries";
import { safeDashboardQuery } from "@/lib/dashboard/safe-query";
import { formatCurrencyValueSum } from "@/lib/currency";
import {
  emptyCommercialDashboardData,
  getCommercialDashboardData,
} from "@/lib/proposals/commercial-dashboard-queries";

import { DashboardMonthControls } from "./_components/dashboard-month-controls";

import {
  EmptyState,
  KPIStatCard,
  PageHeader,
  SectionCard,
  SectionHeading,
} from "@/components/layout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  PricingScheme,
  ProposalFormat,
  ProposalStatus,
} from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

function statusLabel(s: ProposalStatus): string {
  const m: Record<ProposalStatus, string> = {
    DRAFT: "Borrador",
    SENT: "Enviada",
    VIEWED: "Vista",
    IN_NEGOTIATION: "En negociación",
    WON: "Ganada",
    LOST: "Pérdida",
  };
  return m[s];
}

function formatScheme(s: PricingScheme): string {
  return s === "FULL_IMSS" ? "IMSS completo" : "Mixto";
}

function formatFormat(f: ProposalFormat): string {
  return f === "DETAILED" ? "Detallada" : "Sencilla";
}

function formatSentAt(d: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(d);
}

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CommercialDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!canViewCommercialDashboard(session.user.role)) {
    redirect("/");
  }

  const sp = await searchParams;
  const period = resolveDashboardMonthFromSearchParams(sp);
  const isDirector = session.user.role === "DIRECTOR";

  const d = await safeDashboardQuery(
    "getCommercialDashboardData",
    () => getCommercialDashboardData(),
    emptyCommercialDashboardData(),
  );

  const monthlyClosures = await safeDashboardQuery(
    "listMonthlyCommercialClosures",
    () => listMonthlyCommercialClosures(period),
    [],
  );

  const monthlyHires = await safeDashboardQuery(
    "listMonthlyHiredPlacements",
    () => listMonthlyHiredPlacements(period),
    [],
  );

  const activeVacanciesByCompany = await safeDashboardQuery(
    "listActiveVacanciesByCompany",
    () => listActiveVacanciesByCompany(),
    [],
  );

  const closureMonthValue = sumClosureMonthlyValue(monthlyClosures);

  const fmtSum = (b: Parameters<typeof formatCurrencyValueSum>[0]) =>
    formatCurrencyValueSum(b, 0);
  const pct = (n: number | null) =>
    n == null ? "—" : `${n.toFixed(1).replace(".", ",")}%`;

  return (
    <>
      <PageHeader
        variant="list"
        eyebrow="Comercial"
        title="Tablero"
        description="Embudo de propuestas e importes según precios guardados. El periodo seleccionado aplica al resumen mensual, contrataciones y reportes CSV (Dirección). Las tablas de embudo siguen siendo la vista global. Sin conversión de divisa: MXN y USD por separado."
      />

      <DashboardMonthControls
        year={period.year}
        month={period.month}
        periodLabel={period.label}
        isDirector={isDirector}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title={`Cierres comerciales (${period.label})`}
          description="Propuestas ganadas (WON) con fecha de cierre en el mes UTC, o filas históricas sin fecha de cierre cuyo último cambio cayó en el mes (referencia aproximada)."
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <KPIStatCard
              label="Cierres del mes"
              value={String(monthlyClosures.length)}
              emphasis={monthlyClosures.length > 0}
            />
            <KPIStatCard
              label="Valor tarifa mensual (cierres)"
              value={formatCurrencyValueSum(closureMonthValue, 0)}
              emphasis
            />
          </div>
          {monthlyClosures.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay cierres registrados para este mes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Candidato</TableHead>
                  <TableHead className="text-right">Tarifa / mes</TableHead>
                  <TableHead className="hidden sm:table-cell">Referencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyClosures.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/proposals/${r.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {r.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.candidateLabel}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {r.finalMonthlyRate != null
                        ? `${r.currency} ${r.finalMonthlyRate.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                      {r.hasPreciseClosureAt ? "Cierre registrado" : "Legacy (updatedAt)"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard
          title={`Contrataciones (${period.label})`}
          description="Colocaciones cuya fecha de inicio cae en el mes (UTC), cualquier estado actual."
        >
          <div className="mb-4">
            <KPIStatCard
              label="Inicios en el mes"
              value={String(monthlyHires.length)}
              emphasis={monthlyHires.length > 0}
            />
          </div>
          {monthlyHires.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay inicios de colocación en este mes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Vacante</TableHead>
                  <TableHead className="text-right">Inicio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyHires.map((r) => (
                  <TableRow key={r.placementId}>
                    <TableCell className="font-medium">{r.candidateName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.companyName}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground" title={r.vacancyTitle}>
                      {r.vacancyTitle}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {new Intl.DateTimeFormat("es-MX", {
                        dateStyle: "medium",
                        timeZone: "UTC",
                      }).format(r.startDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Vacantes activas por empresa"
        description="Estado actual (abierta, sourcing, entrevista, en pausa). No es un corte histórico por mes."
      >
        {activeVacanciesByCompany.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay vacantes activas en este momento.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Vacantes</TableHead>
                <TableHead className="hidden md:table-cell">Títulos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeVacanciesByCompany.map((r) => (
                <TableRow key={r.companyId}>
                  <TableCell className="font-medium">
                    {r.companyId !== "_unknown" ? (
                      <Link
                        href={`/companies/${r.companyId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {r.companyName}
                      </Link>
                    ) : (
                      r.companyName
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="hidden max-w-[min(100%,28rem)] text-sm text-muted-foreground md:table-cell">
                    <span className="line-clamp-2" title={r.titles.join(", ")}>
                      {r.titles.slice(0, 6).join(" · ")}
                      {r.titles.length > 6 ? ` (+${r.titles.length - 6})` : ""}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <div className="space-y-10 rounded-2xl border border-border/70 bg-gradient-to-b from-muted/40 via-muted/15 to-transparent p-5 ring-1 ring-foreground/[0.04] sm:p-6">
        <section className="space-y-4">
          <SectionHeading
            title="Embudo global por etapa"
            prominence="lead"
            description="Todas las propuestas en sistema; mismas definiciones que el listado de propuestas."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <KPIStatCard label="Total" value={String(d.counts.total)} />
            <KPIStatCard label="Borrador" value={String(d.counts.draft)} />
            <KPIStatCard label="Enviadas" value={String(d.counts.sent)} />
            <KPIStatCard label="Vistas" value={String(d.counts.viewed)} />
            <KPIStatCard
              label="Seguimiento"
              value={String(d.counts.followUpPending)}
              emphasis={d.counts.followUpPending > 0}
            />
            <KPIStatCard
              label="En negociación"
              value={String(d.counts.inNegotiation)}
            />
            <KPIStatCard label="Ganadas" value={String(d.counts.won)} emphasis />
            <KPIStatCard label="Perdidas" value={String(d.counts.lost)} />
          </div>
          <p className="text-xs text-muted-foreground">
            Vistas: {d.counts.viewed} · Seguimiento: enviada y más de 2 días sin
            actualizar (igual que en propuestas).
          </p>
        </section>

        <section className="space-y-4 border-t border-border/60 pt-10">
          <SectionHeading
            title="Ingresos (tarifa mensual)"
            prominence="lead"
            description="Suma de tarifa final donde hay precios. Embudo (no perdidas) incluye borrador, enviada, vista, negociación y ganada. Perdidas aparte."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStatCard
              label="Embudo (no perdidas)"
              value={fmtSum(d.revenue.pipelineNonLost)}
              emphasis
            />
            <KPIStatCard
              label="Enviadas (valor)"
              value={fmtSum(d.revenue.pipelineSent)}
            />
            <KPIStatCard
              label="Negociación (valor)"
              value={fmtSum(d.revenue.pipelineNegotiation)}
            />
            <KPIStatCard
              label="Ganadas (valor)"
              value={fmtSum(d.revenue.won)}
              emphasis
            />
            <KPIStatCard label="Perdidas (valor)" value={fmtSum(d.revenue.lost)} />
            <KPIStatCard
              label="Margen medio %"
              value={pct(d.revenue.avgMarginPercent)}
            />
            <KPIStatCard
              label="Valor medio (nominal)"
              value={
                d.revenue.avgProposalValue == null
                  ? "—"
                  : (Math.round(d.revenue.avgProposalValue * 100) / 100).toLocaleString(
                      "es-MX",
                      { maximumFractionDigits: 0 },
                    )
              }
            />
          </div>
          <p className="text-xs text-muted-foreground">
            El valor medio es aritmético sin tipo de cambio; úsalo solo como referencia
            si mezclas monedas.
          </p>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Por estado"
          description="Conteo y suma de tarifa mensual (MXN / USD por separado)"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byStatus.map((r) => (
                <TableRow key={r.status}>
                  <TableCell>{statusLabel(r.status)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtSum(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard
          title="Por empresa"
          description="Top 15 por valor en este conjunto de propuestas"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byCompany.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Sin propuestas aún.
                  </TableCell>
                </TableRow>
              ) : (
                d.byCompany.map((r) => (
                  <TableRow key={r.companyId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/companies/${r.companyId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {r.companyName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {fmtSum(r.valueSum)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Por responsable"
          description="Usuario que creó la propuesta"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byOwner.map((r) => (
                <TableRow key={r.userId ?? "none"}>
                  <TableCell>{r.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtSum(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="Por formato">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formato</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byFormat.map((r) => (
                <TableRow key={r.format}>
                  <TableCell>{formatFormat(r.format)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtSum(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>

        <SectionCard title="Por esquema de precios">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Esquema</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.byScheme.map((r) => (
                <TableRow key={r.scheme}>
                  <TableCell>{formatScheme(r.scheme)}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.count}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtSum(r.valueSum)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </SectionCard>
      </div>

      <SectionCard
        title="Seguimiento pendiente"
        description={
          <>
            Estado enviada y más de 2 días desde{" "}
            <span className="font-medium text-foreground">fecha de envío</span>{" "}
            — primero las más antiguas
          </>
        }
      >
        {d.followUps.length === 0 ? (
          <EmptyState
            variant="embedded"
            title="Ninguna por ahora"
            description="No hay propuestas en ventana de seguimiento."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propuesta</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead className="text-right">Seguimientos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.followUps.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/proposals/${r.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      Abrir
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.companyName}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatSentAt(r.sentAt)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.followUpCount}
                  </TableCell>
                  <TableCell>{statusLabel(r.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </>
  );
}
