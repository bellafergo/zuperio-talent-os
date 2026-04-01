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
          <CardTitle className="text-base">Aún no hay contactos</CardTitle>
          <CardDescription>
            Los contactos ligados a empresas aparecerán aquí tras el seed o al
            importar datos.
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
        <CardTitle className="text-base">Sin contactos que coincidan</CardTitle>
        <CardDescription>
          Prueba otra búsqueda o restablece filtros para ver el directorio
          completo.
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
