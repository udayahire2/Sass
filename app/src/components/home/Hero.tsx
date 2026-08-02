import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, FileText, BookOpen, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchApprovedMaterials } from "@/services/study-service";
import { fetchSyllabus } from "@/services/syllabus-service";
import { fetchResources } from "@/services/resource-service";
import { buildAssetUrl } from "@/services/api";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: "syllabus" | "material" | "resource";
  badge: string;
  url?: string;
  navigateUrl?: string;
}

export function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const [syllabusData, materialsData, resourcesData] = await Promise.all([
          fetchSyllabus(),
          fetchApprovedMaterials(),
          fetchResources({ search: trimmed }),
        ]);

        if (!isMounted) return;

        const lower = trimmed.toLowerCase();

        const matchedSyllabus: SearchResultItem[] = (syllabusData || [])
          .filter(
            (item) =>
              item.title.toLowerCase().includes(lower) ||
              item.code.toLowerCase().includes(lower) ||
              item.branch.toLowerCase().includes(lower)
          )
          .slice(0, 3)
          .map((item) => ({
            id: `sys-${item._id || item.id || item.code}`,
            title: item.title,
            subtitle: `${item.code} • ${item.branch} (Sem ${item.semester})`,
            type: "syllabus",
            badge: "Syllabus",
            navigateUrl: `/syllabus?search=${encodeURIComponent(item.code)}`,
          }));

        const matchedMaterials: SearchResultItem[] = (materialsData || [])
          .filter(
            (m) =>
              m.title.toLowerCase().includes(lower) ||
              m.subject.toLowerCase().includes(lower) ||
              m.author.toLowerCase().includes(lower)
          )
          .slice(0, 3)
          .map((m) => {
            const fileUrl =
              m.url ||
              (m.filePath
                ? buildAssetUrl(m.filePath, { studyMaterialId: m.id || m._id })
                : "");
            return {
              id: `mat-${m._id || m.id}`,
              title: m.title,
              subtitle: `${m.subject} • By ${m.author}`,
              type: "material",
              badge: m.type || "Note",
              url: fileUrl,
              navigateUrl: fileUrl ? undefined : `/search?q=${encodeURIComponent(m.title)}`,
            };
          });

        const matchedResources: SearchResultItem[] = (resourcesData || [])
          .filter(
            (r) =>
              r.title.toLowerCase().includes(lower) ||
              r.subject.toLowerCase().includes(lower) ||
              r.category.toLowerCase().includes(lower)
          )
          .slice(0, 3)
          .map((r) => {
            const fileUrl = r.url || (r.filePath ? buildAssetUrl(r.filePath) : "");
            return {
              id: `res-${r._id}`,
              title: r.title,
              subtitle: `${r.subject} • ${r.category}`,
              type: "resource",
              badge: r.category || "Resource",
              url: fileUrl,
              navigateUrl: fileUrl ? undefined : `/search?q=${encodeURIComponent(r.title)}`,
            };
          });

        const combined = [...matchedSyllabus, ...matchedMaterials, ...matchedResources].slice(0, 6);
        setResults(combined);
      } catch (err) {
        console.error("Error fetching live search results:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/search");
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    setIsOpen(false);
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else if (item.navigateUrl) {
      navigate(item.navigateUrl);
    } else {
      navigate(`/search?q=${encodeURIComponent(item.title)}`);
    }
  };

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="mb-6">
          <Badge variant="outline" className="border-border/60 text-muted-foreground font-normal">
            NMU STUDY HUB
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading tracking-tight text-foreground leading-[1.15]">
          Get exam‑ready with material built for your semester.
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Curated notes, past papers, and high‑impact questions — all in one
          clean, accessible platform.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 w-full max-w-2xl flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative" ref={containerRef}>
            <Input
              type="text"
              placeholder="Search for notes, papers, subjects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length >= 2) setIsOpen(true);
              }}
              className="border-border/60 focus-visible:ring-primary/20"
            />

            {/* Live Search Results Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur-md text-left transition-all">
                {loading ? (
                  <div className="flex items-center justify-center p-4 text-xs text-muted-foreground gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Searching available content...</span>
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Available Content ({results.length})
                    </div>
                    {results.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectResult(item)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/70 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                            {item.type === "syllabus" ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <BookOpen className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {item.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.subtitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Badge variant="outline" className="text-[10px] capitalize font-medium">
                            {item.badge}
                          </Badge>
                          {item.url ? (
                            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
                          ) : (
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-60 group-hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    ))}

                    <div className="border-t border-border/60 pt-1.5 mt-1">
                      <button
                        type="button"
                        onClick={(e) => handleSearch(e as unknown as FormEvent)}
                        className="w-full text-center py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <span>View all results for "{query.trim()}"</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No matching content available for <span className="font-semibold text-foreground">"{query.trim()}"</span>
                    </p>
                    <button
                      type="button"
                      onClick={(e) => handleSearch(e as unknown as FormEvent)}
                      className="mt-2 text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Search on results page <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <Button type="submit" className="shadow-sm hover:shadow transition-all">
            Search
          </Button>
        </form>

        {/* Secondary action */}
        <div className="mt-4">
          <Button
            variant="link"
            onClick={() => navigate("/resources")}
            className="text-primary hover:underline"
          >
            Browse all resources
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto w-full pt-8 border-t border-border/40">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              10k+
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Study Notes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              50+
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Subjects Covered
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              5k+
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Past Papers
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              24/7
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Instant Access
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}