import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  MoreHorizontal,
  Plus,
  Trash2,
  Pencil,
  Star,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteWithMeta } from "./types";
import gsap from "gsap";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "../ui/sidebar";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
} from "../ui/menu";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Input } from "../ui/input";

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
  children,
}: SidebarNoteItemProps) {
  const isRenaming = renamingNoteId === note.id;

  // Refs for GSAP animations
  const itemRef = useRef<HTMLLIElement>(null);
  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);

  // 1. Entrance animation (fade + slide)
  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
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
        },
      });
    } else {
      gsap.to(el, {
        height: 0,
        duration: 0.25,
        ease: "power2.inOut",
        opacity: 0,
        onComplete: () => {
          gsap.set(el, { height: 0, opacity: 0 });
        },
      });
    }
  }, [isExpanded, hasChildren]);

  // 3. Chevron rotation with GSAP
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

  return (
    <>
      <SidebarMenuItem ref={itemRef} className="group/item relative">
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => !isRenaming && onSelect()}
          onContextMenu={(e) => {
            if (!isRenaming && onContextMenu) {
              e.preventDefault();
              e.stopPropagation();
              onContextMenu(e);
            }
          }}
          className={cn("h-8 group-data-[collapsible=icon]:p-0", isRenaming && "p-0.5")}
          style={{
            paddingLeft: depth === 0 ? undefined : `${depth * 18 + 8}px`,
          }}
          tooltip={note.title || "Untitled"}
        >
          {/* Expand toggle */}
          {hasChildren !== undefined && (
            <div
              className="group-data-[collapsible=icon]:hidden shrink-0 rounded-sm p-0.5 hover:bg-sidebar-accent transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand?.();
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
            >
              <ChevronRight
                ref={chevronRef}
                className="h-3 w-3 opacity-40 transition-transform"
              />
            </div>
          )}

          {/* Icon / Emoji */}
          <span className="text-sm shrink-0 w-4 text-center">
            {note.meta.icon ||
              (hasChildren !== undefined
                ? isExpanded
                  ? "📂"
                  : "📁"
                : "📄")}
          </span>

          {/* Title / Rename input */}
          <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            {isRenaming ? (
              <Input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    commitRename();
                    onSelect();
                    setTimeout(() => {
                      const editorEl = document.querySelector(
                        ".ProseMirror"
                      ) as HTMLElement | null;
                      editorEl?.focus();
                    }, 50);
                  }
                  if (e.key === "Escape") cancelRename();
                }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 min-w-0 rounded-md px-1.5 py-0 text-sm shadow-none focus-visible:ring-1"
                aria-label="Rename note"
              />
            ) : (
              <span className="block truncate text-sm">
                {note.title || "Untitled"}
              </span>
            )}
          </div>
        </SidebarMenuButton>

        {/* Hover actions (only when not renaming) */}
        {!isRenaming && (
          <>
            <Menu>
              <MenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal />
                  </SidebarMenuAction>
                }
              />
              <MenuPopup align="start" side="right">
                <MenuItem
                  onClick={(e) => {
                    onRename(e as any);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Rename
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                >
                  <Star className="mr-2 h-4 w-4" />{" "}
                  {note.meta.favorite
                    ? "Remove from favorites"
                    : "Add to favorites"}
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Duplicate
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrash();
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                </MenuItem>
              </MenuPopup>
            </Menu>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <SidebarMenuAction
                      showOnHover
                      className="right-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddChild();
                      }}
                    >
                      <Plus />
                    </SidebarMenuAction>
                  }
                />
                <TooltipPopup>Add a page inside</TooltipPopup>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </SidebarMenuItem>

      {/* Children container (collapsible) */}
      {hasChildren && (
        <div
          ref={childrenContainerRef}
          className="overflow-hidden group-data-[collapsible=icon]:hidden"
          style={{ height: 0, opacity: 0 }}
        >
          {children}
        </div>
      )}
    </>
  );
}