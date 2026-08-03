import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Share, Bookmark, Eye, Clock, Sparkles } from "lucide-react";
import { getIcon, getResourceColor } from "./utils";
import type { StudyMaterial } from "./types";
import { cn } from "@/lib/utils";
import { VideoViewer } from "./viewers/VideoViewer";
import { PDFViewer } from "./viewers/PDFViewer";
import { MarkdownViewer } from "./viewers/MarkdownViewer";
import { FallbackViewer } from "./viewers/FallbackViewer";
import { ExamIntelligenceWidget } from "./ExamIntelligenceWidget";
import { QuestionPaperTaggingModal } from "@/pages/admin/QuestionPaperTaggingModal";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";

interface StudyMaterialViewerProps {
  resource: StudyMaterial | null;
  onClose: () => void;
}

export function StudyMaterialViewer({ resource, onClose }: StudyMaterialViewerProps) {
  const [showIntelligence, setShowIntelligence] = useState<boolean>(false);
  const [showTaggingModal, setShowTaggingModal] = useState<boolean>(false);

  if (!resource) return null;

  const colors = getResourceColor(resource.type);
  const type = resource.type.toLowerCase();

  const renderViewer = () => {
    if (type === "video") return <VideoViewer resource={resource} />;
    if (type === "markdown" || type === "notes") return <MarkdownViewer resource={resource} />;
    if (type === "pdf") return <PDFViewer resource={resource} />;
    return <FallbackViewer resource={resource} />;
  };

  return (
    <>
      <Dialog open={!!resource} onOpenChange={(open) => !open && onClose()}>
        <DialogContent 
          showCloseButton={false}
          className="flex h-[100dvh] w-[100dvw] max-w-6xl flex-col overflow-hidden rounded-none border-border/60 bg-background p-0 sm:h-[92vh] sm:w-[95vw] sm:rounded-[16px] shadow-2xl"
        >
          {/* Top Header */}
          <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border/60 bg-card/30 px-5 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 shrink-0 rounded-[8px] text-muted-foreground hover:bg-muted/60 sm:hidden"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className={cn("hidden sm:flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] border border-border/80 bg-background shadow-xs", colors.text)}>
                {getIcon(resource.type)}
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-[6px] bg-muted/60 px-1.5 py-0 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                    {resource.subject}
                  </Badge>
                  <DialogTitle className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                    {resource.title}
                  </DialogTitle>
                </div>
                <span className="hidden truncate text-[12px] font-medium text-muted-foreground/80 sm:block mt-0.5">
                  By {resource.author}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant={showIntelligence ? "default" : "outline"}
                size="sm"
                onClick={() => setShowIntelligence(!showIntelligence)}
                className={cn(
                  "h-[34px] rounded-[8px] text-[12px] font-medium tracking-tight shadow-sm transition-all gap-1.5",
                  showIntelligence ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white" : "border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exam Intelligence</span>
              </Button>

              <a href={resource.url} target="_blank" rel="noreferrer" className="hidden sm:flex">
                <Button variant="outline" size="sm" className="h-[34px] rounded-[8px] border-border/80 text-[12px] font-medium tracking-tight shadow-sm transition-colors hover:bg-muted/60">
                  <Download className="mr-1.5 h-3.5 w-3.5 opacity-80" />
                  Download
                </Button>
              </a>
              <div className="mx-1 hidden h-4 w-px bg-border/60 sm:block" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hidden h-8 w-8 rounded-[8px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:flex"
              >
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
          </DialogHeader>

          <DialogDescription className="sr-only">
            Viewing study material: {resource.title}
          </DialogDescription>

          {/* Viewing Canvas + Intelligence Panel Split */}
          <div className="relative flex flex-1 overflow-hidden bg-background">
            <div className="flex-1 overflow-hidden">
              <Suspense fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }>
                {renderViewer()}
              </Suspense>
            </div>

            {/* Exam Intelligence Drawer / Sidebar */}
            {showIntelligence && (
              <div className="w-full sm:w-96 border-l border-border bg-card/95 backdrop-blur-lg p-4 overflow-y-auto animate-slideInRight shadow-xl z-20">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Exam Analysis</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowIntelligence(false)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <ExamIntelligenceWidget
                  subject={resource.subject}
                  onOpenTaggingModal={() => setShowTaggingModal(true)}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between border-t border-border/50 bg-card/30 px-5 py-3">
            <div className="flex items-center gap-5 text-[12px] font-medium text-muted-foreground/80">
              <span className="hidden sm:inline">
                Updated: {resource.updatedAt || "Recently"}
              </span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                  <Eye className="h-3.5 w-3.5 opacity-80" />
                  {resource.views || 0}
                </span>
                {resource.duration && (
                  <span className="hidden items-center gap-1.5 transition-colors hover:text-foreground sm:flex">
                    <Clock className="h-3.5 w-3.5 opacity-80" />
                    {resource.duration}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-[32px] rounded-[8px] px-3 text-[12px] font-medium tracking-tight text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                <Share className="mr-1.5 h-3.5 w-3.5 opacity-80" />
                Share
              </Button>
              <Button variant="ghost" size="sm" className="h-[32px] rounded-[8px] px-3 text-[12px] font-medium tracking-tight text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                <Bookmark className="mr-1.5 h-3.5 w-3.5 opacity-80" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuestionPaperTaggingModal
        isOpen={showTaggingModal}
        onClose={() => setShowTaggingModal(false)}
        initialSubject={resource.subject}
      />
    </>
  );
}