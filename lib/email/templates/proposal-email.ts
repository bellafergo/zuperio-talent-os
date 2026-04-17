export type SkillBreakdownRow = {
  skillId: string;
  skillName: string;
};

export type ProposalEmailSkillBreakdown = {
  met: SkillBreakdownRow[];
  missing: SkillBreakdownRow[];
};

export type ProposalEmailTemplateData = {
  recipientName: string;
  candidateName: string;
  /** candidate.role field directly from DB — not from CV text parsing. */
  candidateRole: string;
  /** Human-readable seniority label (e.g. "Senior", "Mid") */
  seniority: string;
  /** Human-readable availability label (e.g. "Inmediata", "2 semanas") */
  availability: string;
  /** Optional work modality (e.g. "Remoto", "Híbrido") */
  workModality?: string | null;
  /** Vacancy or opportunity title used as the job position */
  vacancyTitle: string;
  companyName: string;
  /** Already formatted with currency symbol, e.g. "$52,738" */
  finalMonthlyRate: string;
  /** Already formatted with currency symbol, e.g. "$61,175" */
  finalMonthlyRateWithVAT: string;
  /** Scheme label (e.g. "Tiempo completo", "Part-time") */
  proposalFormat: string;
  validityDays: number;
  senderName: string;
  currency: string;
  /** Required-skills breakdown from the matching engine. Null = no required skills or no vacancy. */
  skillBreakdown?: ProposalEmailSkillBreakdown | null;
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
  const lines = [
    `Estimado/a ${data.recipientName},`,
    "",
    `Con gusto le presento a ${data.candidateName}, ${data.candidateRole} con nivel ${data.seniority}, quien consideramos es un match sólido para la vacante de ${data.vacancyTitle} en ${data.companyName}.`,
    "",
    "A continuación el resumen de la propuesta:",
    "",
    "Adjunto encontrará el CV en formato Zuperio y la propuesta económica detallada para su revisión.",
    "",
    "Quedamos atentos para agendar una sesión de presentación del perfil o resolver cualquier duda.",
    "",
    "Atentamente,",
    data.senderName,
  ];
  return lines.join("\n");
}

/**
 * Builds the full HTML email.
 * Order: Header → body text (editable) → candidate card → skills table (if any) → pricing → attachments → footer
 */
export function buildProposalEmailHtml(
  data: ProposalEmailTemplateData,
  bodyText: string,
): string {
  const candidateName = esc(data.candidateName);
  const candidateRole = esc(data.candidateRole);
  const seniority = esc(data.seniority);
  const availability = esc(data.availability);
  const workModality = data.workModality ? esc(data.workModality) : null;
  const companyName = esc(data.companyName);
  // Rates already include the currency symbol — no extra prefix needed
  const finalMonthlyRate = esc(data.finalMonthlyRate);
  const finalMonthlyRateWithVAT = esc(data.finalMonthlyRateWithVAT);
  const proposalFormat = esc(data.proposalFormat);

  // Derive attachment filenames from candidateName (strip special chars)
  const safeNameForFile = data.candidateName
    .replace(/[^a-zA-ZÀ-ÿ0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const cvFilename = esc(`CV_${safeNameForFile}_Zuperio.pdf`);
  const proposalFilename = esc(`Propuesta_Economica_${safeNameForFile}.pdf`);

  // PDF icon SVG (inline)
  const pdfIcon = `<span style="display:inline-block;width:20px;height:24px;vertical-align:middle;margin-right:8px;">
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="20" height="24" rx="3" fill="#ef4444"/>
      <text x="3" y="17" font-family="Arial,sans-serif" font-size="7" font-weight="700" fill="#ffffff">PDF</text>
    </svg>
  </span>`;

  // Convert bodyText lines to HTML paragraphs
  const bodyHtml = bodyText
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p style="margin:0 0 12px;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">${esc(line)}</p>`
        : `<p style="margin:0 0 8px;">&nbsp;</p>`,
    )
    .join("\n");

  // Modality row (optional)
  const modalityRow = workModality
    ? `<tr>
        <td style="padding:3px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;width:130px;vertical-align:top;">Modalidad:</td>
        <td style="padding:3px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;">${workModality}</td>
      </tr>`
    : "";

  // Skills table (only when there are required skills from the matching engine)
  const sb = data.skillBreakdown;
  const totalSkills = (sb?.met.length ?? 0) + (sb?.missing.length ?? 0);
  const skillsTableHtml =
    sb && totalSkills > 0
      ? buildSkillsTableHtml(sb)
      : "";

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
                    <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.82);font-family:Arial,sans-serif;">el perfil acordado &middot; ${companyName}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editable body text (greeting + intro + close) -->
          <tr>
            <td style="padding:32px 32px 0;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Candidate profile card (fixed) -->
          <tr>
            <td style="padding:20px 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation"
                style="background-color:#ffffff;border-radius:8px;border:1px solid #e2e8f0;border-left:3px solid #1D6BE5;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">Perfil del candidato</p>
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                      <tr>
                        <td style="padding:3px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;width:130px;vertical-align:top;">Nombre:</td>
                        <td style="padding:3px 0;font-size:13px;font-weight:700;color:#111827;font-family:Arial,sans-serif;vertical-align:top;">${candidateName}</td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;vertical-align:top;">Rol:</td>
                        <td style="padding:3px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;">${candidateRole}</td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;vertical-align:top;">Nivel:</td>
                        <td style="padding:3px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;">${seniority}</td>
                      </tr>
                      <tr>
                        <td style="padding:3px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;vertical-align:top;">Disponibilidad:</td>
                        <td style="padding:3px 0;font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;">${availability}</td>
                      </tr>
                      ${modalityRow}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${skillsTableHtml}

          <!-- Pricing paragraph (fixed) -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 8px;font-size:14px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">
                El costo mensual del recurso es de
                <strong style="color:#1D6BE5;font-size:18px;font-family:Arial,sans-serif;">${finalMonthlyRate} + IVA</strong>
                (${finalMonthlyRateWithVAT} inc. IVA),
                bajo esquema ${proposalFormat}.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">
                Vigencia: <strong style="color:#374151;">14 días</strong> desde la fecha de emisión.
              </p>
            </td>
          </tr>

          <!-- Attachment chips (fixed) -->
          <tr>
            <td style="padding:20px 32px 28px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0" role="presentation"
                      style="background-color:#F5F5F5;border-radius:8px;padding:12px 16px;display:inline-table;margin-bottom:8px;width:100%;">
                      <tr>
                        <td style="padding-bottom:10px;">
                          <div style="display:inline-flex;align-items:center;background-color:#ffffff;border-radius:6px;border:1px solid #e5e7eb;padding:8px 12px;margin-right:8px;margin-bottom:4px;">
                            ${pdfIcon}
                            <span style="font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:middle;">${cvFilename}</span>
                          </div>
                          <div style="display:inline-flex;align-items:center;background-color:#ffffff;border-radius:6px;border:1px solid #e5e7eb;padding:8px 12px;margin-bottom:4px;">
                            ${pdfIcon}
                            <span style="font-size:13px;color:#374151;font-family:Arial,sans-serif;vertical-align:middle;">${proposalFilename}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p style="margin:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">Archivos adjuntos a este correo</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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

function buildSkillsTableHtml(sb: ProposalEmailSkillBreakdown): string {
  const allRows: { name: string; met: boolean }[] = [
    ...sb.met.map((s) => ({ name: s.skillName, met: true })),
    ...sb.missing.map((s) => ({ name: s.skillName, met: false })),
  ].sort((a, b) => {
    // Met first, then alphabetical
    if (a.met !== b.met) return a.met ? -1 : 1;
    return a.name.localeCompare(b.name, "es");
  });

  const rows = allRows
    .map((row, i) => {
      const bg = i % 2 === 0 ? "#ffffff" : "#F8F9FA";
      const badge = row.met
        ? `<span style="display:inline-block;background-color:#dcfce7;color:#16a34a;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;font-family:Arial,sans-serif;">&#10003; Match</span>`
        : `<span style="display:inline-block;background-color:#fee2e2;color:#dc2626;font-size:11px;font-weight:700;padding:2px 8px;border-radius:12px;font-family:Arial,sans-serif;">&#10005; Gap</span>`;
      const candidateValue = row.met
        ? `<span style="font-size:13px;color:#374151;font-family:Arial,sans-serif;">En perfil</span>`
        : `<span style="font-size:13px;color:#9ca3af;font-family:Arial,sans-serif;">No en perfil</span>`;

      return `<tr style="background-color:${bg};">
        <td style="padding:8px 12px;font-size:13px;color:#374151;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${esc(row.name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${candidateValue}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${badge}</td>
      </tr>`;
    })
    .join("\n");

  const metCount = sb.met.length;
  const total = sb.met.length + sb.missing.length;

  return `
          <!-- Skills table (fixed) -->
          <tr>
            <td style="padding:20px 32px 0;">
              <p style="margin:0 0 10px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;font-family:Arial,sans-serif;">
                Cobertura de skills requeridos &nbsp;<span style="color:#1D6BE5;">${metCount}/${total}</span>
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation"
                style="border-collapse:collapse;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
                <thead>
                  <tr style="background-color:#1D6BE5;">
                    <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#ffffff;text-align:left;letter-spacing:0.05em;text-transform:uppercase;font-family:Arial,sans-serif;">Requerimiento</th>
                    <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#ffffff;text-align:left;letter-spacing:0.05em;text-transform:uppercase;font-family:Arial,sans-serif;">Candidato</th>
                    <th style="padding:8px 12px;font-size:11px;font-weight:700;color:#ffffff;text-align:left;letter-spacing:0.05em;text-transform:uppercase;font-family:Arial,sans-serif;">Match</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </td>
          </tr>`;
}
