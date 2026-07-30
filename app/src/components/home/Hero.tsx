import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6">
          <Badge variant="secondary" className="font-normal">
            NMU STUDY HUB
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-foreground leading-[1.15]">
          Get exam‑ready with material built for your semester.
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed font-normal">
          Curated notes, past papers, and high‑impact questions — all in one
          clean, accessible platform.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 w-full max-w-2xl flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search for notes, papers, subjects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit"  >
            Search
          </Button>
        </form>

        {/* Secondary action */}
        <div className="mt-4">
          <Button
            variant="link"
            onClick={() => navigate("/resources")}
          >
            Browse all resources
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto w-full pt-8 border-t border-border/50">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-normal tracking-tight text-foreground">
              10k+
            </span>
            <span className="mt-1 text-xs font-normal text-muted-foreground">
              Study Notes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-normal tracking-tight text-foreground">
              50+
            </span>
            <span className="mt-1 text-xs font-normal text-muted-foreground">
              Subjects Covered
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-normal tracking-tight text-foreground">
              5k+
            </span>
            <span className="mt-1 text-xs font-normal text-muted-foreground">
              Past Papers
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-normal tracking-tight text-foreground">
              24/7
            </span>
            <span className="mt-1 text-xs font-normal text-muted-foreground">
              Instant Access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}