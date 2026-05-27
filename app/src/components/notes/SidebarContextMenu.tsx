import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Pencil, Star, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteWithMeta } from "./types";

interface SidebarContextMenuProps {
  note: NoteWithMeta;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: (note: NoteWithMeta, e: React.MouseEvent) => void;
  onDuplicate: (noteId: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onTrash: (noteId: string) => void;
}

export function SidebarContextMenu({
  note,
  position,
  onClose,
  onRename,
  onDuplicate,
  onToggleFavorite,
  onTrash,
}: SidebarContextMenuProps) {
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
      className="fixed z-[12000] min-w-[190px] rounded-lg border border-border/40 bg-background/85 backdrop-blur-xl p-1 shadow-xl select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          onRename(note, e);
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground cursor-pointer"
      >
        <Pencil className="h-3.5 w-3.5 opacity-60" />
        <span>Rename</span>
      </button>

      <button
        onClick={() => {
          onToggleFavorite(note.id);
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground cursor-pointer"
      >
        <Star className={cn("h-3.5 w-3.5 opacity-60", note.meta.favorite && "fill-amber-500 text-amber-500 opacity-100")} />
        <span>{note.meta.favorite ? "Remove from favorites" : "Add to favorites"}</span>
      </button>

      <button
        onClick={() => {
          onDuplicate(note.id);
          onClose();
        }}
        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-left text-[13px] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-foreground cursor-pointer"
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
        className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-left text-[13px] hover:bg-destructive/10 text-destructive font-medium transition-all cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span>Move to Trash</span>
      </button>
    </div>,
    document.body
  );
}
