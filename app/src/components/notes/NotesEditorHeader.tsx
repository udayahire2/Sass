import { useRef, useState } from "react";
import {
  Check,
  Copy,
  MoreHorizontal,
  Settings2,
  Star,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteMetadata, PageFont } from "@/lib/notesMetadata";
import type { NoteWithMeta } from "./types";
import { useTheme } from "@/components/theme-provider";

interface NotesEditorHeaderProps {
  title: string;
  metadata: NoteMetadata;
  ancestors: NoteWithMeta[];
  activeNoteId: string | null;
  isSaving: boolean;
  sidebarVisible: boolean;
  onSelectAncestor: (note: NoteWithMeta) => void;
  onToggleFavorite: () => void;
  onToggleSidebar: () => void;
  onToggleFullWidth: () => void;
  onSetFont: (font: PageFont) => void;
  onDuplicate: () => void;
  onTrash: () => void;
  onOpenEmojiPicker: () => void;
  onOpenCoverPicker: () => void;
  onToggleTheme: () => void;
}

export function NotesEditorHeader({
  title,
  metadata,
  ancestors,
  sidebarVisible,
  isSaving,
  onSelectAncestor,
  onToggleFavorite,
  onToggleSidebar,
  onToggleFullWidth,
  onSetFont,
  onDuplicate,
  onTrash,
  onToggleTheme,
}: NotesEditorHeaderProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  return (
    <header className="relative z-40 flex h-10 shrink-0 select-none items-center justify-between border-b border-transparent bg-background/80 px-1.5 backdrop-blur-sm md:px-2">
      <div className="flex min-w-0 items-center gap-1">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            "grid size-7 place-items-center rounded-[4px] text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5",
            sidebarVisible && "md:hidden",
          )}
          aria-label="Toggle sidebar"
        >
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          >
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        </button>

        <nav className="flex min-w-0 items-center gap-0.5 overflow-hidden text-[12px] leading-none text-muted-foreground">
          {ancestors.map((anc) => (
            <span key={anc.id} className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => onSelectAncestor(anc)}
                className="flex max-w-[112px] items-center gap-1 truncate rounded-[4px] px-1.5 py-1 transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                {anc.meta.icon && (
                  <span className="text-[13px] leading-none">{anc.meta.icon}</span>
                )}
                <span className="truncate">{anc.title || "Untitled"}</span>
              </button>
              <span className="text-muted-foreground/35">/</span>
            </span>
          ))}

          <span className="flex min-w-0 items-center gap-1 truncate rounded-[4px] px-1.5 py-1">
            {metadata.icon && (
              <span className="text-[13px] leading-none">{metadata.icon}</span>
            )}
            <span className="truncate text-[12px] font-medium text-foreground/85">
              {title || "Untitled"}
            </span>
          </span>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <span className="mr-1 hidden text-[11px] text-muted-foreground/45 md:inline">
          {isSaving ? "Saving..." : "Saved"}
        </span>

        <button
          type="button"
          onClick={onToggleTheme}
          className="grid size-7 place-items-center rounded-[4px] text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
          title="Toggle color theme"
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={cn(
            "grid size-7 place-items-center rounded-[4px] transition-colors",
            metadata.favorite
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5",
          )}
          title={metadata.favorite ? "Remove from favorites" : "Add to favorites"}
          aria-label={metadata.favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn("size-3.5", metadata.favorite && "fill-amber-500")} />
        </button>

        <div className="relative" ref={optionsMenuRef}>
          <button
            type="button"
            onClick={() => setShowOptionsMenu((open) => !open)}
            className="grid size-7 place-items-center rounded-[4px] text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
            aria-label="More note options"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-full z-[300] mt-1 w-52 rounded-[8px] border border-border/50 bg-background/95 p-1 shadow-xl shadow-black/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2 py-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/50">
                  Style
                </span>
              </div>

              {(
                [
                  ["sans", "Default", "Ag"],
                  ["serif", "Serif", "Ag"],
                  ["mono", "Mono", "Ag"],
                ] as const
              ).map(([font, label, preview]) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onSetFont(font);
                    setShowOptionsMenu(false);
                  }}
                  className={cn(
                    "flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-[12px] transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                    metadata.font === font
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "w-5 text-center text-[14px]",
                      font === "serif" && "font-serif",
                      font === "mono" && "font-mono",
                    )}
                  >
                    {preview}
                  </span>
                  <span>{label}</span>
                  {metadata.font === font && (
                    <Check className="ml-auto size-3.5 text-primary" />
                  )}
                </button>
              ))}

              <div className="mx-1 my-1 h-px bg-border/70" />

              <button
                type="button"
                onClick={onToggleFullWidth}
                className="flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-[12px] text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                <Settings2 className="size-3.5" />
                <span>Full width</span>
                <div
                  className={cn(
                    "ml-auto flex h-3.5 w-6 items-center rounded-full px-0.5 transition-colors",
                    metadata.fullWidth ? "bg-primary" : "bg-muted-foreground/20",
                  )}
                >
                  <div
                    className={cn(
                      "size-2.5 rounded-full bg-white shadow-sm transition-transform",
                      metadata.fullWidth && "translate-x-2.5",
                    )}
                  />
                </div>
              </button>

              <div className="mx-1 my-1 h-px bg-border/70" />

              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  setShowOptionsMenu(false);
                }}
                className="flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-[12px] text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
              >
                <Copy className="size-3.5" />
                Duplicate
              </button>
              <button
                type="button"
                onClick={() => {
                  onTrash();
                  setShowOptionsMenu(false);
                }}
                className="flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-[12px] text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
                Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
