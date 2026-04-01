"use client";

import { SearchXIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ContactsEmptyStateProps = {
  variant: "no-catalog" | "no-matches";
  onClearFilters?: () => void;
};

export function ContactsEmptyState({
  variant,
  onClearFilters,
}: ContactsEmptyStateProps) {
  if (variant === "no-catalog") {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <UsersIcon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No contacts yet</CardTitle>
          <CardDescription>
            Contacts linked to companies will appear here after seeding or
            importing data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-dashed shadow-none">
      <CardHeader className="text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
          <SearchXIcon className="size-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base">No matching contacts</CardTitle>
        <CardDescription>
          Try another search or reset filters to see the full directory.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button type="button" variant="secondary" onClick={onClearFilters}>
          Clear filters
        </Button>
      </CardContent>
    </Card>
  );
}
