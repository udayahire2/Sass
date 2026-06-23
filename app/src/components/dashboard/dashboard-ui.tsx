import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  actions,
  badge,
  description,
  title,
}: {
  actions?: ReactNode;
  badge?: ReactNode;
  description: ReactNode;
  title: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {badge}
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </section>
  );
}

export function DashboardLinkButton({
  children,
  icon: Icon,
  iconPosition = "start",
  to,
  variant = "default",
}: {
  children: ReactNode;
  icon?: LucideIcon;
  iconPosition?: "start" | "end";
  to: string;
  variant?: ButtonProps["variant"];
}) {
  return (
    <Button render={<Link to={to} />} variant={variant}>
      {Icon && iconPosition === "start" ? <Icon aria-hidden="true" /> : null}
      {children}
      {Icon && iconPosition === "end" ? <Icon aria-hidden="true" /> : null}
    </Button>
  );
}

export function DashboardStatCard({
  description,
  icon: Icon,
  label,
  value,
}: {
  description: ReactNode;
  icon: LucideIcon;
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
        <CardAction>
          <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Icon aria-hidden="true" />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardStatusBadge({
  children,
  status,
}: {
  children?: ReactNode;
  status: "approved" | "pending" | "rejected";
}) {
  const variants: Record<
    "approved" | "pending" | "rejected",
    BadgeProps["variant"]
  > = {
    approved: "success",
    pending: "warning",
    rejected: "error",
  };

  return (
    <Badge variant={variants[status]}>
      {children ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export interface DashboardAction {
  description?: string;
  icon?: LucideIcon;
  label: string;
  to: string;
}

export function DashboardActionList({
  actions,
  className,
  framed = true,
}: {
  actions: DashboardAction[];
  className?: string;
  framed?: boolean;
}) {
  const content = (
    <div className={cn("p-2", !framed && className)}>
      {actions.map((action) => (
        <Button
          className="h-auto w-full justify-start whitespace-normal px-3 py-3 text-left"
          key={action.to}
          render={<Link to={action.to} />}
          variant="ghost"
        >
          {action.icon ? <action.icon aria-hidden="true" /> : null}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{action.label}</span>
            {action.description ? (
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                {action.description}
              </span>
            ) : null}
          </span>
          <ArrowRight aria-hidden="true" className="ml-auto" />
        </Button>
      ))}
    </div>
  );

  return framed ? <Card className={className}>{content}</Card> : content;
}

export function DashboardEmptyState({
  action,
  className,
  description,
  icon: Icon,
  title,
}: {
  action?: ReactNode;
  className?: string;
  description: ReactNode;
  icon: LucideIcon;
  title: ReactNode;
}) {
  return (
    <Empty className={cn("min-h-56", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
