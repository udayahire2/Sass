import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, ExternalLink, FileText, Loader2, Search, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildAssetUrl } from "@/services/api";
import { fetchApprovedMaterials, fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";

export default function StudyStockPage() {
  const [approvedUploads, setApprovedUploads] = useState<StudyMaterial[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchApprovedMaterials()
      .then((materials) => {
        if (mounted) setApprovedUploads(materials);
      })
      .finally(() => {
        if (mounted) setLoadingUploads(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="mx-auto w-full max-w-270 space-y-10 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Study Stock
          </h1>
          <p className="text-[14px] leading-relaxed text-muted-foreground max-w-2xl">
            A dedicated repository for student and faculty uploaded study materials. Discover notes, guides, and community-driven content.
          </p>
        </div>
        <div className="h-px w-full bg-border/40" />
      </div>

      <ApprovedUploadsSection materials={approvedUploads} loading={loadingUploads} />
    </div>
  );
}

function ApprovedUploadsSection({ materials, loading }: { materials: StudyMaterial[]; loading: boolean; }) {
  const { user } = useLocalAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchBookmarkedMaterials().then((materials) => {
        const ids = new Set(materials.map((m) => String(m.id || m._id)));
        setBookmarkedIds(ids);
      }).catch(console.error);
    } else {
      setBookmarkedIds(new Set());
    }
  }, [user]);

  const handleToggleBookmark = async (materialId: string) => {
    if (!user) return;
    const result = await toggleBookmark(materialId);
    if (result.success) {
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (result.bookmarked) next.add(materialId);
        else next.delete(materialId);
        return next;
      });
    }
  };

  const types = useMemo(() => {
    const set = new Set(materials.map((m) => m.type));
    return Array.from(set);
  }, [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !activeTypeFilter || m.type === activeTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [materials, searchQuery, activeTypeFilter]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="w-fit rounded-md">
            Community uploads
          </Badge>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Explore Resources</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Community submissions reviewed by admins.
            </p>
          </div>
        </div>
        {user && (
          <Button asChild variant="outline" className="w-full rounded-xl sm:w-auto">
            <Link to="/add-study-content">
              <UploadCloud className="h-4 w-4 mr-2" />
              Add Content
            </Link>
          </Button>
        )}
      </div>

      {!loading && materials.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search uploads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-border/60 bg-background/80 pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
            />
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2" variant="ghost">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {types.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTypeFilter(null)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${!activeTypeFilter ? "bg-primary text-primary-foreground shadow-sm" : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
              >
                All
              </button>
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(activeTypeFilter === type ? null : type)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${activeTypeFilter === type ? "bg-primary text-primary-foreground shadow-sm" : "border border-border/60 bg-background/80 text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-36 items-center justify-center rounded-xl border border-border/50">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : materials.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No uploads found</p>
          <p className="mt-1 text-sm text-muted-foreground">Be the first to submit useful study material.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
          <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-3 text-sm font-medium text-foreground">No matching results</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((material) => {
            const href = material.url || (material.filePath ? buildAssetUrl(material.filePath, { studyMaterialId: material.id || material._id }) : "");
            return (
              <article key={material._id} className="group rounded-xl border border-border/50 bg-background/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-background hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h3 className="truncate text-sm font-semibold text-foreground">{material.title}</h3>
                      <p className="text-xs text-muted-foreground">{material.subject}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-lg text-xs shrink-0">{material.type}</Badge>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/30 pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Uploaded by {material.author}</p>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button variant={bookmarkedIds.has(String(material.id || material._id)) ? "default" : "outline"} size="icon" className={cn("rounded-xl h-9 w-9", bookmarkedIds.has(String(material.id || material._id)) ? "bg-primary text-primary-foreground" : "")} onClick={() => handleToggleBookmark(String(material.id || material._id))}>
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    )}
                    {href && (
                      <Button asChild size="sm" className="rounded-xl" variant="outline">
                        <a href={href} target="_blank" rel="noreferrer">
                          Open <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
