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
          <CardTitle className="text-base">Aún no hay vacantes</CardTitle>
          <CardDescription>
            Los roles ligados a oportunidades aparecerán aquí tras migrar y
            ejecutar el seed.
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
        <CardTitle className="text-base">Sin vacantes que coincidan</CardTitle>
        <CardDescription>
          Ajusta la búsqueda o los filtros para ver más roles.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-6">
        <Button type="button" variant="secondary" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </CardContent>
    </Card>
  );
}
