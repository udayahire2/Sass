import { useState, useMemo, useEffect } from 'react';
import { Smile, ImageIcon, X, BookOpen, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NoteMetadata } from "@/lib/notesMetadata";
import { CoverImage } from "./CoverImage";

interface PageCanvasProps {
  title: string;
  metadata: NoteMetadata;
  bodyMarkdown: string;
  fontClass: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBodyChange: (markdown: string) => void;
  onOpenEmojiPicker: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveIcon: () => void;
  onOpenCoverPicker: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onRemoveCover: () => void;
}

export function PageCanvas({
  title,
  metadata,
  bodyMarkdown,
  fontClass,
  onTitleChange,
  onBodyChange,
  onOpenEmojiPicker,
  onRemoveIcon,
  onOpenCoverPicker,
  onRemoveCover,
}: PageCanvasProps) {
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  // Extract headings
  const headings = useMemo(() => {
    if (!bodyMarkdown) return [];
    const lines = bodyMarkdown.split('\n');
    const items: { text: string; level: number; id: string }[] = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,3})\s+(.+)$/);
      if (match) {
        items.push({
          text: match[2].replace(/[_*`[\]]/g, '').trim(),
          level: match[1].length,
          id: `heading-${index}`,
        });
      }
    });
    return items;
  }, [bodyMarkdown]);

  const scrollToHeading = (text: string) => {
    const editorEl = document.querySelector('.ProseMirror');
    if (!editorEl) return;
    const headingEls = editorEl.querySelectorAll('h1, h2, h3');
    for (const el of headingEls) {
      if (el.textContent?.trim() === text.trim()) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
    }
    if (window.innerWidth < 768) setIsOutlineOpen(false); // auto-close on mobile after click
  };

  // Scroll sync
  useEffect(() => {
    const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;
    const handleScroll = () => {
      const editorEl = document.querySelector('.ProseMirror');
      if (!editorEl) return;
      const headingEls = editorEl.querySelectorAll('h1, h2, h3');
      let activeId = null;
      let closest = Infinity;
      headingEls.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const dist = Math.abs(rect.top - viewportRect.top);
        if (dist < closest && rect.top >= viewportRect.top - 50) {
          closest = dist;
          activeId = `heading-${idx}`;
        }
      });
      setActiveHeadingId(activeId || (headingEls.length ? `heading-0` : null));
    };
    viewport.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [headings]);

  return (
    <main className="flex-1 overflow-hidden flex flex-row relative">
      {/* Main Editor Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea className="flex-1">
          {metadata.cover && (
            <CoverImage
              cover={metadata.cover}
              onChangeCover={onOpenCoverPicker}
              onRemoveCover={onRemoveCover}
            />
          )}
          <div className={cn(
            "mx-auto px-12 md:px-24 transition-all duration-200",
            metadata.fullWidth ? "max-w-[1400px]" : "max-w-[900px]"
          )}>
            {/* Icon + Title (same as before) */}
            <div className={cn("relative group/title", metadata.cover ? (metadata.icon ? "mt-0" : "mt-8") : "mt-16")}>
              {metadata.icon && (
                <div className={cn("relative", metadata.cover ? "-mt-10 mb-2 z-10" : "mb-2")}>
                  <button onClick={onOpenEmojiPicker} className="group/emoji relative text-[78px] leading-[86px] cursor-pointer hover:opacity-80">
                    {metadata.icon}
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover/emoji:opacity-100">
                      <span className="bg-background border rounded-full p-0.5">
                        <X className="h-3 w-3" onClick={(e) => { e.stopPropagation(); onRemoveIcon(); }} />
                      </span>
                    </div>
                  </button>
                </div>
              )}
              <div className={cn("flex gap-2 opacity-0 group-hover/title:opacity-100 mb-2", !metadata.icon && !metadata.cover && "mt-2")}>
                {!metadata.icon && (
                  <button onClick={onOpenEmojiPicker} className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground/60 hover:text-foreground hover:bg-muted/50">
                    <Smile className="h-3.5 w-3.5" /> Add icon
                  </button>
                )}
                {!metadata.cover && (
                  <button onClick={onOpenCoverPicker} className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-muted-foreground/60 hover:text-foreground hover:bg-muted/50">
                    <ImageIcon className="h-3.5 w-3.5" /> Add cover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder="Untitled"
                className={cn("w-full bg-transparent px-0 font-bold tracking-normal text-foreground placeholder:text-muted-foreground/25 focus:outline-none", fontClass, "text-[40px] leading-[1.2]")}
              />
            </div>
            <div className={cn("mt-1 pb-32", fontClass)}>
              <RichTextEditor
                content={bodyMarkdown}
                onChange={onBodyChange}
                editable={true}
                placeholder="Press '/' for commands..."
                showWordCount={true}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Outline Sidebar - Dash Style (like image) */}
      {headings.length > 0 && (
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out border-l border-border bg-background",
            isOutlineOpen ? "w-72" : "w-10 cursor-pointer hover:bg-muted/20"
          )}
          onClick={() => !isOutlineOpen && setIsOutlineOpen(true)}
        >
          {isOutlineOpen ? (
            // Expanded mode: full TOC
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-3 py-3 border-b border-border/40 shrink-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Table of Contents
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOutlineOpen(false); }}
                  className="rounded-md p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 py-2 px-2">
                <div className="flex flex-col gap-1">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.text)}
                      className={cn(
                        "text-left w-full rounded-md px-3 py-1.5 text-sm transition-all",
                        "hover:bg-muted/60",
                        activeHeadingId === h.id
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground",
                        h.level === 2 && "pl-6",
                        h.level === 3 && "pl-9"
                      )}
                    >
                      <span className="truncate block">{h.text}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            // Collapsed mode: vertical strip with horizontal dashes (like the image)
            <div className="flex flex-col items-center justify-start gap-3 py-4 h-full">
              {headings.map((h) => (
                <button
                  key={h.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    // If you want click on dash to scroll without expanding, uncomment next line:
                    // scrollToHeading(h.text);
                    // Otherwise, clicking expands the sidebar (default behavior)
                    setIsOutlineOpen(true);
                  }}
                  className={cn(
                    "transition-all duration-200 rounded-full",
                    activeHeadingId === h.id
                      ? "w-5 h-0.5 bg-primary"  // active dash longer
                      : "w-3 h-0.5 bg-muted-foreground/40 hover:bg-muted-foreground/70 hover:w-4"
                  )}
                  title={h.text}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
