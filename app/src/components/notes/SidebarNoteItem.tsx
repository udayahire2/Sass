import { useEffect, useRef, useState } from "react";
import { ChevronRight, MoreHorizontal, Plus, Trash2, Pencil, Star, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { ItemMenuButton } from "./ItemMenuButton";
import type { NoteWithMeta } from "./types";
import gsap from "gsap";

interface SidebarNoteItemProps {
  note: NoteWithMeta;
  isActive: boolean;
  depth: number;
  onSelect: () => void;
  onRename: (e: React.MouseEvent) => void;
  onTrash: () => void;
  onDuplicate: () => void;
  onAddChild: () => void;
  onToggleFavorite: () => void;
  renamingNoteId: string | null;
  renameValue: string;
  setRenameValue: (v: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  commitRename: () => void;
  cancelRename: () => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  // NEW: optional children to animate collapsible
  children?: React.ReactNode;
}

export function SidebarNoteItem({
  note,
  isActive,
  depth,
  onSelect,
  onRename,
  onTrash,
  onDuplicate,
  onAddChild,
  onToggleFavorite,
  renamingNoteId,
  renameValue,
  setRenameValue,
  renameInputRef,
  commitRename,
  cancelRename,
  hasChildren,
  isExpanded,
  onToggleExpand,
  onContextMenu,
  children, // receive nested items
}: SidebarNoteItemProps) {
  const isRenaming = renamingNoteId === note.id;
  const [showItemMenu, setShowItemMenu] = useState(false);
  const itemMenuRef = useRef<HTMLDivElement>(null);
  
  // Refs for GSAP animations
  const itemRef = useRef<HTMLDivElement>(null);
  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  // 1. Entrance animation (fade + slide)
  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(itemRef.current, 
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
    }
  }, []);

  // 2. Expand/collapse animation for children
  useEffect(() => {
    if (!childrenContainerRef.current || !hasChildren) return;
    const el = childrenContainerRef.current;
    if (isExpanded) {
      // Expand: set height to auto and animate from 0
      gsap.to(el, {
        height: "auto",
        duration: 0.3,
        ease: "power2.inOut",
        opacity: 1,
        onStart: () => {
          gsap.set(el, { opacity: 0 });
        },
        onComplete: () => {
          gsap.set(el, { height: "auto", opacity: 1 });
        }
      });
    } else {
      // Collapse: animate to 0 height
      const currentHeight = el.scrollHeight;
      gsap.to(el, {
        height: 0,
        duration: 0.25,
        ease: "power2.inOut",
        opacity: 0,
        onComplete: () => {
          gsap.set(el, { height: 0, opacity: 0 });
        }
      });
    }
  }, [isExpanded, hasChildren]);

  // 3. Chevron rotation with GSAP (smoother than CSS)
  useEffect(() => {
    if (chevronRef.current) {
      gsap.to(chevronRef.current, {
        rotate: isExpanded ? 90 : 0,
        duration: 0.25,
        ease: "power2.inOut",
      });
    }
  }, [isExpanded]);

  // Rename auto‑focus
  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming, renameInputRef]);

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!showItemMenu) return;
    const handler = (e: PointerEvent) => {
      if (itemMenuRef.current && !itemMenuRef.current.contains(e.target as Node)) {
        setShowItemMenu(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowItemMenu(false);
    };
    document.addEventListener("pointerdown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("pointerdown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [showItemMenu]);

  return (
    <>
      <div
        ref={itemRef}
        className={cn(
          "group/item relative flex items-center rounded-[4px] mx-1 transition-all duration-150 cursor-pointer",
          isActive
            ? "bg-sidebar-accent text-[color:var(--sidebar-foreground)] font-medium"
            : "text-[color:var(--sidebar-foreground)] opacity-80 hover:opacity-100 hover:bg-sidebar-accent"
        )}
        style={{ paddingLeft: `${depth * 18 + 4}px` }}
        onClick={() => !isRenaming && onSelect()}
        onContextMenu={(e) => {
          if (!isRenaming && onContextMenu) {
            e.preventDefault();
            e.stopPropagation();
            onContextMenu(e);
          }
        }}
      >
        {/* Expand toggle */}
        {hasChildren !== undefined && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand?.();
            }}
            className="shrink-0 rounded-[3px] p-0.5 hover:bg-sidebar-accent transition-colors"
            aria-expanded={isExpanded}
          >
            <ChevronRight
              ref={chevronRef}
              className="h-3 w-3 opacity-40"
            />
          </button>
        )}

        {/* Icon / Emoji */}
        <span className="text-[14px] shrink-0 w-5 text-center mr-1">
          {note.meta.icon || (hasChildren !== undefined ? (isExpanded ? "📂" : "📁") : "📄")}
        </span>

        {/* Title / Rename input */}
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commitRename();
                onSelect();
                setTimeout(() => {
                  const editorEl = document.querySelector('.ProseMirror') as HTMLElement | null;
                  editorEl?.focus();
                }, 50);
              }
              if (e.key === "Escape") cancelRename();
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-w-0 rounded-[4px] border border-primary/30 bg-background px-1 py-0.5 text-[13px] text-foreground outline-none"
            aria-label="Rename note"
          />
        ) : (
          <span className="flex-1 truncate text-[13px] py-1 leading-tight">
            {note.title || "Untitled"}
          </span>
        )}

        {/* Hover actions (only when not renaming) */}
        {!isRenaming && (
          <div className="flex items-center gap-0 opacity-0 group-hover/item:opacity-100 transition-opacity pr-1 shrink-0">
            <div className="relative" ref={itemMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowItemMenu((prev) => !prev);
                }}
                className="rounded-[3px] p-0.5 hover:bg-sidebar-accent transition-colors"
                title="Options"
                aria-haspopup="true"
                aria-expanded={showItemMenu}
              >
                <MoreHorizontal className="h-3.5 w-3.5 opacity-50" />
              </button>

              {showItemMenu && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-[8px] border bg-popover p-1 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="menu"
                >
                  <ItemMenuButton
                    icon={Pencil}
                    label="Rename"
                    onClick={(e) => {
                      onRename(e);
                      setShowItemMenu(false);
                    }}
                  />
                  <ItemMenuButton
                    icon={Star}
                    label={note.meta.favorite ? "Remove from favorites" : "Add to favorites"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                      setShowItemMenu(false);
                    }}
                  />
                  <ItemMenuButton
                    icon={Copy}
                    label="Duplicate"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate();
                      setShowItemMenu(false);
                    }}
                  />
                  <div className="h-px bg-border mx-1 my-0.5" />
                  <ItemMenuButton
                    icon={Trash2}
                    label="Move to Trash"
                    destructive
                    onClick={(e) => {
                      e.stopPropagation();
                      onTrash();
                      setShowItemMenu(false);
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddChild();
              }}
              className="rounded-[3px] p-0.5 hover:bg-sidebar-accent transition-colors"
              title="Add a page inside"
            >
              <Plus className="h-3.5 w-3.5 opacity-50" />
            </button>
          </div>
        )}
      </div>

      {/* Children container (collapsible) */}
      {hasChildren && (
        <div
          ref={childrenContainerRef}
          className="overflow-hidden"
          style={{ height: 0, opacity: 0 }} // initial hidden state
        >
          {children}
        </div>
      )}
    </>
  );
}