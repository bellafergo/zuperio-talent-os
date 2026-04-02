import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { pdfAttachmentHeaders } from "@/lib/pdf/pdf-download-headers";
import { generateProposalPdfPackage } from "@/lib/proposals/generate-proposal-pdf";
import { resolveAppOriginFromHeaders } from "@/lib/proposals/resolve-app-origin";

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

  const headersList = await headers();
  const cookie = headersList.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: "Missing session cookie" }, { status: 401 });
  }

  const origin = resolveAppOriginFromHeaders(headersList);

  try {
    const { buffer, filename } = await generateProposalPdfPackage({
      proposalId: id,
      cookieHeader: cookie,
      origin,
    });

    if (!buffer?.length) {
      console.error("[proposal-pdf] empty buffer", { id, origin });
      return NextResponse.json(
        { error: "PDF generation produced an empty file." },
        { status: 503 },
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: pdfAttachmentHeaders(filename),
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const message = e instanceof Error ? e.message : String(e);
    console.error("[proposal-pdf] generation failed", {
      id,
      origin,
      message,
      stack: e instanceof Error ? e.stack : undefined,
    });
    return NextResponse.json(
      {
        error:
          "PDF generation failed. Ensure Chromium is available (see PUPPETEER_EXECUTABLE_PATH). Check server logs for [pdf-render] / [proposal-pdf].",
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 503 },
    );
  }
}
