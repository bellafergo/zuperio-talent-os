import { MOCK_COMPANIES } from "./mock-data";
import type { Company } from "./types";

export function getCompanyById(id: string): Company | undefined {
  return MOCK_COMPANIES.find((c) => c.id === id);
}
