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
    <Tabs defaultValue="overview" className="w-full">
      <TabsList aria-label="Proposal sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="email">Email draft</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">{overview}</TabsContent>
      <TabsContent value="pricing">{pricing}</TabsContent>
      <TabsContent value="preview">{preview}</TabsContent>
      <TabsContent value="email">{emailDraft}</TabsContent>
    </Tabs>
  );
}
