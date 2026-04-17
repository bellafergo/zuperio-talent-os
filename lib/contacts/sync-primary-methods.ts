import { prisma } from "@/lib/prisma";

/**
 * Copies primary active ContactMethod values onto Contact.email / Contact.phone
 * (EMAIL type → email; PHONE or WHATSAPP primary → phone, PHONE wins if both primary).
 */
export async function syncContactPrimaryFields(contactId: string): Promise<void> {
  const [emailMethod, phoneMethod, waMethod] = await Promise.all([
    prisma.contactMethod.findFirst({
      where: {
        contactId,
        type: "EMAIL",
        isActive: true,
        isPrimary: true,
      },
    }),
    prisma.contactMethod.findFirst({
      where: {
        contactId,
        type: "PHONE",
        isActive: true,
        isPrimary: true,
      },
    }),
    prisma.contactMethod.findFirst({
      where: {
        contactId,
        type: "WHATSAPP",
        isActive: true,
        isPrimary: true,
      },
    }),
  ]);

  const email = emailMethod?.value?.trim() || null;
  const phoneRaw = phoneMethod?.value?.trim() || waMethod?.value?.trim() || null;

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      email,
      phone: phoneRaw,
    },
  });
}
