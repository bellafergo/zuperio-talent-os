import { auth } from "@/auth";
import { CSV_UTF8_BOM, csvRow } from "@/lib/csv/format-csv";
import { resolveDashboardMonthFromSearchParams } from "@/lib/datetime/dashboard-month";
import { listMonthlyHiredPlacements } from "@/lib/dashboard/monthly-queries";

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
    rows = await listMonthlyHiredPlacements(period);
  } catch (err) {
    console.error("[export-hires]", err);
    return new Response("Error al generar el reporte.", { status: 500 });
  }

  const header = csvRow([
    "placement_id",
    "candidato",
    "empresa",
    "vacante",
    "fecha_inicio_utc",
    "estado_colocacion",
  ]);

  const body = rows
    .map((r) =>
      csvRow([
        r.placementId,
        r.candidateName,
        r.companyName,
        r.vacancyTitle,
        r.startDate.toISOString(),
        r.status,
      ]),
    )
    .join("");

  const filename = `contrataciones_${period.year}-${String(period.month).padStart(2, "0")}.csv`;

  return new Response(CSV_UTF8_BOM + header + body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
