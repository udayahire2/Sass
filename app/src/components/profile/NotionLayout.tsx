"use client";
import React from "react";
import { type LucideIcon } from "lucide-react";

export const NotionPage = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-background pb-24 text-foreground selection:bg-primary/20">
    {children}
  </div>
);

export const NotionCover = ({ src }: { src?: string }) => (
  <div className="group relative h-48 w-full overflow-hidden bg-gradient-to-r from-muted/50 via-muted to-muted/50 sm:h-64">
    {src ? (
      <img src={src} alt="Cover" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
    ) : (
      <div className="absolute inset-0 bg-[linear-gradient(45deg,var(--tw-gradient-stops))] from-blue-100/40 via-teal-50/40 to-emerald-100/40 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-700/80" />
    )}
  </div>
);

export const NotionContent = ({ children }: { children: React.ReactNode }) => (
  <main className="mx-auto max-w-4xl px-4 sm:px-8 xl:px-0">{children}</main>
);

export const NotionHeaderArea = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mb-8 pb-4 border-b border-border/30">{children}</div>
);

export const NotionAvatarWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="relative -mt-16 mb-4 inline-block sm:-mt-20">{children}</div>
);

export const NotionTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
    {children}
  </h1>
);

export const NotionTitleBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="ml-3 inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground align-middle mb-2">
    {children}
  </span>
);

export const NotionProperties = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-6 flex flex-col gap-2">{children}</div>
);

export const NotionPropertyRow = ({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="group flex w-full max-w-md items-center py-1 transition-colors hover:bg-muted/30 rounded-md -ml-2 px-2">
    <div className="flex w-40 shrink-0 items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
    <div className="flex min-w-0 flex-1 items-center font-medium text-sm">
      <span className="truncate">{value}</span>
      {action && (
        <div className="ml-2 opacity-0 transition-opacity group-hover:opacity-100">
          {action}
        </div>
      )}
    </div>
  </div>
);

export const NotionSection = ({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <section className="mt-12">
    <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
      <div className="flex items-center gap-2 text-foreground">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="pt-2">{children}</div>
  </section>
);

export const NotionGallery = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
);

export const NotionGalleryCard = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <div
    onClick={onClick}
    className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md cursor-default"
  >
    {children}
  </div>
);

export const NotionFormContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-border/50 bg-card/30 p-5 shadow-sm sm:p-6">
    {children}
  </div>
);

export const NotionEmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 py-12 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
      <Icon className="h-6 w-6 text-muted-foreground" />
    </div>
    <h3 className="text-base font-semibold text-foreground">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
