-- CreateEnum
CREATE TYPE "ContactMethodType" AS ENUM ('PHONE', 'EMAIL', 'WHATSAPP', 'LINKEDIN');

-- CreateTable
CREATE TABLE "ContactMethod" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "ContactMethodType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "ContactMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactMethod_contactId_idx" ON "ContactMethod"("contactId");

-- CreateIndex
CREATE INDEX "ContactMethod_contactId_type_idx" ON "ContactMethod"("contactId", "type");

-- AddForeignKey
ALTER TABLE "ContactMethod" ADD CONSTRAINT "ContactMethod_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMethod" ADD CONSTRAINT "ContactMethod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill from legacy Contact.email / Contact.phone (each becomes one primary method)
INSERT INTO "ContactMethod" ("id", "contactId", "type", "value", "label", "isPrimary", "isActive", "createdAt", "createdById", "notes")
SELECT
  'cm_email_' || "id",
  "id",
  'EMAIL'::"ContactMethodType",
  trim(both from "email"),
  NULL,
  true,
  true,
  "createdAt",
  NULL,
  NULL
FROM "Contact"
WHERE "email" IS NOT NULL AND trim(both from "email") <> '';

INSERT INTO "ContactMethod" ("id", "contactId", "type", "value", "label", "isPrimary", "isActive", "createdAt", "createdById", "notes")
SELECT
  'cm_phone_' || "id",
  "id",
  'PHONE'::"ContactMethodType",
  trim(both from "phone"),
  NULL,
  true,
  true,
  "createdAt",
  NULL,
  NULL
FROM "Contact"
WHERE "phone" IS NOT NULL AND trim(both from "phone") <> '';
