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
          <CardTitle className="text-base">Aún no hay empresas</CardTitle>
          <CardDescription>
            Cuando conectes datos, tus cuentas aparecerán aquí. Usa{" "}
            <span className="font-medium text-foreground">Nueva empresa</span> para
            agregar el primer registro cuando los flujos estén listos.
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
        <CardTitle className="text-base">Sin empresas que coincidan</CardTitle>
        <CardDescription>
          Prueba otra búsqueda o restablece filtros para ver la lista completa.
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
