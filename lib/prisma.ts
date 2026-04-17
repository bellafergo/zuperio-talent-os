/**
 * Uses the generated client at `generated/prisma` (see `schema.prisma` generator `output`).
 * That folder is gitignored — it must match the current schema or Prisma throws
 * PrismaClientValidationError (e.g. unknown `select` fields). `npm run dev` / `build` run
 * `prisma generate` first; after pulling schema changes run `npx prisma generate` if needed.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file (see .env.example).",
    );
  }

  const adapter = new PrismaPg(url);
  return new PrismaClient({ adapter });
}

/**
 * Shared Prisma client for server-side code (Server Components, API routes, etc.).
 * Instantiate only on the server — never import from client components.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
