import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, FileText, BookOpen, Loader2, ExternalLink, Filter, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSyllabus, type SyllabusItem } from "@/services/syllabus-service";
import { fetchApprovedMaterials, type StudyMaterial } from "@/services/study-service";
import { buildAssetUrl } from "@/services/api";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "syllabus" | "materials";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const [loading, setLoading] = useState(false);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([fetchSyllabus(), fetchApprovedMaterials()])
      .then(([syllabusData, materialsData]) => {
        if (mounted) {
          setSyllabus(syllabusData);
          setMaterials(materialsData);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch search data", error);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setActiveQuery(query.trim());
    } else {
      setSearchParams({});
      setActiveQuery("");
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    setSearchParams({ q: term });
    setActiveQuery(term);
  };

  const filteredSyllabus = useMemo(() => {
    if (!activeQuery) return [];
    const lowerQuery = activeQuery.toLowerCase();
    return syllabus.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.code.toLowerCase().includes(lowerQuery) ||
        item.branch.toLowerCase().includes(lowerQuery)
    );
  }, [activeQuery, syllabus]);

  const filteredMaterials = useMemo(() => {
    if (!activeQuery) return [];
    const lowerQuery = activeQuery.toLowerCase();
    return materials.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.subject.toLowerCase().includes(lowerQuery) ||
        m.author.toLowerCase().includes(lowerQuery)
    );
  }, [activeQuery, materials]);

  const hasResults = filteredSyllabus.length > 0 || filteredMaterials.length > 0;
  const suggestions = ["Operating Systems", "Mathematics", "Question Papers", "CS-501"];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10">
      {/* Header & Search Form */}
      <header className="space-y-3 sm:space-y-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Global Search</h1>
        <p className="text-xs sm:text-base text-muted-foreground max-w-md mx-auto">
          Find syllabus, notes, question papers, and resources across all departments.
        </p>

        <form onSubmit={handleSearch} className="mx-auto max-w-2xl pt-2 sm:pt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <InputGroup className="flex-1">
              <InputGroupAddon>
                <SearchIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search by subject, code, or title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 sm:h-12 text-sm sm:text-base"
                autoFocus
              />
            </InputGroup>
            <Button type="submit" className="h-10 sm:h-12 px-5 sm:px-6 font-semibold w-full sm:w-auto shrink-0">
              Search
            </Button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Popular:
          </span>
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSuggestionClick(item)}
              className="rounded-full bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-xs sm:text-sm text-muted-foreground">Searching study materials...</p>
        </div>
      ) : !activeQuery ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6">
          <div className="rounded-full bg-muted p-4 sm:p-5">
            <SearchIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
          </div>
          <h2 className="mt-4 text-lg sm:text-xl font-semibold">Start searching</h2>
          <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-muted-foreground">
            Type subject names, course codes, or paper titles in the search bar above.
          </p>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 p-6">
          <div className="rounded-full bg-muted p-4 sm:p-5">
            <SearchIcon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground/50" />
          </div>
          <h2 className="mt-4 text-lg sm:text-xl font-semibold">No results found</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm">
            We couldn't find any materials matching "{activeQuery}". Try another keyword or subject code.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Responsive Mobile Category Filter Tabs */}
          <div className="flex items-center gap-1.5 border-b border-border/40 pb-2 overflow-x-auto">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="h-8 text-xs font-semibold rounded-full px-3"
            >
              All Results ({filteredSyllabus.length + filteredMaterials.length})
            </Button>
            <Button
              variant={activeTab === "syllabus" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("syllabus")}
              className="h-8 text-xs font-medium rounded-full px-3"
            >
              Syllabus ({filteredSyllabus.length})
            </Button>
            <Button
              variant={activeTab === "materials" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("materials")}
              className="h-8 text-xs font-medium rounded-full px-3"
            >
              Materials ({filteredMaterials.length})
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Syllabus Results Section */}
            {(activeTab === "all" || activeTab === "syllabus") && (
              <div className={cn("space-y-3", activeTab === "syllabus" && "md:col-span-2")}>
                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold">Syllabus ({filteredSyllabus.length})</h2>
                </div>

                {filteredSyllabus.length === 0 ? (
                  <p className="py-4 text-xs sm:text-sm text-muted-foreground">No syllabus items matched.</p>
                ) : (
                  <div className="space-y-2.5">
                    {filteredSyllabus.map((item) => (
                      <Card key={item._id || item.code} className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
                        <CardContent className="p-3.5 sm:p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] font-semibold">{item.code}</Badge>
                              <Badge variant="secondary" className="text-[10px]">{item.branch}</Badge>
                            </div>
                            <h3 className="font-semibold text-sm sm:text-base leading-snug">{item.title}</h3>
                            <p className="text-xs text-muted-foreground">Semester {item.semester} • {item.credits} Credits</p>
                            <Button asChild variant="outline" size="sm" className="mt-1.5 w-full sm:w-fit text-xs h-8">
                              <Link to={`/syllabus?search=${encodeURIComponent(item.code)}`}>
                                View Details
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Study Materials Results Section */}
            {(activeTab === "all" || activeTab === "materials") && (
              <div className={cn("space-y-3", activeTab === "materials" && "md:col-span-2")}>
                <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold">Study Materials ({filteredMaterials.length})</h2>
                </div>

                {filteredMaterials.length === 0 ? (
                  <p className="py-4 text-xs sm:text-sm text-muted-foreground">No study materials matched.</p>
                ) : (
                  <div className="space-y-2.5">
                    {filteredMaterials.map((material) => {
                      const href = material.url || (material.filePath ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id }) : "");

                      return (
                        <Card key={material._id} className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-sm">
                          <CardContent className="p-3.5 sm:p-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="secondary" className="text-[10px] capitalize">{material.type}</Badge>
                                <span className="text-[11px] text-muted-foreground truncate">By {material.author}</span>
                              </div>
                              <h3 className="font-semibold text-sm sm:text-base leading-snug line-clamp-2">{material.title}</h3>
                              <p className="text-xs text-muted-foreground">{material.subject}</p>
                              {href && (
                                <Button asChild size="sm" className="mt-1.5 w-full sm:w-fit text-xs h-8">
                                  <a href={href} target="_blank" rel="noreferrer">
                                    Open Resource <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
