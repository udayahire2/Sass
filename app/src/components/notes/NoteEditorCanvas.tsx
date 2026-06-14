import { useState, useMemo, useEffect, useRef } from 'react';
import { Smile, ImageIcon, X, BookOpen, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NoteMetadata } from "@/lib/notesMetadata";
import { NoteCoverImage } from "./NoteCoverImage";

interface NoteEditorCanvasProps {
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
  showWordCount?: boolean;
  spellcheck?: boolean;
}

export function NoteEditorCanvas({
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
  showWordCount = true,
  spellcheck = false,
}: NoteEditorCanvasProps) {
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    const viewport = scrollArea.querySelector('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;
    const handleScroll = () => {
      const editorEl = scrollArea.querySelector('.ProseMirror');
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
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {metadata.cover && (
            <NoteCoverImage
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
                <div className={cn("relative inline-block group/emoji", metadata.cover ? "-mt-10 mb-2 z-10" : "mb-2")}>
                  <button
                    onClick={onOpenEmojiPicker}
                    className="text-[78px] leading-[86px] cursor-pointer hover:opacity-80 focus:outline-none"
                  >
                    {metadata.icon}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveIcon();
                    }}
                    className="absolute -top-1 -right-1 opacity-0 group-hover/emoji:opacity-100 bg-background border border-border hover:bg-accent text-muted-foreground hover:text-foreground rounded-full p-0.5 shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-center h-5 w-5 z-20"
                  >
                    <X className="h-3 w-3" />
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
                spellCheck={false}
                className={cn("w-full bg-transparent px-0 font-bold tracking-normal text-foreground placeholder:text-muted-foreground/25 focus:outline-none", fontClass, "text-[40px] leading-[1.2]")}
              />
            </div>
            <div className={cn("mt-1 pb-32", fontClass)}>
              <RichTextEditor
                content={bodyMarkdown}
                onChange={onBodyChange}
                editable={true}
                placeholder="Press '/' for commands..."
                showWordCount={showWordCount}
                spellcheck={spellcheck}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Outline Sidebar */}
      {headings.length > 0 && (
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out bg-background flex-shrink-0 z-10",
            isOutlineOpen ? "w-[280px] border-l border-border/40 shadow-sm" : "w-10 cursor-pointer hover:bg-accent/50 border-l border-border/10"
          )}
          onClick={() => !isOutlineOpen && setIsOutlineOpen(true)}
        >
          {isOutlineOpen ? (
            <div className="flex flex-col h-full w-full">
              <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <span className="text-[12px] font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Table of contents
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOutlineOpen(false); }}
                  className="rounded-[4px] p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 px-2 pb-4">
                <div className="flex flex-col gap-[2px]">
                  {headings.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => scrollToHeading(h.text)}
                      className={cn(
                        "text-left rounded-[4px] px-2.5 py-1.5 text-[13px] transition-colors focus:outline-none",
                        activeHeadingId === h.id
                          ? "text-foreground font-medium bg-accent/60"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground",
                        h.level === 1 && "ml-0 w-full",
                        h.level === 2 && "ml-3 w-[calc(100%-12px)]",
                        h.level === 3 && "ml-6 w-[calc(100%-24px)]"
                      )}
                    >
                      <span className="truncate block leading-snug">{h.text}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-start gap-2 py-3 h-full w-full select-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOutlineOpen(true);
                }}
                className="rounded-[4px] p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-accent mb-2 cursor-pointer transition-colors"
                title="Table of contents"
              >
                <ChevronsRight className="h-4 w-4 rotate-180" />
              </button>

              {headings.map((h) => (
                <div key={h.id} className="group/dash relative flex items-center justify-center w-full py-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollToHeading(h.text);
                    }}
                    className={cn(
                      "transition-all duration-200 rounded-full cursor-pointer",
                      activeHeadingId === h.id
                        ? "w-4 h-1 bg-primary/70"
                        : "w-2.5 h-1 bg-muted-foreground/30 hover:bg-muted-foreground/60 hover:w-3.5"
                    )}
                  />
                  <div className="absolute right-full mr-3 px-2 py-1 bg-popover/95 backdrop-blur-sm border border-border/40 text-foreground text-[11px] font-medium rounded shadow-sm opacity-0 scale-95 group-hover/dash:opacity-100 group-hover/dash:scale-100 pointer-events-none transition-all duration-150 translate-x-1 group-hover/dash:translate-x-0 whitespace-nowrap z-50">
                    {h.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
