import { useState, useEffect } from "react";
import { Bookmark, FileText, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { fetchBookmarkedMaterials, toggleBookmark, type StudyMaterial } from "@/services/study-service";
import { buildAssetUrl } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

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
      toast.success("Bookmark removed successfully.");
    }
  };

  return (
    <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50 backdrop-blur-xl">
      <CardHeader className="border-b border-border/30 pb-6 bg-secondary/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Bookmark className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Bookmarks</CardTitle>
            <CardDescription className="mt-1.5">Quickly access the study materials you have saved.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {bookmarksLoading ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-transparent border-none shadow-none text-primary">
                <Spinner className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Loading Library</EmptyTitle>
            </EmptyHeader>
          </Empty>
        ) : bookmarkedMaterials.length === 0 ? (
          <Empty className="py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-secondary/20">
                <Bookmark className="h-6 w-6 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle className="mt-4">Library Empty</EmptyTitle>
              <EmptyDescription className="max-w-md mx-auto">Click on the bookmark icon while browsing resources to save them here for quick access.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {bookmarkedMaterials.map((m) => {
                const href = m.url || (m.filePath ? buildAssetUrl(m.filePath, { studyMaterialId: m.id || m._id }) : "");
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={m.id || m._id} 
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/40 bg-background/80 p-5 transition-all duration-300 hover:bg-secondary/20 hover:border-border/80 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-secondary/50 text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20">
                          <FileText className="h-6 w-6" />
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                          {href && (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noreferrer"
                              title="Open material"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors shadow-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                          <button 
                            onClick={() => handleRemoveBookmark(String(m.id || m._id))}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-colors shadow-sm border border-border/50 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                            aria-label="Remove bookmark"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1 pr-2">
                        <h4 className="font-semibold text-base text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors" title={m.title}>{m.title}</h4>
                        <p className="text-xs text-muted-foreground truncate font-medium">{m.subject}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/30">
                      <span className="rounded-md border border-border/50 bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0">
                        {m.type}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground/80 truncate max-w-[120px]">By {m.author}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
