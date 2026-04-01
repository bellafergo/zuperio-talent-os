import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { canSendProposalClientEmail } from "@/lib/auth/proposal-access";
import { prisma } from "@/lib/prisma";
import { generateCandidateCvPdfPackage } from "@/lib/candidates/generate-candidate-cv-pdf";
import { sendProposalPackageEmail } from "@/lib/email/send-proposal-package-email";
import { generateProposalPdfPackage } from "@/lib/proposals/generate-proposal-pdf";
import { proposalCandidateCvPdfFilename } from "@/lib/proposals/pdf-filename";
import { resolveAppOriginFromHeaders } from "@/lib/proposals/resolve-app-origin";
import { getProposalByIdForUi } from "@/lib/proposals/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canSendProposalClientEmail(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: proposalId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const to = typeof (body as { to?: unknown }).to === "string"
    ? (body as { to: string }).to.trim()
    : "";
  const subject =
    typeof (body as { subject?: unknown }).subject === "string"
      ? (body as { subject: string }).subject.trim()
      : "";
  const bodyText =
    typeof (body as { body?: unknown }).body === "string"
      ? (body as { body: string }).body
      : "";

  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json({ error: "Valid \"to\" email is required" }, { status: 400 });
  }
  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }
  if (!bodyText.trim()) {
    return NextResponse.json({ error: "Body is required" }, { status: 400 });
  }

  const proposal = await getProposalByIdForUi(proposalId);
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  if (!proposal.candidateId) {
    return NextResponse.json(
      {
        error:
          "This proposal has no candidate linked. Assign a candidate before sending the CV attachment.",
      },
      { status: 400 },
    );
  }

  const headersList = await headers();
  const cookie = headersList.get("cookie");
  if (!cookie) {
    return NextResponse.json({ error: "Missing session cookie" }, { status: 401 });
  }

  const origin = resolveAppOriginFromHeaders(headersList);

  try {
    const economic = await generateProposalPdfPackage({
      proposalId,
      cookieHeader: cookie,
      origin,
    });

    const cv = await generateCandidateCvPdfPackage({
      candidateId: proposal.candidateId,
      cookieHeader: cookie,
      origin,
    });

    const cvFilename = proposalCandidateCvPdfFilename(proposal);

    const result = await sendProposalPackageEmail({
      to,
      subject,
      bodyText,
      attachments: [
        { filename: economic.filename, content: economic.buffer },
        { filename: cvFilename, content: cv.buffer },
      ],
    });

    const prior = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { sentAt: true },
    });
    await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: "SENT",
        sentAt: prior?.sentAt ?? new Date(),
      },
    });

    revalidatePath("/proposals");
    revalidatePath(`/proposals/${proposalId}`);

    console.info("[proposal-send-email] sent", {
      proposalId,
      to,
      messageId: result.messageId,
    });

    return NextResponse.json({
      ok: true,
      messageId: result.messageId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    console.error("[proposal-send-email] failed", {
      proposalId,
      to,
      error: message,
    });

    if (message === "NOT_FOUND") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (message === "RESEND_API_KEY is not configured") {
      return NextResponse.json(
        { error: "Email is not configured (RESEND_API_KEY)." },
        { status: 503 },
      );
    }

    const status =
      message.toLowerCase().includes("chromium") ||
      message.toLowerCase().includes("pdf")
        ? 503
        : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
