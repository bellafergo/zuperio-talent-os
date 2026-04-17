import { getResendClient } from "./resend-client";

export type EmailAttachmentInput = {
  filename: string;
  content: Buffer;
};

/**
 * Sends an HTML email with PDF attachments via Resend.
 * Configure RESEND_API_KEY and optionally EMAIL_FROM (verified sender).
 * From is always Zuperio <admin@zuperio.com.mx>.
 */
export async function sendProposalPackageEmail(opts: {
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  attachments: EmailAttachmentInput[];
}): Promise<{ messageId: string }> {
  const resend = getResendClient();

  const from = "Zuperio <admin@zuperio.com.mx>";

  const { data, error } = await resend.emails.send({
    from,
    to: [opts.to],
    ...(opts.cc && opts.cc.length > 0 ? { cc: opts.cc } : {}),
    ...(opts.bcc && opts.bcc.length > 0 ? { bcc: opts.bcc } : {}),
    subject: opts.subject,
    html: opts.html,
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
