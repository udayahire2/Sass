import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ImpQuestionsPage() {
  return (
    <div className="mx-auto w-full max-w-270 space-y-10 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-5">
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[13px] font-medium text-muted-foreground pb-1">
          <Badge variant="secondary" className="rounded-[6px] bg-primary/10 text-primary">Study Material</Badge>
        </nav>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Important Questions
          </h1>
          <p className="text-[14px] leading-relaxed text-muted-foreground max-w-2xl">
            Curated list of important questions frequently asked in exams. Subject-wise breakdown for efficient preparation.
          </p>
        </div>
        <div className="h-px w-full bg-border/40" />
      </div>

      <div className="rounded-xl border border-dashed border-border/50 p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">Content Coming Soon</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          We are currently gathering the most important questions. Check back later for updates.
        </p>
      </div>
    </div>
  );
}
