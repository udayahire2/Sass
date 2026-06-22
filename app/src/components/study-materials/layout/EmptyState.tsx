import { FileText, type LucideIcon } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  action,
}: EmptyStateProps) {
  return (
    <Empty className="rounded-xl border border-dashed border-border/50 p-8 sm:p-12">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="mb-2">
          <Icon className="text-muted-foreground opacity-50" />
        </EmptyMedia>
        <EmptyTitle className="font-medium text-foreground">{title}</EmptyTitle>
        <EmptyDescription className="max-w-sm">{description}</EmptyDescription>
        {action && <div className="mt-4">{action}</div>}
      </EmptyHeader>
    </Empty>
  );
}
