import { EmptyState } from "./empty-state";
import { SectionCard } from "./section-card";

export function PlaceholderSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SectionCard title={title} description={description}>
      <EmptyState
        variant="embedded"
        title="Nothing here yet"
        description={`This area is reserved for future ${title.toLowerCase()}.`}
      />
    </SectionCard>
  );
}
