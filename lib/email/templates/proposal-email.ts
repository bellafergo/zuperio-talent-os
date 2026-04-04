export type ProposalEmailTemplateData = {
  recipientName: string;
  candidateName: string;
  roleLabel: string;
  companyName: string;
  finalMonthlyRate: string;
  finalMonthlyRateWithVAT: string;
  validityDays: number;
  senderName: string;
  currency: string;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Default plain-text body shown in the editor and used when the user hasn't edited anything. */
export function buildDefaultBodyText(data: ProposalEmailTemplateData): string {
  return [
    `Estimado/a ${data.recipientName},`,
    "",
    `Le compartimos nuestra propuesta para ${data.candidateName}, orientada a ${data.roleLabel} con ${data.companyName}.`,
    "",
    `Vigencia de esta propuesta: ${data.validityDays} días desde la fecha de emisión.`,
    "",
    "Adjunto encontrará la propuesta económica detallada y el CV del candidato en formato Zuperio.",
    "",
    "Quedamos atentos para una sesión de revisión cuando le sea conveniente.",
    "",
    "Saludos cordiales,",
    data.senderName,
  ].join("\n");
}

/**
 * Builds the full HTML email.
 * - Header band (blue #1D6BE5) — fixed
 * - bodyText (editable, \n → paragraphs) — center section
 * - Candidate profile block — fixed
 * - Pricing block — fixed
 * - Footer — fixed
 */
export function buildProposalEmailHtml(
  data: ProposalEmailTemplateData,
  bodyText: string,
): string {
  const candidateName = esc(data.candidateName);
  const roleLabel = esc(data.roleLabel);
  const companyName = esc(data.companyName);
  const finalMonthlyRate = esc(data.finalMonthlyRate);
  const finalMonthlyRateWithVAT = esc(data.finalMonthlyRateWithVAT);
  const currency = esc(data.currency);
  const validityDays = String(data.validityDays);

  const bodyHtml = bodyText
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p style="margin:0 0 12px;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">${esc(line)}</p>`
        : `<p style="margin:0 0 8px;">&nbsp;</p>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Propuesta comercial · Zuperio</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background-color:#f4f6f9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" width="600" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.10);">

          <!-- Header (fixed) -->
          <tr>
            <td style="background-color:#1D6BE5;padding:28px 32px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                      <tr>
                        <td style="vertical-align:middle;padding-right:10px;">
                          <div style="width:34px;height:34px;background-color:#ffffff;border-radius:7px;text-align:center;line-height:34px;font-size:18px;font-weight:900;color:#1D6BE5;font-family:Arial,sans-serif;display:inline-block;">Z</div>
                        </td>
                        <td style="vertical-align:middle;">
                          <span style="font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.12em;font-family:Arial,sans-serif;">ZUPERIO</span>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:14px 0 2px;font-size:23px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;line-height:1.2;">Propuesta comercial</p>
                    <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.82);font-family:Arial,sans-serif;">${roleLabel} &middot; ${companyName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editable body text -->
          <tr>
            <td style="padding:32px 32px 0;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Candidate profile block (fixed) -->
          <tr>
            <td style="padding:20px 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 5px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Perfil del candidato</p>
                    <p style="margin:0 0 5px;font-size:19px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">${candidateName}</p>
                    <p style="margin:0;font-size:13px;color:#4b5563;font-family:Arial,sans-serif;">${roleLabel} &middot; ${companyName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pricing block (fixed) -->
          <tr>
            <td style="padding:16px 32px 28px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
                <tr>
                  <td width="50%" style="padding-right:8px;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background-color:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Tarifa mensual · Sin IVA</p>
                          <p style="margin:0;font-size:21px;font-weight:700;color:#1e40af;font-family:Arial,sans-serif;">${finalMonthlyRate}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#3b82f6;font-family:Arial,sans-serif;">${currency}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td width="50%" style="padding-left:8px;vertical-align:top;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Tarifa mensual · Con IVA</p>
                          <p style="margin:0;font-size:21px;font-weight:700;color:#15803d;font-family:Arial,sans-serif;">${finalMonthlyRateWithVAT}</p>
                          <p style="margin:4px 0 0;font-size:11px;color:#22c55e;font-family:Arial,sans-serif;">${currency} incl. IVA</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Validity note (fixed) -->
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">
                Vigencia de esta propuesta: <strong style="color:#374151;">${validityDays} días</strong> desde la fecha de emisión.
              </p>
            </td>
          </tr>

          <!-- Footer (fixed) -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 32px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;">
                <strong style="color:#374151;">Zuperio</strong> &nbsp;&middot;&nbsp; zuperio.com.mx
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
