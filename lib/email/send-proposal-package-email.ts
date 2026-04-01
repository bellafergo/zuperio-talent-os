import { Resend } from "resend";

export type EmailAttachmentInput = {
  filename: string;
  content: Buffer;
};

/**
 * Sends a plain-text email with PDF attachments via Resend.
 * Configure RESEND_API_KEY and EMAIL_FROM (verified sender).
 */
export async function sendProposalPackageEmail(opts: {
  to: string;
  subject: string;
  bodyText: string;
  attachments: EmailAttachmentInput[];
}): Promise<{ messageId: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from =
    process.env.EMAIL_FROM?.trim() ||
    "Zuperio Talent OS <onboarding@resend.dev>";

  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from,
    to: [opts.to],
    subject: opts.subject,
    text: opts.bodyText,
    attachments: opts.attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if (error) {
    throw new Error(error.message);
  }
  if (!data?.id) {
    throw new Error("Resend did not return a message id");
  }

  return { messageId: data.id };
}
