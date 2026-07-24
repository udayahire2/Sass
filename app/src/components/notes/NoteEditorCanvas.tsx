import { useState, useMemo, useEffect, useRef } from "react";
import { Smile, ImageIcon, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NoteMetadata } from "@/lib/notesMetadata";
import { NoteCoverImage } from "./NoteCoverImage";
import { TOCMinimap, type TOCItemType } from "@/components/ui/toc-minimap";

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

  const tocItems: TOCItemType[] = useMemo(() => {
    return headings.map((h, idx) => ({
      title: h.text,
      url: `#heading-${idx}`,
      depth: h.level + 1,
    }));
  }, [headings]);

  // Assign IDs to ProseMirror heading elements when content or headings change
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    const editorEl = scrollArea.querySelector(".ProseMirror");
    if (!editorEl) return;
    const headingEls = editorEl.querySelectorAll("h1, h2, h3, h4");
    headingEls.forEach((el, idx) => {
      el.id = `heading-${idx}`;
      el.setAttribute("data-toc-id", `heading-${idx}`);
    });
  }, [headings, bodyMarkdown]);

  return (
    <main className="flex-1 overflow-hidden flex flex-row relative bg-background antialiased selection:bg-blue-200/60 dark:selection:bg-blue-500/30">
      <div className="flex-1 min-w-0 flex flex-col">
        <ScrollArea ref={scrollAreaRef} className="flex-1">
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

      {/* Floating Table of Contents Minimap */}
      {tocItems.length > 0 && (
        <div className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 lg:block">
          <TOCMinimap items={tocItems} />
        </div>
      )}
    </main>
  );
}