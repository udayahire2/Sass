import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="pt-16 pb-16 md:pt-24 md:pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-border/80 gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>NMU Study Hub</span>
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-foreground leading-[1.15]">
          Get exam‑ready with material built for your semester.
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Curated notes, past papers, and high‑impact questions — all in one
          clean, accessible platform.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            className="w-full sm:w-auto h-11 px-6 font-medium"
            onClick={() => navigate("/search")}
          >
            <Search className="mr-2 h-4 w-4" />
            Start searching
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-11 px-6 font-medium"
            onClick={() => navigate("/resources")}
          >
            Browse resources
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Clean Stats Row (Un-boxed) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto w-full pt-8 border-t border-border/50">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              10k+
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Study Notes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              50+
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Subjects Covered
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              5k+
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Past Papers
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              24/7
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">
              Instant Access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
