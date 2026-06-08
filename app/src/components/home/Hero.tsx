import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-20 lg:pb-20">
      {/* Main Content */}
      <div className="container relative z-10 mx-auto max-w-3xl px-4 text-center">
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="px-3 py-2">
              NMU Study Hub
            </Badge>
          </div>

          <h1 className="font-display text-3xl tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
            Find exam prep material{" "}
            <span className="bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              designed for{" "}
              <span className="font-mono font-bold">your</span> semester
            </span>
            .
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            100+ topics organized by branch and semester.
            Access notes, previous papers, and syllabus—
            all in one place.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/resources")}>
              Start browsing
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/how-to-use")}>
              How it works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}