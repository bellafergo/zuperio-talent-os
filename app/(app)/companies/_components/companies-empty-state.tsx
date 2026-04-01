"use client";

import { Building2Icon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CompaniesEmptyStateProps = {
  variant: "no-catalog" | "no-matches";
  onClearFilters?: () => void;
};

export function CompaniesEmptyState({
  variant,
  onClearFilters,
}: CompaniesEmptyStateProps) {
  if (variant === "no-catalog") {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <Building2Icon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No companies yet</CardTitle>
          <CardDescription>
            When you connect data, your accounts will appear here. Use{" "}
            <span className="font-medium text-foreground">New Company</span> to
            add the first record once workflows are ready.
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
        <CardTitle className="text-base">No matching companies</CardTitle>
        <CardDescription>
          Try another search or reset filters to see the full list.
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
