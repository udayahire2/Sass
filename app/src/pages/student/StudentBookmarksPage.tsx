import { useState, useEffect } from "react";
import { Bookmark, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";
import { buildAssetUrl } from "@/services/api";

export default function StudentBookmarksPage() {
  const [bookmarkedMaterials, setBookmarkedMaterials] = useState<StudyMaterial[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    setBookmarksLoading(true);
    fetchBookmarkedMaterials()
      .then(setBookmarkedMaterials)
      .finally(() => setBookmarksLoading(false));
  }, [token]);

  const handleRemoveBookmark = async (materialId: string) => {
    if (!token) return;
    const result = await toggleBookmark(materialId);
    if (result.success && !result.bookmarked) {
      setBookmarkedMaterials((prev) => prev.filter((m) => String(m.id || m._id) !== materialId));
      toast.success("Bookmark removed.");
    }
  };

  return (
    <Card className="border-border/70 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/50 pb-4 bg-secondary/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
          Bookmarks
        </CardTitle>
        <CardDescription>Quickly access the study materials you have bookmarked.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {bookmarksLoading ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Spinner className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>Loading Bookmarks</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : bookmarkedMaterials.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Bookmark className="h-5 w-5" />
              </EmptyMedia>
              <EmptyTitle>No Bookmarks Yet</EmptyTitle>
              <EmptyDescription>Click on the bookmark icon while browsing materials to save them here for quick access.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bookmarkedMaterials.map((m) => {
              const href = m.url || (m.filePath ? buildAssetUrl(m.filePath, { studyMaterialId: m.id || m._id }) : "");
              return (
                <div key={m.id || m._id} className="group relative flex items-start gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 transition-all duration-200 hover:bg-secondary/40 hover:shadow-sm">
                  <div className="rounded-xl border border-border/70 bg-secondary p-3 text-muted-foreground transition-colors shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1 pr-6">
                    <h4 className="font-semibold text-sm text-foreground truncate pr-2" title={m.title}>{m.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{m.subject}</p>
                    <div className="flex items-center gap-2 pt-1.5">
                      <span className="rounded border border-border/80 bg-muted/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                        {m.type}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">By {m.author}</span>
                    </div>
                  </div>

                  {/* Bookmark Button Group */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button 
                      onClick={() => handleRemoveBookmark(String(m.id || m._id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/60 transition-colors hover:bg-background hover:text-rose-500 focus:outline-none focus:ring-1 focus:ring-ring border border-transparent hover:border-border/70 shadow-sm"
                      aria-label="Remove bookmark"
                    >
                      <Bookmark className="h-4 w-4 fill-current text-primary" />
                    </button>
                    {href && (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noreferrer"
                        title="Open study material"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/60 border border-transparent hover:border-border/70 bg-transparent transition-colors hover:bg-background hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring shadow-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
