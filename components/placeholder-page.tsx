import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Card className="max-w-2xl shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <Badge variant="secondary">Placeholder</Badge>
        </div>
        <CardDescription>
          {description ??
            "This section is a placeholder. Data and workflows will be added in a later phase."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">
          UI primitives are available under{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            @/components/ui
          </code>
          .
        </p>
      </CardContent>
    </Card>
  );
}
