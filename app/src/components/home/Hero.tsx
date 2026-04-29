import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-20 lg:pb-20">


      <div className="container mx-auto  my-0 max-w-3xl px-4 text-center">
        <div className="space-y-4">
          {/* Badge – now more visible */}
          <div>
            <Badge
              variant="secondary"
              className="py-2 px-2"
            >
              NMU Study Hub
            </Badge>
          </div>

          {/* Heading – period moved outside gradient for clarity */}
          <h1 className="text-3xl  tracking-tight sm:text-5xl md:text-5xl lg:text-6xl">
            Find your exact{" "}
            <span className="bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              exam notes in seconds
            </span>
            .
          </h1>

          {/* Subtext – softer and better line height */}
          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            No random PDFs. No endless searching. Just clean, structured study
            material for your branch and semester.
          </p>

          {/* CTA Buttons – primary gets more weight */}
          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button
              size="lg"
            >
              Start studying
            </Button>
            <Button
              size="lg"
              variant="outline"
            >
              Browse subjects
            </Button>
          </div>

          {/* Trust line – smaller, more receded */}
          <p className="pt-4 text-xs text-muted-foreground/50 sm:text-sm">
            Used by students to quickly access notes, syllabus, and previous papers.
          </p>
        </div>
      </div>
    </section>
  );
}