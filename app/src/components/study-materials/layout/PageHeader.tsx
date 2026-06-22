import { cn } from "@/lib/utils";

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  badge,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)} {...props}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          {badge && (
            <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-[13px] font-medium text-muted-foreground">
              {badge}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl text-balance">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="h-px w-full bg-border/40" />
    </div>
  );
}
