import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { canViewCommercialDashboard } from "@/lib/auth/commercial-dashboard-access";
import { formatCurrencyValueSum } from "@/lib/currency";
import { getCommercialDashboardData } from "@/lib/proposals/commercial-dashboard-queries";

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
    LOST: "Perdida",
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

export default async function CommercialDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (!canViewCommercialDashboard(session.user.role)) {
    redirect("/");
  }

  const d = await getCommercialDashboardData();

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
        description="Embudo de propuestas e importes mensuales según precios guardados. Sin conversión de divisa: MXN y USD se muestran por separado."
      />

      <div className="space-y-10 rounded-2xl border border-border/70 bg-gradient-to-b from-muted/40 via-muted/15 to-transparent p-5 ring-1 ring-foreground/[0.04] sm:p-6">
        <section className="space-y-4">
          <SectionHeading
            title="Embudo por etapa"
            prominence="lead"
            description="Mismas definiciones que el listado de propuestas."
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
            description="Suma de tarifa final donde hay precios. Pipeline (no perdidas) incluye borrador, enviada, vista, negociación y ganada. Perdidas aparte."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KPIStatCard
              label="Pipeline (no perdidas)"
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
