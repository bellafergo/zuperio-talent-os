"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Company } from "@/lib/companies/types";

import { CompanyStatusBadge } from "./company-status-badge";

export function CompaniesDataTable({ companies }: { companies: Company[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell className="text-muted-foreground">{row.industry}</TableCell>
            <TableCell className="text-muted-foreground">{row.location}</TableCell>
            <TableCell className="text-muted-foreground">{row.owner}</TableCell>
            <TableCell>
              <CompanyStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
