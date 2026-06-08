import { useRef, useState } from "react";
import {
  Star,
  MoreHorizontal,
  Copy,
  Trash2,
  Settings2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteMetadata, PageFont } from "@/lib/notesMetadata";
import type { NoteWithMeta } from "./types";

interface EditorHeaderProps {
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
}

export function EditorHeader({
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
}: EditorHeaderProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

  return (
    <header className="flex h-11 items-center justify-between px-2 md:px-3 shrink-0 select-none z-20 relative">
      <div className="flex items-center gap-0.5 min-w-0">
        {/* Mobile menu */}
        <button
          onClick={onToggleSidebar}
          className={cn(
            "rounded-[4px] p-1.5 text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
            sidebarVisible && "md:hidden"
          )}
        >
          {/* REPAIRED SVG: Converted to JSX CamelCase */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-0.5 text-[13px] text-muted-foreground min-w-0 overflow-hidden">
          {ancestors.map((anc) => (
            <span key={anc.id} className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => onSelectAncestor(anc)}
                className="flex items-center gap-1 rounded-[4px] px-1 py-0.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate max-w-[120px]"
              >
                {anc.meta.icon && (
                  <span className="text-sm">{anc.meta.icon}</span>
                )}
                <span className="truncate text-[13px]">
                  {anc.title || "Untitled"}
                </span>
              </button>
              <span className="opacity-30">/</span>
            </span>
          ))}
          <span className="flex items-center gap-1 truncate">
            {metadata.icon && (
              <span className="text-sm">{metadata.icon}</span>
            )}
            <span className="truncate text-foreground text-[13px] font-medium">
              {title || "Untitled"}
            </span>
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        {/* Save status */}
        <span className="hidden md:inline text-[12px] text-muted-foreground/50 mr-2 select-none">
          {isSaving ? "Saving..." : "Saved"}
        </span>

        {/* Favorite */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            "rounded-[4px] p-1.5 transition-colors",
            metadata.favorite
              ? "text-amber-500 hover:bg-amber-500/10"
              : "text-foreground/40 hover:text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5"
          )}
          title={
            metadata.favorite
              ? "Remove from favorites"
              : "Add to favorites"
          }
        >
          <Star
            className={cn(
              "h-4 w-4",
              metadata.favorite && "fill-amber-500"
            )}
          />
        </button>

        {/* Options */}
        <div className="relative" ref={optionsMenuRef}>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-muted-foreground/50 hidden sm:inline-block select-none bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-border/50">
              {metadata.font === 'sans' ? 'Default' : metadata.font === 'serif' ? 'Serif' : 'Mono'}
            </span>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="rounded-[4px] p-1.5 text-foreground/40 hover:text-foreground/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-md border border-border bg-popover p-1 z-[300] animate-in fade-in zoom-in-95 duration-100">
              {/* Font Selection */}
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider">
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
                  onClick={() => {
                    onSetFont(font);
                    setShowOptionsMenu(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                    metadata.font === font
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 text-center text-[15px]",
                      font === "serif" && "font-serif",
                      font === "mono" && "font-mono"
                    )}
                  >
                    {preview}
                  </span>
                  <span>{label}</span>
                  {metadata.font === font && (
                    <Check className="ml-auto h-3.5 w-3.5 text-foreground" />
                  )}
                </button>
              ))}

              <div className="h-px bg-border my-1 mx-1" />

              {/* Width toggle */}
              <button
                onClick={onToggleFullWidth}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Settings2 className="h-4 w-4" />
                <span>Full width</span>
                <div
                  className={cn(
                    "ml-auto h-4 w-7 rounded-full transition-colors flex items-center px-0.5",
                    metadata.fullWidth
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                >
                  <div
                    className={cn(
                      "h-3 w-3 rounded-full bg-background border border-border transition-transform",
                      metadata.fullWidth && "translate-x-3"
                    )}
                  />
                </div>
              </button>

              <div className="h-px bg-border my-1 mx-1" />

              {/* Duplicate & Trash */}
              <button
                onClick={() => {
                  onDuplicate();
                  setShowOptionsMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
              <button
                onClick={() => {
                  onTrash();
                  setShowOptionsMenu(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-1.5 text-[13px] text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Move to Trash
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}