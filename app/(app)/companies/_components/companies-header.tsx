import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CompaniesHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Companies
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Accounts and relationships across your pipeline. Search and filter
          are local only until data is connected.
        </p>
      </div>
      <Button type="button" className="shrink-0 gap-1.5">
        <PlusIcon className="size-4" aria-hidden />
        New Company
      </Button>
    </div>
  );
}
