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
    <Tabs defaultValue="overview" className="w-full gap-6">
      <TabsList
        aria-label="Proposal sections"
        className="h-auto w-full flex-wrap justify-start gap-1 p-1.5 sm:w-auto"
      >
        <TabsTrigger value="overview" className="px-3.5 py-2 text-sm">
          Overview
        </TabsTrigger>
        <TabsTrigger value="pricing" className="px-3.5 py-2 text-sm">
          Pricing
        </TabsTrigger>
        <TabsTrigger value="preview" className="px-3.5 py-2 text-sm">
          Preview
        </TabsTrigger>
        <TabsTrigger value="email" className="px-3.5 py-2 text-sm">
          Email draft
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
  );
}
