
import {
  Plus,
  Search,
  X,
  ChevronDown,
  ChevronsLeft,
  Trash,
  Undo2,
  Trash2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNoteItem } from "./SidebarNoteItem";
import { SidebarTreeNode } from "./SidebarTreeNode";
import type { NoteWithMeta, TreeNode } from "./types";
import { useNavigate } from "react-router-dom";

interface NotesPageSidebarProps {
  isSidebarPinned: boolean;
  sidebarHovered: boolean;
  onSidebarHover: (hovered: boolean) => void;
  onTogglePin: () => void;
  activeNoteId: string | null;
  favorites: NoteWithMeta[];
  tree: TreeNode[];
  trashedNotes: NoteWithMeta[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedNodes: Set<string>;
  onToggleExpanded: (nodeId: string) => void;
  showTrash: boolean;
  onToggleTrash: () => void;
  favoritesExpanded: boolean;
  onToggleFavoritesExpanded: () => void;
  filteredActiveNotes: NoteWithMeta[];
  renamingNoteId: string | null;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onSelectNote: (note: NoteWithMeta) => void;
  onStartRename: (note: NoteWithMeta, e: React.MouseEvent) => void;
  onMoveToTrash: (noteId: string) => void;
  onRestoreFromTrash: (noteId: string) => void;
  onDeletePermanently: (noteId: string) => void;
  onDuplicateNote: (noteId: string) => void;
  onCreateNote: (parentId?: string) => void;
  onToggleFavorite: (noteId: string) => void;
  onOpenSettings: () => void;
  onContextMenu?: (note: NoteWithMeta, e: React.MouseEvent) => void;
}

export function NotesPageSidebar({
  isSidebarPinned,
  sidebarHovered,
  onSidebarHover,
  onTogglePin,
  activeNoteId,
  favorites,
  tree,
  trashedNotes,
  searchQuery,
  onSearchChange,
  expandedNodes,
  onToggleExpanded,
  showTrash,
  onToggleTrash,
  favoritesExpanded,
  onToggleFavoritesExpanded,
  filteredActiveNotes,
  renamingNoteId,
  renameValue,
  onRenameValueChange,
  renameInputRef,
  onCommitRename,
  onCancelRename,
  onSelectNote,
  onStartRename,
  onMoveToTrash,
  onRestoreFromTrash,
  onDeletePermanently,
  onDuplicateNote,
  onCreateNote,
  onToggleFavorite,
  onOpenSettings,
  onContextMenu,
}: NotesPageSidebarProps) {
  const navigate = useNavigate();
  const sidebarVisible = isSidebarPinned || sidebarHovered;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r transition-all duration-300 ease-in-out md:relative",
        "bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] border-[color:var(--sidebar-border)]",
        sidebarVisible
          ? "translate-x-0 opacity-100 md:shadow-none"
          : "-translate-x-full opacity-0 pointer-events-none md:w-0 md:min-w-0 md:border-0"
      )}
      onMouseLeave={() => {
        if (!isSidebarPinned) onSidebarHover(false);
      }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2.5 min-h-[46px]">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 rounded-[4px] px-2 py-1 text-sm font-medium text-[color:var(--sidebar-foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate max-w-[180px]"
        >
          <div className="h-5 w-5 rounded-[4px] bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
            S
          </div>
          <span className="truncate text-[13px]">Study Notes</span>
        </button>
        <button
          onClick={onTogglePin}
          className="rounded-[4px] p-1 text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          title={isSidebarPinned ? "Collapse sidebar" : "Pin sidebar"}
        >
          <ChevronsLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              !isSidebarPinned && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 pb-1">
        <div className="flex items-center gap-2 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-[5px] text-[color:var(--sidebar-foreground)] transition-colors">
          <Search className="h-3.5 w-3.5 opacity-50 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent border-none text-[13px] outline-none placeholder:opacity-40"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange("")}>
              <X className="h-3 w-3 opacity-40 hover:opacity-80" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="px-2 pb-1">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings & Appearance</span>
        </button>
      </div>

      {/* Scrollable content - overflow-x-visible allows dropdown to expand */}
      <div className="flex-1 overflow-y-auto overflow-x-visible px-1 py-1 notion-sidebar-scroll">
        {/* Favorites Section */}
        {favorites.length > 0 && !searchQuery && (
          <div className="mb-1">
            <button
              onClick={() => onToggleFavoritesExpanded()}
              className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[color:var(--sidebar-foreground)] opacity-50 hover:bg-black/5 dark:hover:bg-white/5 rounded-[4px] hover:opacity-100 transition-all"
            >
              <ChevronDown
                className={cn(
                  "h-2.5 w-2.5 transition-transform",
                  !favoritesExpanded && "-rotate-90"
                )}
              />
              Favorites
            </button>
            {favoritesExpanded &&
              favorites.map((note) => (
                <SidebarNoteItem
                  key={`fav-${note.id}`}
                  note={note}
                  isActive={activeNoteId === note.id}
                  depth={0}
                  onSelect={() => onSelectNote(note)}
                  onRename={(e) => onStartRename(note, e)}
                  onTrash={() => onMoveToTrash(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                  onAddChild={() => onCreateNote(note.id)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  renamingNoteId={renamingNoteId}
                  renameValue={renameValue}
                  setRenameValue={onRenameValueChange}
                  renameInputRef={renameInputRef}
                  commitRename={onCommitRename}
                  cancelRename={onCancelRename}
                  onContextMenu={(e) => onContextMenu?.(note, e)}
                />
              ))}
          </div>
        )}

        {/* Private Pages */}
        <div className="mb-1">
          <div className="group flex items-center justify-between px-2 py-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <span className="text-[11px] font-semibold text-[color:var(--sidebar-foreground)] opacity-50">
              Private
            </span>
            <button
              onClick={() => onCreateNote()}
              className="rounded-[4px] p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              title="New page"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {searchQuery ? (
            filteredActiveNotes.length === 0 ? (
              <div className="px-3 py-6 text-center text-[12px] opacity-40">
                No results
              </div>
            ) : (
              filteredActiveNotes.map((note) => (
                <SidebarNoteItem
                  key={note.id}
                  note={note}
                  isActive={activeNoteId === note.id}
                  depth={0}
                  onSelect={() => onSelectNote(note)}
                  onRename={(e) => onStartRename(note, e)}
                  onTrash={() => onMoveToTrash(note.id)}
                  onDuplicate={() => onDuplicateNote(note.id)}
                  onAddChild={() => onCreateNote(note.id)}
                  onToggleFavorite={() => onToggleFavorite(note.id)}
                  renamingNoteId={renamingNoteId}
                  renameValue={renameValue}
                  setRenameValue={onRenameValueChange}
                  renameInputRef={renameInputRef}
                  commitRename={onCommitRename}
                  cancelRename={onCancelRename}
                  onContextMenu={(e) => onContextMenu?.(note, e)}
                />
              ))
            )
          ) : tree.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12px] opacity-40">
              No pages yet
            </div>
          ) : (
            tree.map((node) => (
              <SidebarTreeNode
                key={node.note.id}
                node={node}
                depth={0}
                activeNoteId={activeNoteId}
                expandedNodes={expandedNodes}
                toggleExpanded={onToggleExpanded}
                onSelect={onSelectNote}
                onRename={onStartRename}
                onTrash={onMoveToTrash}
                onDuplicate={onDuplicateNote}
                onAddChild={(parentId) => onCreateNote(parentId)}
                onToggleFavorite={onToggleFavorite}
                renamingNoteId={renamingNoteId}
                renameValue={renameValue}
                setRenameValue={onRenameValueChange}
                renameInputRef={renameInputRef}
                commitRename={onCommitRename}
                cancelRename={onCancelRename}
                onContextMenu={onContextMenu}
              />
            ))
          )}
        </div>

        {/* Trash */}
        {!searchQuery && (
          <div className="mt-1 border-t border-[color:var(--sidebar-border)]">
            <button
              onClick={() => onToggleTrash()}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all rounded-[4px] mt-1"
            >
              <Trash className="h-4 w-4" />
              <span>Trash</span>
              {trashedNotes.length > 0 && (
                <span className="ml-auto text-[10px] opacity-50">
                  {trashedNotes.length}
                </span>
              )}
            </button>
            {showTrash && trashedNotes.length > 0 && (
              <div className="py-1">
                {trashedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[13px] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all mx-1"
                  >
                    <span className="text-sm">
                      {note.meta.icon || "📄"}
                    </span>
                    <span className="flex-1 truncate">{note.title}</span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onRestoreFromTrash(note.id)}
                        className="rounded-[3px] p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                        title="Restore"
                      >
                        <Undo2 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeletePermanently(note.id)}
                        className="rounded p-0.5 hover:bg-destructive/10 text-destructive"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showTrash && trashedNotes.length === 0 && (
              <div className="px-4 py-3 text-[11px] opacity-30 text-center">
                No pages in trash
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Page Button */}
      <div className="border-t border-[color:var(--sidebar-border)] px-2 py-2">
        <button
          onClick={() => onCreateNote()}
          className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Plus className="h-4 w-4" />
          New page
        </button>
      </div>
    </aside>
  );
}
