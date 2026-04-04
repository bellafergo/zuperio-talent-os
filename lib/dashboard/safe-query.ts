/** Isolated try/catch so one failed Prisma query does not abort the dashboard route. */
export async function safeDashboardQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[dashboard] ${label} failed`, err);
    return fallback;
  }
}
