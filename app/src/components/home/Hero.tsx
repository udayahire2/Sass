import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden ">
      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 md:px-8 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div>
            <Badge variant="secondary" className="py-2 px-3">
              NMU Study Hub
            </Badge>
          </div>

          <h1 className="text-3xl tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
            Get exam‑ready with material{" "}
            <span className="bg-linear-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              built for <span className="font-bold font-mono">your</span> semester
            </span>
            .
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            Curated notes, past papers, and high‑impact questions — all in one place.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/resources")}>
              Browse resources
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/how-to-use")}>
              Learn more
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}