import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { generateCandidateCvPdfPackage } from "@/lib/candidates/generate-candidate-cv-pdf";
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
    const { buffer, filename } = await generateCandidateCvPdfPackage({
      candidateId: id,
      cookieHeader: cookie,
      origin,
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    if (e instanceof Error && e.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[candidate-cv-pdf]", e);
    return NextResponse.json(
      {
        error:
          "PDF generation failed. Ensure Chromium is available (see PUPPETEER_EXECUTABLE_PATH).",
      },
      { status: 503 },
    );
  }
}
