import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Star, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteWithMeta } from "./types";

interface NotesSidebarContextMenuProps {
  note: NoteWithMeta;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: (note: NoteWithMeta, e: React.MouseEvent) => void;
  onDuplicate: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onTrash: (noteId: string) => void;
  theme?: string;
}

export function NotesSidebarContextMenu({
  note,
  position,
  onClose,
  onRename,
  onDuplicate,
  onToggleFavorite,
  onTrash,
  theme,
}: NotesSidebarContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Position viewport check
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;

    let x = position.x;
    let y = position.y;

    if (x + rect.width + padding > window.innerWidth) {
      x = window.innerWidth - rect.width - padding;
    }
    if (y + rect.height + padding > window.innerHeight) {
      y = window.innerHeight - rect.height - padding;
    }

    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
  }, [position]);

  // Click outside close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();

    document.addEventListener("mousedown", handler);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[12000] min-w-[190px] rounded-lg border p-1 shadow-lg/5 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus:outline-none dark:before:shadow-[0_-1px_--theme(--color-white/6%)] select-none animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl",
        theme === "light" && "theme-light-editor bg-white text-[#37352f] border-[#edece9]",
        theme === "dark" && "theme-dark-editor bg-[#191919] text-white border-[#ffffff14]",
        theme === "sepia" && "theme-sepia-editor bg-[#fbf6ec] text-[#433422] border-amber-100/50",
        theme === "nord" && "theme-nord-editor bg-[#2e3440] text-[#d8dee9] border-slate-700/50"
      )}
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          onRename(note, e);
          onClose();
        }}
        className="flex w-full min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground outline-none text-left transition-all cursor-pointer sm:min-h-7 hover:bg-sidebar-accent [&>svg]:pointer-events-none [&>svg]:shrink-0"
      >
        <Pencil className="h-3.5 w-3.5 opacity-60" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => {
          onToggleFavorite(note.id);
          onClose();
        }}
        className="flex w-full min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground outline-none text-left transition-all cursor-pointer sm:min-h-7 hover:bg-sidebar-accent [&>svg]:pointer-events-none [&>svg]:shrink-0"
      >
        <Star className={cn("h-3.5 w-3.5 opacity-60", note.meta.favorite && "fill-amber-500 text-amber-500 opacity-100")} />
        <span>{note.meta.favorite ? "Remove from favorites" : "Add to favorites"}</span>
      </button>

      <button
        onClick={() => {
          onDuplicate(note.id);
          onClose();
        }}
        className="flex w-full min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground outline-none text-left transition-all cursor-pointer sm:min-h-7 hover:bg-sidebar-accent [&>svg]:pointer-events-none [&>svg]:shrink-0"
      >
        <Copy className="h-3.5 w-3.5 opacity-60" />
        <span>Duplicate</span>
      </button>

      <div className="h-px bg-border/40 my-1 mx-1" />

      <button
        onClick={() => {
          onTrash(note.id);
          onClose();
        }}
        className="flex w-full min-h-8 cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-sm text-destructive outline-none text-left font-medium transition-all cursor-pointer sm:min-h-7 hover:bg-destructive/10 [&>svg]:pointer-events-none [&>svg]:shrink-0"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Move to Trash</span>
      </button>
    </div>,
    document.body
  );
}
