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
          <CardTitle className="text-base">Aún no hay oportunidades</CardTitle>
          <CardDescription>
            Los negocios ligados a empresas aparecerán aquí tras el seed o al
            crear registros en la base de datos.
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
        <CardTitle className="text-base">Sin oportunidades que coincidan</CardTitle>
        <CardDescription>
          Ajusta la búsqueda o los filtros para ver más del embudo.
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
