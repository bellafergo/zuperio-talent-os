"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

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
  const router = useRouter();

  const goToCompany = React.useCallback(
    (id: string) => {
      router.push(`/companies/${id}`);
    },
    [router],
  );

  const onRowKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToCompany(id);
      }
    },
    [goToCompany],
  );

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
          <TableRow
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => goToCompany(row.id)}
            onKeyDown={(e) => onRowKeyDown(e, row.id)}
            aria-label={`View ${row.name} details`}
          >
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
