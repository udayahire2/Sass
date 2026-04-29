import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  highlights?: string[];
  children: ReactNode;
}

export function AuthShell({
  badge,
  title,
  description,
  highlights = [],
  children,
}: AuthShellProps) {
  return (
    <section className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-2">
        {/* LEFT: Branding */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-16 border-b border-border/40 lg:border-b-0 lg:border-r">
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            {/* Logo */}
            <div className="mb-8">
              <Logo />
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className="mb-6 rounded-md border-border/40 bg-transparent px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              {badge}
            </Badge>

            {/* Title & Description */}
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-5xl">
                {title}
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                {description}
              </p>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3">
                {highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-md border border-border/40 bg-transparent px-3 py-2 text-sm text-muted-foreground"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-12 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}