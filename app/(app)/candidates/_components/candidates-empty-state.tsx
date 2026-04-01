"use client";

import { SearchXIcon, UserCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CandidatesEmptyStateProps = {
  variant: "no-catalog" | "no-matches";
  onClearFilters?: () => void;
};

export function CandidatesEmptyState({
  variant,
  onClearFilters,
}: CandidatesEmptyStateProps) {
  if (variant === "no-catalog") {
    return (
      <Card className="border-dashed shadow-none">
        <CardHeader className="text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-muted">
            <UserCircleIcon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-base">Aún no hay candidatos</CardTitle>
          <CardDescription>
            Agrega personas al banco de talento con seed o flujos futuros para
            verlas aquí.
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
        <CardTitle className="text-base">Sin candidatos que coincidan</CardTitle>
        <CardDescription>
          Prueba limpiar filtros o ampliar la búsqueda.
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
