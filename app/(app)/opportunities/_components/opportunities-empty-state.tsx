"use client";

import { SearchXIcon, TargetIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OpportunitiesEmptyStateProps = {
  variant: "no-catalog" | "no-matches";
  onClearFilters?: () => void;
};

export function OpportunitiesEmptyState({
  variant,
  onClearFilters,
}: OpportunitiesEmptyStateProps) {
  if (variant === "no-catalog") {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <TargetIcon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No opportunities yet</CardTitle>
          <CardDescription>
            Deals linked to companies will show here after seeding or creating
            records in the database.
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
        <CardTitle className="text-base">No matching opportunities</CardTitle>
        <CardDescription>
          Adjust search or filters to see more of the pipeline.
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
