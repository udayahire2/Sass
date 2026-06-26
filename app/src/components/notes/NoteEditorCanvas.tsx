import { useState, useMemo, useEffect, useRef } from "react";
import { Smile, ImageIcon, X, ChevronRight } from "lucide-react";
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
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [collapsedHeadings, setCollapsedHeadings] = useState<Set<string>>(
    new Set(),
  );
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const headings = useMemo(() => {
    if (!bodyMarkdown) return [];
    const lines = bodyMarkdown.split("\n");
    const items: { text: string; level: number; id: string }[] = [];
    lines.forEach((line) => {
      const match = line.match(/^(#{1,4})\s+(.+)$/);
      if (match) {
        items.push({
          text: match[2].replace(/[_*`[\]]/g, "").trim(),
          level: match[1].length,
          id: `heading-${items.length}`,
        });
      }
    });
    return items;
  }, [bodyMarkdown]);

  // Tree computation: Determine which items are visible and which have children
  const treeNodes = useMemo(() => {
    const nodes = [];
    let currentCollapsedLevel = Infinity;

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];

      // Reset collapse threshold if we move back up the tree (e.g., hit a new H1)
      if (h.level <= currentCollapsedLevel) {
        currentCollapsedLevel = Infinity;
      }

      // Skip this node if it's trapped under a collapsed parent
      if (currentCollapsedLevel < h.level) {
        continue;
      }

      const hasChildren =
        i + 1 < headings.length && headings[i + 1].level > h.level;
      const isCollapsed = collapsedHeadings.has(h.id);

      if (isCollapsed) {
        currentCollapsedLevel = h.level;
      }

      nodes.push({ ...h, hasChildren, isCollapsed, originalIndex: i });
    }
    return nodes;
  }, [headings, collapsedHeadings]);

  const toggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsedHeadings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToHeading = (headingIndex: number) => {
    const editorEl = scrollAreaRef.current?.querySelector(".ProseMirror");
    if (!editorEl) return;
    const headingEl = editorEl.querySelectorAll("h1, h2, h3, h4")[headingIndex];
    if (headingEl) {
      headingEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    const viewport = scrollArea.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport) return;
    const handleScroll = () => {
      const editorEl = scrollArea.querySelector(".ProseMirror");
      if (!editorEl) return;
      const headingEls = editorEl.querySelectorAll("h1, h2, h3, h4");
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
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [headings]);

  return (
    <main className="flex-1 overflow-hidden flex flex-row relative bg-background antialiased selection:bg-blue-200/60 dark:selection:bg-blue-500/30">
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1">
          {/* ... [KEEP EXISTING METADATA/TITLE/EDITOR CODE EXACTLY THE SAME] ... */}
          {metadata.cover && (
            <NoteCoverImage
              cover={metadata.cover}
              onChangeCover={onOpenCoverPicker}
              onRemoveCover={onRemoveCover}
            />
          )}

          <div
            className={cn(
              "mx-auto px-12 sm:px-16 md:px-24",
              metadata.fullWidth
                ? "max-w-none w-full"
                : "max-w-255 lg:max-w-177 px-4 sm:px-0",
            )}
          >
            <div
              className={cn(
                "relative group/title flex flex-col",
                metadata.cover ? "mt-0" : "mt-[8vh]",
              )}
            >
              {!metadata.cover && !metadata.icon && <div className="h-8" />}
              {metadata.icon && (
                <div
                  className={cn(
                    "relative inline-block group/emoji w-fit",
                    metadata.cover ? "-mt-12 mb-4 z-10" : "mb-4",
                  )}
                >
                  <button
                    onClick={onOpenEmojiPicker}
                    className="text-[78px] leading-[1.1] cursor-pointer hover:bg-accent/50 rounded-lg transition-colors focus:outline-none"
                  >
                    {metadata.icon}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveIcon();
                    }}
                    className="absolute top-0 right-0 opacity-0 group-hover/emoji:opacity-100 bg-muted border border-border text-muted-foreground hover:text-foreground rounded-full p-1 shadow-sm cursor-pointer flex items-center justify-center transition-opacity z-20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div
                className={cn(
                  "flex gap-3 opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 mb-2 h-8 items-center",
                  metadata.icon && "absolute -top-8 left-0",
                )}
              >
                {!metadata.icon && (
                  <button
                    onClick={onOpenEmojiPicker}
                    className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <Smile className="h-4 w-4" /> Add icon
                  </button>
                )}
                {!metadata.cover && (
                  <button
                    onClick={onOpenCoverPicker}
                    className="flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-medium text-muted-foreground/70 hover:text-foreground hover:bg-accent/60 transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" /> Add cover
                  </button>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={onTitleChange}
                placeholder="Untitled"
                spellCheck={false}
                className={cn(
                  "w-full bg-transparent px-0 font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none transition-colors",
                  fontClass,
                  "text-[40px] leading-[1.2] tracking-[-0.03em]",
                )}
              />
            </div>
            <div className={cn("mt-2 pb-[30vh] text-base", fontClass)}>
              <RichTextEditor
                content={bodyMarkdown}
                onChange={onBodyChange}
                editable={true}
                placeholder="Press '/' for commands"
                showWordCount={showWordCount}
                spellcheck={spellcheck}
              />
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Floating Collapsible Table of Contents */}
      {treeNodes.length > 0 && (
        <div
          className="group/toc absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
          aria-label="Table of contents"
        >
          <div className="relative min-h-45 w-18.5">
            {/* Visual Indicators */}
            {(() => {
              const visibleNodes = treeNodes.slice(0, 8);
              const nodeCount = visibleNodes.length;
              if (nodeCount === 0) return null;
              const spacing = 20;
              const padding = 10;
              const height = (nodeCount - 1) * spacing + padding * 2;
              const activeIndex = visibleNodes.findIndex((h) => h.id === activeHeadingId);
              const activeY = activeIndex !== -1 ? padding + activeIndex * spacing : padding;

              return (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 flex items-center justify-center group-hover/toc:opacity-0 group-hover/toc:pointer-events-none group-focus-within/toc:opacity-0 group-focus-within/toc:pointer-events-none transition-all duration-300">
                  <svg width="20" height={height} viewBox={`0 0 20 ${height}`} className="overflow-visible">
                    {/* Track */}
                    <line
                      x1="10"
                      y1={padding}
                      x2="10"
                      y2={height - padding}
                      stroke="currentColor"
                      className="text-muted-foreground/15"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    
                    {/* Dots for each heading */}
                    {visibleNodes.map((h, i) => {
                      const y = padding + i * spacing;
                      const isMain = h.level === 1;
                      const size = isMain ? 3.5 : 2.5;
                      return (
                        <circle
                          key={h.id}
                          cx="10"
                          cy={y}
                          r={size}
                          className={cn(
                            "fill-muted-foreground/30 transition-all duration-300 hover:fill-muted-foreground/75 cursor-pointer",
                            activeHeadingId === h.id && "fill-primary"
                          )}
                          onClick={() => scrollToHeading(h.originalIndex)}
                        />
                      );
                    })}

                    {/* Smooth glowing active indicator circle */}
                    {activeIndex !== -1 && (
                      <g className="transition-all duration-300 ease-out" style={{ transform: `translateY(${activeY - padding}px)` }}>
                        {/* Glow element */}
                        <circle
                          cx="10"
                          cy={padding}
                          r="6"
                          className="fill-primary/20 animate-pulse"
                        />
                        {/* Main active dot */}
                        <circle
                          cx="10"
                          cy={padding}
                          r="3.5"
                          className="fill-primary"
                        />
                      </g>
                    )}
                  </svg>
                </div>
              );
            })()}

            {/* Popover Card */}
            <nav className="absolute right-8 top-1/2 max-h-[min(400px,calc(100vh-96px))] w-70 -translate-y-1/2 opacity-0 scale-95 pointer-events-none group-hover/toc:opacity-100 group-hover/toc:scale-100 group-hover/toc:pointer-events-auto group-focus-within/toc:opacity-100 group-focus-within/toc:scale-100 group-focus-within/toc:pointer-events-auto transition-all duration-300 ease-out origin-right overflow-hidden rounded-xl border border-border bg-background/95 p-2 shadow-xl backdrop-blur-xl">
              <ScrollArea
                className="max-h-[calc(min(400px,100vh-96px)-16px)]"
                disableLenis
              >
                <div className="flex flex-col gap-0.5">
                  {treeNodes.map((h) => (
                    <div
                      key={h.id}
                      className={cn(
                        "group/item flex items-center w-full rounded-md transition-colors",
                        activeHeadingId === h.id
                          ? "bg-accent/60"
                          : "hover:bg-accent/40",
                        h.level === 1 && "mt-1",
                        h.level === 2 && "pl-4",
                        h.level === 3 && "pl-8",
                        h.level >= 4 && "pl-12",
                      )}
                    >
                      {/* Arrow Toggle Button */}
                      <div className="flex items-center justify-center w-5 h-5 shrink-0 ml-1">
                        {h.hasChildren ? (
                          <button
                            onClick={(e) => toggleCollapse(e, h.id)}
                            className="p-0.5 rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
                          >
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 transition-transform duration-200",
                                !h.isCollapsed && "rotate-90",
                              )}
                            />
                          </button>
                        ) : (
                          <span className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Main Heading Text Button */}
                      <button
                        type="button"
                        onClick={() => scrollToHeading(h.originalIndex)}
                        className={cn(
                          "flex-1 truncate text-left px-1.5 py-1.5 focus-visible:outline-none",
                          activeHeadingId === h.id
                            ? "text-foreground font-medium"
                            : "text-muted-foreground group-hover/item:text-foreground",
                          h.level === 1 && "text-sm",
                          h.level > 1 && "text-[13px]",
                        )}
                      >
                        {h.text}
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </nav>
          </div>
        </div>
      )}
    </main>
  );
}
