"use client";

import { BriefcaseIcon, SearchXIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VacanciesEmptyStateProps = {
  variant: "no-catalog" | "no-matches";
  onClearFilters?: () => void;
};

export function VacanciesEmptyState({
  variant,
  onClearFilters,
}: VacanciesEmptyStateProps) {
  if (variant === "no-catalog") {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <BriefcaseIcon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">No vacancies yet</CardTitle>
          <CardDescription>
            Roles linked to opportunities will appear here after migration and
            seeding.
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
        <CardTitle className="text-base">No matching vacancies</CardTitle>
        <CardDescription>
          Adjust search or filters to see more roles.
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
