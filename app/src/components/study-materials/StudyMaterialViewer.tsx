import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Share, Bookmark, Eye, Clock } from "lucide-react";
import MarkdownPreview from "@/components/ui/markdown-preview";
import { getIcon, getResourceColor } from "./utils";
import type { StudyMaterial } from "./types";
import { cn } from "@/lib/utils";

interface StudyMaterialViewerProps {
  resource: StudyMaterial | null;
  onClose: () => void;
}

export function StudyMaterialViewer({ resource, onClose }: StudyMaterialViewerProps) {
  if (!resource) return null;

  const colors = getResourceColor(resource.type);

  return (
    <Dialog open={!!resource} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        showCloseButton={false}
        className="flex h-[100dvh] w-[100dvw] max-w-6xl flex-col overflow-hidden rounded-none border-border/60 bg-background p-0 sm:h-[92vh] sm:w-[95vw] sm:rounded-[16px] shadow-2xl"
      >
        {/* Top Header - Notion Architectural Style */}
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border/60 bg-card/30 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            
            {/* Minimal Mobile Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 shrink-0 rounded-[8px] text-muted-foreground hover:bg-muted/60 sm:hidden"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Icon Block */}
            <div className={cn("hidden sm:flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[8px] border border-border/80 bg-background shadow-xs", colors.text)}>
              {getIcon(resource.type)}
            </div>

            {/* Breadcrumb Style Title */}
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

          {/* Desktop Right Actions */}
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="outline" size="sm" className="hidden h-[34px] rounded-[8px] border-border/80 text-[12px] font-medium tracking-tight shadow-sm transition-colors hover:bg-muted/60 sm:flex">
              <Download className="mr-1.5 h-3.5 w-3.5 opacity-80" />
              Download
            </Button>
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

        {/* Viewing Canvas - Spacious and Clean */}
        <div className="relative flex-1 overflow-hidden bg-background">
          {resource.type.toLowerCase() === "video" ? (
            <div className="flex h-full w-full items-center justify-center bg-black/95 sm:p-4 md:p-8">
              <iframe
                src={resource.url}
                className="aspect-video h-full w-full max-w-5xl rounded-none border border-border/20 shadow-2xl sm:rounded-[12px]"
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : resource.type.toLowerCase() === "markdown" || resource.type.toLowerCase() === "notes" ? (
            <div className="mx-auto h-full w-full max-w-4xl overflow-y-auto px-6 py-10 md:px-16 md:py-16">
              <MarkdownPreview
                content={resource.content || resource.url || "# No content available"}
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none"
              />
            </div>
          ) : resource.type.toLowerCase() === "pdf" ? (
            <div className="relative h-full w-full bg-muted/20 sm:p-2">
              <iframe
                src={resource.url}
                className="h-full w-full border-0 sm:rounded-[8px] sm:shadow-sm"
                title={resource.title}
              />
              <div className="absolute bottom-6 right-6 z-10 sm:hidden">
                <Button size="icon" className="h-12 w-12 rounded-full shadow-xl">
                  <Download className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className={cn("mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-[16px] border border-border/80 bg-card shadow-sm", colors.text)}>
                {getIcon(resource.type)}
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight text-foreground">
                Preview Not Available
              </h3>
              <p className="mb-8 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
                This file type cannot be previewed natively in the browser. Please download it directly to view its contents.
              </p>
              <Button className="h-10 rounded-[8px] border border-transparent px-6 text-[13px] font-medium tracking-tight shadow-sm">
                <Download className="mr-2 h-4 w-4 opacity-90" />
                Download {resource.type}
              </Button>
            </div>
          )}
        </div>

        {/* Minimal Information Footer */}
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
  );
}