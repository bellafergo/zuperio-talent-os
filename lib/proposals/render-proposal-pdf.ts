import puppeteer from "puppeteer";

type RenderProposalPdfParams = {
  printPageUrl: string;
  cookieHeader: string | null;
};

/**
 * Renders the authenticated document-print URL to a PDF buffer.
 * Relies on the same HTML/CSS as the in-app preview (Chromium print).
 */
export async function renderProposalPdfBuffer(
  params: RenderProposalPdfParams,
): Promise<Buffer> {
  const { printPageUrl, cookieHeader } = params;

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    if (cookieHeader) {
      await page.setExtraHTTPHeaders({ Cookie: cookieHeader });
    }
    await page.goto(printPageUrl, {
      waitUntil: "networkidle0",
      timeout: 45_000,
    });
    await page.evaluate(() => document.fonts.ready).catch(() => undefined);
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
