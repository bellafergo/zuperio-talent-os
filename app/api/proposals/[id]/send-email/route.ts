import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { auth } from "@/auth";
import { canSendProposalClientEmail } from "@/lib/auth/proposal-access";
import { prisma } from "@/lib/prisma";
import { generateCandidateCvPdfPackage } from "@/lib/candidates/generate-candidate-cv-pdf";
import {
  getCandidateCvPrintData,
  isSafeCandidateCvPrintData,
} from "@/lib/candidates/get-candidate-cv-print-data";
import { getComparisonMatrixForPair } from "@/lib/matching/queries";
import { sendProposalPackageEmail } from "@/lib/email/send-proposal-package-email";
import { buildProposalEmailHtml } from "@/lib/email/templates/proposal-email";
import { generateProposalPdfPackage } from "@/lib/proposals/generate-proposal-pdf";
import { proposalCandidateCvPdfFilename } from "@/lib/proposals/pdf-filename";
import { resolveAppOriginFromHeaders } from "@/lib/proposals/resolve-app-origin";
import { getProposalByIdForUi } from "@/lib/proposals/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmailArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter((v) => EMAIL_RE.test(v));
  } catch {
    return [];
  }
}

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

  // Parse multipart/form-data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const to = (formData.get("to") as string | null)?.trim() ?? "";
  const cc = parseEmailArray(formData.get("cc") as string | null);
  const bcc = parseEmailArray(formData.get("bcc") as string | null);
  const subjectOverride = (formData.get("subject") as string | null)?.trim() ?? "";
  const bodyText = (formData.get("bodyText") as string | null) ?? "";

  // Extra file attachments (non-blocking; failures are logged, not thrown)
  const extraFileEntries = formData.getAll("extraFile");

  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json(
      { error: 'Valid "to" email is required' },
      { status: 400 },
    );
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

  // Derive role label and subject
  const roleLabel =
    proposal.vacancyTitle !== "—"
      ? proposal.vacancyTitle
      : proposal.opportunityTitle !== "—"
        ? proposal.opportunityTitle
        : "el perfil acordado";

  const subject =
    subjectOverride || `Propuesta de recurso ${roleLabel} · Zuperio`;

  // Sender display name
  const senderName =
    session.user.name?.trim() || session.user.email || "Zuperio";

  // Recipient name from company contacts (non-critical)
  let recipientName = "Cliente";
  try {
    const contact = await prisma.contact.findFirst({
      where: { companyId: proposal.companyId, status: "ACTIVE", email: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { firstName: true, lastName: true },
    });
    if (contact) {
      const name = [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
      if (name) recipientName = name;
    }
  } catch {
    /* non-critical */
  }

  const candidateName =
    proposal.candidateName !== "—" ? proposal.candidateName : "el candidato";

  // candidate.role comes directly from the proposal query — no CV parsing needed
  const candidateRole =
    proposal.candidateRole !== "—" ? proposal.candidateRole : roleLabel;

  // Fetch CV data for seniority/availability/modality (non-critical)
  let seniority = "—";
  let availability = "—";
  let workModality: string | null = null;
  if (proposal.candidateId) {
    try {
      const cvData = await getCandidateCvPrintData(proposal.candidateId);
      if (isSafeCandidateCvPrintData(cvData)) {
        seniority = cvData.seniorityLabel?.trim() || "—";
        availability = cvData.availabilityLabel?.trim() || "—";
        workModality = cvData.workModality?.trim() || null;
      }
    } catch {
      /* non-critical */
    }
  }

  // Fetch skills breakdown for the email table (non-critical)
  let skillBreakdown: { met: { skillId: string; skillName: string }[]; missing: { skillId: string; skillName: string }[] } | null = null;
  if (proposal.candidateId && proposal.vacancyId) {
    try {
      const matrix = await getComparisonMatrixForPair(proposal.candidateId, proposal.vacancyId);
      if (matrix?.skillMatchActive && matrix.skillBreakdown) {
        skillBreakdown = {
          met: matrix.skillBreakdown.met,
          missing: matrix.skillBreakdown.missing,
        };
      }
    } catch {
      /* non-critical */
    }
  }

  const formatLabel =
    typeof proposal.format === "string" && proposal.format.trim()
      ? proposal.format.trim()
      : "tiempo completo";

  const templateDataForHtml = {
    recipientName,
    candidateName,
    candidateRole,
    seniority,
    availability,
    workModality,
    vacancyTitle: roleLabel,
    companyName: proposal.companyName,
    finalMonthlyRate: proposal.finalMonthlyRateLabel,
    finalMonthlyRateWithVAT: proposal.finalMonthlyRateWithVATLabel,
    proposalFormat: formatLabel,
    validityDays: proposal.validityDays,
    senderName,
    currency: proposal.currency,
    skillBreakdown,
  };

  // Build HTML using client-provided bodyText (falls back to generated default if empty)
  const effectiveBodyText = bodyText.trim()
    ? bodyText
    : [
        `Estimado/a ${recipientName},`,
        "",
        `Con gusto le presento a ${candidateName}, ${candidateRole} con nivel ${seniority}, quien consideramos es un match sólido para la vacante de ${roleLabel} en ${proposal.companyName}.`,
        "",
        "A continuación el resumen de la propuesta:",
        "",
        "Adjunto encontrará el CV en formato Zuperio y la propuesta económica detallada para su revisión.",
        "",
        "Quedamos atentos para agendar una sesión de presentación del perfil o resolver cualquier duda.",
        "",
        "Atentamente,",
        senderName,
      ].join("\n");

  const html = buildProposalEmailHtml(templateDataForHtml, effectiveBodyText);

  // Process extra file attachments (non-blocking)
  type ExtraAttachment = { filename: string; content: Buffer };
  const extraAttachments: ExtraAttachment[] = [];
  for (const entry of extraFileEntries.slice(0, 3)) {
    if (!(entry instanceof File)) continue;
    try {
      const buf = Buffer.from(await entry.arrayBuffer());
      extraAttachments.push({ filename: entry.name, content: buf });
    } catch (err) {
      console.warn("[proposal-send-email] extra file processing failed", {
        name: entry instanceof File ? entry.name : "unknown",
        err,
      });
    }
  }

  try {
    const [economic, cv] = await Promise.all([
      generateProposalPdfPackage({ proposalId, cookieHeader: cookie, origin }),
      generateCandidateCvPdfPackage({
        candidateId: proposal.candidateId,
        cookieHeader: cookie,
        origin,
      }),
    ]);

    const cvFilename = proposalCandidateCvPdfFilename(proposal);

    const result = await sendProposalPackageEmail({
      to,
      cc,
      bcc,
      subject,
      html,
      attachments: [
        { filename: economic.filename, content: economic.buffer },
        { filename: cvFilename, content: cv.buffer },
        ...extraAttachments,
      ],
    });

    const prior = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: { sentAt: true },
    });
    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: "SENT", sentAt: prior?.sentAt ?? new Date() },
    });

    revalidatePath("/proposals");
    revalidatePath(`/proposals/${proposalId}`);

    console.info("[proposal-send-email] sent", {
      proposalId,
      to,
      cc,
      bcc,
      extraCount: extraAttachments.length,
      messageId: result.messageId,
    });

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    console.error("[proposal-send-email] failed", { proposalId, to, error: message });

    if (message === "RESEND_API_KEY is not configured") {
      return NextResponse.json(
        { error: "Email is not configured (RESEND_API_KEY)." },
        { status: 503 },
      );
    }

    const status =
      message.toLowerCase().includes("chromium") || message.toLowerCase().includes("pdf")
        ? 503
        : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
