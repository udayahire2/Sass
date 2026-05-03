import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, FileText, BookOpen, Loader2, ExternalLink } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSyllabus, type SyllabusItem } from "@/services/syllabus-service";
import { fetchApprovedMaterials, type StudyMaterial } from "@/services/study-service";
import { buildAssetUrl } from "@/services/api";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeQuery, setActiveQuery] = useState(searchParams.get("q") || "");

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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Global Search</h1>
        <p className="text-muted-foreground">Find syllabus, notes, question papers, and more.</p>
        
        <form onSubmit={handleSearch} className="mx-auto max-w-2xl pt-4">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="h-5 w-5 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by subject, code, or title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
            <Button type="submit" className="rounded-l-none h-12 px-6">Search</Button>
          </InputGroup>
        </form>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Searching study materials...</p>
        </div>
      ) : !activeQuery ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6">
            <SearchIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Enter a search term</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Search for "Operating Systems", "CS-501", or "Question Papers" to find relevant study material across all departments.
          </p>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-6">
            <SearchIcon className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No results found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn't find any materials matching "{activeQuery}". Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Syllabus Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Syllabus ({filteredSyllabus.length})</h2>
            </div>
            
            <div className="space-y-3">
              {filteredSyllabus.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No syllabus items matched.</p>
              ) : (
                filteredSyllabus.map((item) => (
                  <Card key={item._id || item.code} className="overflow-hidden transition-colors hover:border-primary/50">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{item.code}</Badge>
                          <Badge variant="secondary">{item.branch}</Badge>
                        </div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">Sem {item.semester} • {item.credits} credits</p>
                        <Button asChild variant="outline" size="sm" className="mt-2 w-fit">
                          <Link to={`/syllabus?search=${encodeURIComponent(item.code)}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Study Materials Results */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border/40 pb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Study Materials ({filteredMaterials.length})</h2>
            </div>
            
            <div className="space-y-3">
              {filteredMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No study materials matched.</p>
              ) : (
                filteredMaterials.map((material) => {
                  const href = material.url || (material.filePath ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id }) : "");
                  
                  return (
                    <Card key={material._id} className="overflow-hidden transition-colors hover:border-primary/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">{material.type}</Badge>
                            <span className="text-xs text-muted-foreground">By {material.author}</span>
                          </div>
                          <h3 className="font-semibold line-clamp-2">{material.title}</h3>
                          <p className="text-sm text-muted-foreground">{material.subject}</p>
                          {href && (
                            <Button asChild size="sm" className="mt-2 w-fit">
                              <a href={href} target="_blank" rel="noreferrer">
                                Open Resource <ExternalLink className="ml-2 h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
