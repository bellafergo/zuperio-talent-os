import { prisma } from "@/lib/prisma";
import { syncContactPrimaryFields } from "@/lib/contacts/sync-primary-methods";

import { findCompanyForLeadInput } from "./find-company-for-lead";
import type { ParsedLeadPayload } from "./parse-lead-body";

export type CreateLeadResult =
  | {
      ok: true;
      companyId: string;
      contactId: string;
      opportunityId: string;
    }
  | { ok: false; message: string };

function normalizeWebsiteForStorage(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export async function createLeadFromPayload(
  payload: ParsedLeadPayload,
): Promise<CreateLeadResult> {
  try {
    const existing = await findCompanyForLeadInput({
      name: payload.company.name,
      website: payload.company.website,
    });

    const result = await prisma.$transaction(async (tx) => {
      let companyId: string;

      if (existing) {
        companyId = existing.id;
        const site = normalizeWebsiteForStorage(payload.company.website);
        if (site) {
          const row = await tx.company.findUnique({
            where: { id: companyId },
            select: { website: true },
          });
          if (row && !row.website?.trim()) {
            await tx.company.update({
              where: { id: companyId },
              data: { website: site },
            });
          }
        }
      } else {
        const createdCompany = await tx.company.create({
          data: {
            name: payload.company.name.trim(),
            website: normalizeWebsiteForStorage(payload.company.website),
            status: "PROSPECT",
          },
          select: { id: true },
        });
        companyId = createdCompany.id;
      }

      const contact = await tx.contact.create({
        data: {
          firstName: payload.contact.firstName,
          lastName: payload.contact.lastName,
          email: payload.contact.email,
          phone: payload.contact.phone?.trim() || null,
          title: payload.contact.position?.trim() || null,
          companyId,
          status: "ACTIVE",
        },
        select: { id: true },
      });

      if (payload.contact.email) {
        await tx.contactMethod.create({
          data: {
            contactId: contact.id,
            type: "EMAIL",
            value: payload.contact.email,
            isPrimary: true,
            isActive: true,
            createdById: null,
          },
        });
      }
      if (payload.contact.phone?.trim()) {
        await tx.contactMethod.create({
          data: {
            contactId: contact.id,
            type: "PHONE",
            value: payload.contact.phone.trim(),
            isPrimary: true,
            isActive: true,
            createdById: null,
          },
        });
      }

      const opportunity = await tx.opportunity.create({
        data: {
          title: payload.opportunity.title,
          companyId,
          contactId: contact.id,
          stage: payload.resolvedStage,
          value: payload.opportunity.value ?? null,
          currency: payload.opportunity.currency ?? "MXN",
          source: payload.opportunity.source?.trim() || null,
          ownerId: null,
        },
        select: { id: true },
      });

      return {
        companyId,
        contactId: contact.id,
        opportunityId: opportunity.id,
      };
    });

    await syncContactPrimaryFields(result.contactId);

    return { ok: true, ...result };
  } catch (err) {
    console.error("[createLeadFromPayload]", err);
    return { ok: false, message: "Could not persist the lead." };
  }
}
