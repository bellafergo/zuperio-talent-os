import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

import { SEED_COMPANIES, SEED_USERS } from "./seed-data";

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
}

main()
  .then(() => {
    console.info(`Seeded ${SEED_USERS.length} users, ${SEED_COMPANIES.length} companies.`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
