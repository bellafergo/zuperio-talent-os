import type { JobBoardProvider } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { jobBoardProviderLabel } from "@/lib/job-board/labels";

export function JobBoardSourceBadge({
  provider,
  className,
}: {
  provider: JobBoardProvider;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={className}>
      Bolsa: {jobBoardProviderLabel(provider)}
    </Badge>
  );
}
