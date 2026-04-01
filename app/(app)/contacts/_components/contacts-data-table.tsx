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
import type { ContactListRow } from "@/lib/contacts/types";

import { ContactStatusBadge } from "./contact-status-badge";

export function ContactsDataTable({ contacts }: { contacts: ContactListRow[] }) {
  const router = useRouter();

  const goToContact = React.useCallback(
    (id: string) => {
      router.push(`/contacts/${id}`);
    },
    [router],
  );

  const onRowKeyDown = React.useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goToContact(id);
      }
    },
    [goToContact],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="max-w-[200px]">Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead className="w-[100px]">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.map((row) => (
          <TableRow
            key={row.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => goToContact(row.id)}
            onKeyDown={(e) => onRowKeyDown(e, row.id)}
            aria-label={`View ${row.displayName} details`}
          >
            <TableCell className="font-medium">{row.displayName}</TableCell>
            <TableCell className="text-muted-foreground">{row.title}</TableCell>
            <TableCell className="text-muted-foreground">
              {row.companyName}
            </TableCell>
            <TableCell
              className="max-w-[200px] truncate text-muted-foreground"
              title={row.email === "—" ? undefined : row.email}
            >
              {row.email}
            </TableCell>
            <TableCell className="text-muted-foreground">{row.phone}</TableCell>
            <TableCell>
              <ContactStatusBadge status={row.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
