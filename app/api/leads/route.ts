import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { createLeadFromPayload } from "@/lib/leads/create-lead-from-payload";
import { parseLeadRequestBody } from "@/lib/leads/parse-lead-body";

export const dynamic = "force-dynamic";

function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const expectedKey = process.env.LEADS_API_KEY?.trim();
  if (!expectedKey) {
    return NextResponse.json(
      { error: "Leads API is not configured (LEADS_API_KEY)." },
      { status: 503 },
    );
  }

  const provided = request.headers.get("x-api-key")?.trim() ?? "";
  if (!provided || !timingSafeStringEqual(provided, expectedKey)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseLeadRequestBody(json);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  const created = await createLeadFromPayload(parsed.data);
  if (!created.ok) {
    return NextResponse.json({ error: created.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    companyId: created.companyId,
    contactId: created.contactId,
    opportunityId: created.opportunityId,
  });
}
