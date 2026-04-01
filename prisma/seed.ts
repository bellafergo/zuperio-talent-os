import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import {
  SEED_CANDIDATES,
  SEED_COMPANIES,
  SEED_CONTACTS,
  SEED_OPPORTUNITIES,
  SEED_USERS,
  SEED_VACANCIES,
} from "./seed-data";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(url),
});

async function main() {
  for (const u of SEED_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
      },
      update: {
        name: u.name,
      },
    });
  }

  for (const c of SEED_COMPANIES) {
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: c.ownerEmail },
      select: { id: true },
    });

    await prisma.company.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        name: c.name,
        industry: c.industry,
        location: c.location,
        status: c.status,
        ownerId: owner.id,
      },
      update: {
        name: c.name,
        industry: c.industry,
        location: c.location,
        status: c.status,
        ownerId: owner.id,
      },
    });
  }

  for (const c of SEED_CONTACTS) {
    await prisma.contact.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName ?? null,
        email: c.email ?? null,
        phone: c.phone ?? null,
        title: c.title ?? null,
        status: c.status,
        companyId: c.companyId,
      },
      update: {
        firstName: c.firstName,
        lastName: c.lastName ?? null,
        email: c.email ?? null,
        phone: c.phone ?? null,
        title: c.title ?? null,
        status: c.status,
        companyId: c.companyId,
      },
    });
  }

  for (const o of SEED_OPPORTUNITIES) {
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: o.ownerEmail },
      select: { id: true },
    });

    await prisma.opportunity.upsert({
      where: { id: o.id },
      create: {
        id: o.id,
        title: o.title,
        stage: o.stage,
        value: o.value,
        currency: o.currency ?? "EUR",
        companyId: o.companyId,
        ownerId: owner.id,
      },
      update: {
        title: o.title,
        stage: o.stage,
        value: o.value,
        currency: o.currency ?? "EUR",
        companyId: o.companyId,
        ownerId: owner.id,
      },
    });
  }

  for (const v of SEED_VACANCIES) {
    await prisma.vacancy.upsert({
      where: { id: v.id },
      create: {
        id: v.id,
        title: v.title,
        seniority: v.seniority,
        status: v.status,
        targetRate: v.targetRate,
        currency: v.currency ?? "EUR",
        opportunityId: v.opportunityId,
      },
      update: {
        title: v.title,
        seniority: v.seniority,
        status: v.status,
        targetRate: v.targetRate,
        currency: v.currency ?? "EUR",
        opportunityId: v.opportunityId,
      },
    });
  }

  for (const c of SEED_CANDIDATES) {
    await prisma.candidate.upsert({
      where: { id: c.id },
      create: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email ?? null,
        phone: c.phone ?? null,
        role: c.role,
        seniority: c.seniority,
        skills: c.skills,
        availabilityStatus: c.availabilityStatus,
        currentCompany: c.currentCompany ?? null,
        notes: c.notes ?? null,
      },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email ?? null,
        phone: c.phone ?? null,
        role: c.role,
        seniority: c.seniority,
        skills: c.skills,
        availabilityStatus: c.availabilityStatus,
        currentCompany: c.currentCompany ?? null,
        notes: c.notes ?? null,
      },
    });
  }
}

main()
  .then(() => {
    console.info(
      `Seeded ${SEED_USERS.length} users, ${SEED_COMPANIES.length} companies, ${SEED_CONTACTS.length} contacts, ${SEED_OPPORTUNITIES.length} opportunities, ${SEED_VACANCIES.length} vacancies, ${SEED_CANDIDATES.length} candidates.`,
    );
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
