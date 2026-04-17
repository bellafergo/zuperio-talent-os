import { prisma } from "@/lib/prisma";

import { hostnameFromWebsiteUrl } from "./url-domain";

export type CompanyFindInput = {
  name: string;
  website: string | null | undefined;
};

/**
 * 1) If `website` resolves to a hostname, match any existing company whose stored
 *    `website` normalizes to the same hostname.
 * 2) Else match by exact `name` (case-insensitive).
 */
export async function findCompanyForLeadInput(
  input: CompanyFindInput,
): Promise<{ id: string } | null> {
  const domain = hostnameFromWebsiteUrl(input.website ?? null);

  if (domain) {
    const withSite = await prisma.company.findMany({
      where: { website: { not: null } },
      select: { id: true, website: true },
    });
    const byDomain = withSite.find(
      (row) => hostnameFromWebsiteUrl(row.website) === domain,
    );
    if (byDomain) return { id: byDomain.id };
  }

  return prisma.company.findFirst({
    where: { name: { equals: input.name.trim(), mode: "insensitive" } },
    select: { id: true },
  });
}
