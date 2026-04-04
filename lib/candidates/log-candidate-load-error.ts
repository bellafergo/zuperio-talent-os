/**
 * Logs candidate-related Prisma failures without noisy stacks for common
 * environment issues (stale client, pending migrations).
 */
export function logQuietCandidateLoadFailure(
  context: string,
  candidateId: string,
  err: unknown,
): void {
  const msg = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : "";
  if (name === "PrismaClientValidationError") {
    console.warn(
      `[${context}] Prisma validation for candidate ${candidateId}: run \`npx prisma generate\`, restart dev, and remove \`.next\` if the error persists.`,
    );
    return;
  }
  if (
    name === "PrismaClientKnownRequestError" &&
    (msg.includes("does not exist") || msg.includes("Column"))
  ) {
    console.warn(
      `[${context}] Database schema may be missing columns for candidate ${candidateId}: apply migrations (\`npx prisma migrate dev\`).`,
    );
    return;
  }
  console.error(`[${context}] failed`, {
    candidateId,
    message: msg.slice(0, 500),
  });
}
