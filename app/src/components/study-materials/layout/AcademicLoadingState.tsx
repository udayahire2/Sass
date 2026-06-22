import { Loader2 } from "lucide-react";

export function AcademicLoadingState() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded-xl bg-muted/70" />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex h-40 items-center justify-center rounded-2xl border border-border/50 bg-muted/20"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>
  );
}
