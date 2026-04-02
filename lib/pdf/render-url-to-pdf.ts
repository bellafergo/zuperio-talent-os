import puppeteer from "puppeteer";

export type RenderUrlToPdfParams = {
  printPageUrl: string;
  cookieHeader: string | null;
  /**
   * Element that must exist before PDF capture. Default matches proposal + CV print templates.
   */
  waitSelector?: string;
};

const DEFAULT_PRINT_ROOT_SELECTOR = "article[data-pdf-print-root]";

/**
 * Renders an authenticated app URL to a PDF buffer (Chromium print).
 * Used for proposal and CV templates that match in-app HTML/CSS.
 */
export async function renderUrlToPdfBuffer(
  params: RenderUrlToPdfParams,
): Promise<Buffer> {
  const {
    printPageUrl,
    cookieHeader,
    waitSelector = DEFAULT_PRINT_ROOT_SELECTOR,
  } = params;

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined;

  console.info("[pdf-render] start", {
    printPageUrl,
    waitSelector,
    hasCookie: Boolean(cookieHeader?.length),
    executablePath: executablePath ? "(custom)" : "(bundled)",
  });

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

    // `networkidle2` often never resolves on Next.js dev (HMR / long-lived connections).
    const response = await page.goto(printPageUrl, {
      waitUntil: "load",
      timeout: 90_000,
    });

    const status = response?.status() ?? 0;
    if (status >= 400) {
      throw new Error(
        `PDF_PRINT_HTTP_${status}: ${printPageUrl} (response not ok)`,
      );
    }

    const finalUrl = page.url();
    if (/\/login(?:\?|#|$)/i.test(finalUrl)) {
      throw new Error(
        `PDF_PRINT_AUTH_FAILED: print URL redirected to login (finalUrl=${finalUrl})`,
      );
    }

    try {
      await page.waitForSelector(waitSelector, { timeout: 45_000 });
    } catch (waitErr) {
      console.error("[pdf-render] waitForSelector failed", {
        printPageUrl,
        waitSelector,
        finalUrl,
      });
      throw waitErr;
    }

    await page.evaluate(() => document.fonts.ready).catch(() => undefined);
    await new Promise((r) => setTimeout(r, 250));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    });

    const buf = Buffer.from(pdf);
    console.info("[pdf-render] ok", {
      printPageUrl,
      byteLength: buf.length,
    });

    return buf;
  } catch (e) {
    console.error("[pdf-render] failed", {
      printPageUrl,
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  } finally {
    await browser.close();
  }
}
