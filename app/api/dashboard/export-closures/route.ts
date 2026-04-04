import { auth } from "@/auth";
import { CSV_UTF8_BOM, csvRow } from "@/lib/csv/format-csv";
import { resolveDashboardMonthFromSearchParams } from "@/lib/datetime/dashboard-month";
import { listMonthlyCommercialClosures } from "@/lib/dashboard/monthly-queries";

export const dynamic = "force-dynamic";

function searchParamsRecord(sp: URLSearchParams): Record<string, string | undefined> {
  return {
    month: sp.get("month") ?? undefined,
    year: sp.get("year") ?? undefined,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "DIRECTOR") {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const period = resolveDashboardMonthFromSearchParams(
    searchParamsRecord(searchParams),
  );

  let rows;
  try {
    rows = await listMonthlyCommercialClosures(period);
  } catch (err) {
    console.error("[export-closures]", err);
    return new Response("Error al generar el reporte.", { status: 500 });
  }

  const header = csvRow([
    "propuesta_id",
    "empresa",
    "moneda",
    "tarifa_mensual",
    "candidato",
    "fecha_referencia_utc",
    "tipo_fecha",
  ]);

  const body = rows
    .map((r) =>
      csvRow([
        r.id,
        r.companyName,
        r.currency,
        r.finalMonthlyRate != null ? String(r.finalMonthlyRate) : "",
        r.candidateLabel,
        r.closureReferenceAt.toISOString(),
        r.hasPreciseClosureAt ? "cierre_registrado" : "legacy_actualizado",
      ]),
    )
    .join("");

  const filename = `cierres_comerciales_${period.year}-${String(period.month).padStart(2, "0")}.csv`;

  return new Response(CSV_UTF8_BOM + header + body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
