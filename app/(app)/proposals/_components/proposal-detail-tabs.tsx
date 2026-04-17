"use client";

import type { ReactNode } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProposalDetailTabs({
  overview,
  pricing,
  preview,
  emailDraft,
}: {
  overview: ReactNode;
  pricing: ReactNode;
  preview: ReactNode;
  emailDraft: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/[0.08] p-4 shadow-sm ring-1 ring-foreground/[0.06] sm:p-5">
    <Tabs defaultValue="overview" className="w-full gap-6">
      <TabsList
        aria-label="Secciones de la propuesta"
        className="h-auto w-full flex-wrap justify-start gap-1 border-border/60 bg-background/80 p-1.5 sm:w-auto"
      >
        <TabsTrigger value="overview" className="px-3.5 py-2 text-sm">
          Resumen
        </TabsTrigger>
        <TabsTrigger value="pricing" className="px-3.5 py-2 text-sm">
          Precios
        </TabsTrigger>
        <TabsTrigger value="preview" className="px-3.5 py-2 text-sm">
          Vista previa
        </TabsTrigger>
        <TabsTrigger value="email" className="px-3.5 py-2 text-sm">
          Borrador correo
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-0 min-h-[14rem] pt-1">
        {overview}
      </TabsContent>
      <TabsContent value="pricing" className="mt-0 min-h-[14rem] pt-1">
        {pricing}
      </TabsContent>
      <TabsContent value="preview" className="mt-0 min-h-[14rem] pt-1">
        {preview}
      </TabsContent>
      <TabsContent value="email" className="mt-0 min-h-[14rem] pt-1">
        {emailDraft}
      </TabsContent>
    </Tabs>
    </div>
  );
}
