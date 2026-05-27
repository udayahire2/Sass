import { Smile, ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/editor/RichTextEditor";
import type { NoteMetadata } from "@/lib/notesMetadata";

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
}: PageCanvasProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      {/* Page content area */}
      <div
        className={cn(
          "mx-auto px-12 md:px-24 transition-all duration-200",
          metadata.fullWidth
            ? "max-w-[1400px]"
            : "max-w-[900px]"
        )}
      >
        {/* Icon + Controls zone */}
        <div
          className={cn(
            "relative group/title",
            metadata.cover ? "-mt-20 pt-4" : "mt-16"
          )}
        >
          {/* Floating Emoji */}
          {metadata.icon && (
            <div className="relative mb-2">
              <button
                onClick={onOpenEmojiPicker}
                className="group/emoji relative text-[78px] leading-[86px] cursor-pointer hover:opacity-80 transition-opacity"
              >
                {metadata.icon}
                <div className="absolute -top-1 -right-1 opacity-0 group-hover/emoji:opacity-100 transition-opacity">
                  <span className="bg-background border rounded-full p-0.5 shadow-sm">
                    <X
                      className="h-3 w-3 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveIcon();
                      }}
                    />
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Add icon / Add cover buttons */}
          <div
            className={cn(
              "flex gap-2 opacity-0 group-hover/title:opacity-100 transition-opacity mb-2",
              !metadata.icon && !metadata.cover && "mt-2"
            )}
          >
            {!metadata.icon && (
              <button
                onClick={onOpenEmojiPicker}
                className="flex items-center gap-1 rounded-[4px] px-1.5 py-1 text-[12px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <Smile className="h-3.5 w-3.5" />
                Add icon
              </button>
            )}
            {!metadata.cover && (
              <button
                onClick={onOpenCoverPicker}
                className="flex items-center gap-1 rounded-[4px] px-1.5 py-1 text-[12px] text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-all"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                Add cover
              </button>
            )}
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Untitled"
            className={cn(
              "w-full border-none bg-transparent px-0 font-bold tracking-[-0.03em] text-foreground placeholder:text-muted-foreground/25 focus:outline-none",
              fontClass,
              "text-[40px] leading-[1.2]"
            )}
          />
        </div>

        {/* Editor */}
        <div className={cn("mt-1 pb-32", fontClass)}>
          <RichTextEditor
            content={bodyMarkdown}
            onChange={onBodyChange}
            editable={true}
            placeholder="Press '/' for commands, or start typing…"
            showWordCount={true}
          />
        </div>
      </div>
    </main>
  );
}
