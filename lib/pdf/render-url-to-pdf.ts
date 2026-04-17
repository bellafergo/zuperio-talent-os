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

/** Must match `@page` in `lib/proposals/pdf-template/proposal-consulting-pdf.css`. */
const PDF_PAGE_FORMAT = "A4" as const;
const PDF_PAGE_MARGIN_MM = "15mm" as const;

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

  // Resolve which binary Puppeteer would fall back to when no override is set.
  // This path may not exist if `npx puppeteer browsers install chrome` was never run.
  let puppeteerDefaultPath: string | undefined;
  try {
    puppeteerDefaultPath = puppeteer.executablePath();
  } catch {
    puppeteerDefaultPath = undefined;
  }

  const resolvedPath = executablePath ?? puppeteerDefaultPath;

  console.info("[pdf-render] start", {
    printPageUrl,
    waitSelector,
    hasCookie: Boolean(cookieHeader?.length),
    executablePathOverride: executablePath ?? null,
    puppeteerDefaultPath: puppeteerDefaultPath ?? null,
    resolvedPath: resolvedPath ?? null,
    hint: !executablePath
      ? "Set PUPPETEER_EXECUTABLE_PATH in .env to override (see .env.example)"
      : undefined,
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,
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
      format: PDF_PAGE_FORMAT,
      printBackground: true,
      margin: {
        top: PDF_PAGE_MARGIN_MM,
        right: PDF_PAGE_MARGIN_MM,
        bottom: PDF_PAGE_MARGIN_MM,
        left: PDF_PAGE_MARGIN_MM,
      },
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
      resolvedPath: resolvedPath ?? null,
      message: e instanceof Error ? e.message : String(e),
      hint: !executablePath
        ? "Puppeteer used its bundled path (may not be installed). Set PUPPETEER_EXECUTABLE_PATH in .env."
        : "Custom PUPPETEER_EXECUTABLE_PATH was set — verify the path is correct and executable.",
    });
    throw e;
  } finally {
    await browser.close();
  }
}
