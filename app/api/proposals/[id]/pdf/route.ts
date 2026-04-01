import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { proposalEconomicPdfFilename } from "@/lib/proposals/pdf-filename";
import { renderProposalPdfBuffer } from "@/lib/proposals/render-proposal-pdf";
import { resolveAppOriginFromHeaders } from "@/lib/proposals/resolve-app-origin";
import { getProposalByIdForUi } from "@/lib/proposals/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const proposal = await getProposalByIdForUi(id);
  if (!proposal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const headersList = await headers();
  const cookie = headersList.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: "Missing session cookie" }, { status: 401 });
  }

  const origin = resolveAppOriginFromHeaders(headersList);
  const printUrl = `${origin}/proposals/${id}/document-print`;

  try {
    const buffer = await renderProposalPdfBuffer({
      printPageUrl: printUrl,
      cookieHeader: cookie,
    });

    await prisma.proposal.update({
      where: { id },
      data: { proposalPdfExportedAt: new Date() },
    });

    const filename = proposalEconomicPdfFilename(proposal);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[proposal-pdf]", e);
    return NextResponse.json(
      { error: "PDF generation failed. Ensure Chromium is available (see PUPPETEER_EXECUTABLE_PATH)." },
      { status: 503 },
    );
  }
}
