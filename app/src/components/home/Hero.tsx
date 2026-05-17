import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-20 lg:pb-20">
      <div className="container mx-auto my-0 max-w-3xl px-4 text-center">
        <div className="space-y-4">
          {/* Badge */}
          <div>
            <Badge
              variant="secondary"
              className="py-2 px-3"
            >
              NMU Study Hub
            </Badge>
          </div>

          {/* Heading – Positive framing, clearer value prop */}
          <h1 className="text-3xl tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
            Find exam prep material{" "}
            <span className="bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              designed for <span className="font-bold font-mono">your</span> semester
            </span>
            .
          </h1>

          {/* Subtext – Benefit-focused */}
          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            100+ topics organized by branch and semester. Access notes, previous
            papers, and syllabus—all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate("/resources")}
            >
              Start browsing
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/how-to-use")}
            >
              How it works
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
