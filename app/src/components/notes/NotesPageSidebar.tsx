import { useMemo } from "react";
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
import { useNavigate } from "react-router-dom";
import { flattenTree } from "./helpers";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import { useNotesState } from "@/context/NotesContext";

export function NotesPageSidebar() {
  const {
    isSidebarPinned,
    sidebarHovered,
    setSidebarHovered,
    setIsSidebarPinned,
    activeNoteId,
    favoritesExpanded,
    setFavoritesExpanded,
    searchQuery,
    setSearchQuery,
    showTrash,
    setShowTrash,
    filteredActiveNotes,
    tree,
    expandedNodes,
    toggleExpanded,
    trashedNotes,
    favoriteNotes: favorites,
    renamingNoteId,
    renameValue,
    setRenameValue,
    renameInputRef,
    commitRename,
    setRenamingNoteId,
    selectNote,
    startRename,
    handleMoveToTrash,
    handleRestoreFromTrash,
    handleDeletePermanently,
    handleDuplicateNote,
    handleCreateNote,
    handleToggleFavorite,
    setShowSettings,
    setSidebarMenu,
  } = useNotesState();

  const navigate = useNavigate();
  const sidebarVisible = isSidebarPinned || sidebarHovered;

  // Virtualization Setup
  const rows = useMemo(() => {
    const list: any[] = [];
    
    // 1. Favorites
    if (favorites.length > 0 && !searchQuery) {
      list.push({ type: 'favorites-header' });
      if (favoritesExpanded) {
        favorites.forEach(note => list.push({ type: 'favorite', note }));
      }
    }
    
    // 2. Private (Tree or Search)
    list.push({ type: 'private-header' });
    if (searchQuery) {
      if (filteredActiveNotes.length === 0) {
        list.push({ type: 'empty-search' });
      } else {
        filteredActiveNotes.forEach(note => list.push({ type: 'search-result', note }));
      }
    } else {
      if (tree.length === 0) {
        list.push({ type: 'empty-tree' });
      } else {
        const flatTree = flattenTree(tree, expandedNodes);
        flatTree.forEach(item => list.push({ type: 'tree-node', node: item.node, depth: item.depth }));
      }
    }

    // 3. Trash
    if (!searchQuery) {
      list.push({ type: 'trash-header' });
      if (showTrash) {
        if (trashedNotes.length === 0) {
          list.push({ type: 'empty-trash' });
        } else {
          trashedNotes.forEach(note => list.push({ type: 'trash-note', note }));
        }
      }
    }
    
    return list;
  }, [
    favorites, favoritesExpanded, searchQuery, filteredActiveNotes, 
    tree, expandedNodes, showTrash, trashedNotes
  ]);

  const getItemSize = (index: number) => {
    const row = rows[index];
    switch (row.type) {
      case 'favorites-header': return 28;
      case 'private-header': return 32;
      case 'trash-header': return 40;
      case 'favorite': return 30;
      case 'search-result': return 30;
      case 'tree-node': return 30;
      case 'trash-note': return 32;
      case 'empty-search': return 60;
      case 'empty-tree': return 60;
      case 'empty-trash': return 40;
      default: return 30;
    }
  };

  const Row = ({ index, style, ariaAttributes }: { index: number; style: React.CSSProperties; ariaAttributes?: any }) => {
    const row = rows[index];
    if (!row) return null;

    return (
      <div style={style} {...ariaAttributes} className="px-1 overflow-x-visible">
        {row.type === 'favorites-header' && (
          <button
            onClick={() => setFavoritesExpanded(!favoritesExpanded)}
            className="flex w-full items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[color:var(--sidebar-foreground)] opacity-50 hover:bg-black/5 dark:hover:bg-white/5 rounded-[4px] hover:opacity-100 transition-all mt-1"
          >
            <ChevronDown
              className={cn("h-2.5 w-2.5 transition-transform", !favoritesExpanded && "-rotate-90")}
            />
            Favorites
          </button>
        )}

        {row.type === 'favorite' && (
          <SidebarNoteItem
            note={row.note}
            isActive={activeNoteId === row.note.id}
            depth={0}
            onSelect={() => selectNote(row.note)}
            onRename={(e) => startRename(row.note, e)}
            onTrash={() => handleMoveToTrash(row.note.id)}
            onDuplicate={() => handleDuplicateNote(row.note.id)}
            onAddChild={() => handleCreateNote(row.note.id)}
            onToggleFavorite={() => handleToggleFavorite(row.note.id)}
            renamingNoteId={renamingNoteId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameInputRef={renameInputRef}
            commitRename={commitRename}
            cancelRename={() => setRenamingNoteId(null)}
            onContextMenu={(e) => setSidebarMenu({ note: row.note, x: e.clientX, y: e.clientY })}
          />
        )}

        {row.type === 'private-header' && (
          <div className="group flex items-center justify-between px-2 py-1 mt-1 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer">
            <span className="text-[11px] font-semibold text-[color:var(--sidebar-foreground)] opacity-50">
              Private
            </span>
            <button
              onClick={() => handleCreateNote()}
              className="rounded-[4px] p-0.5 opacity-0 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              title="New page"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {row.type === 'search-result' && (
          <SidebarNoteItem
            note={row.note}
            isActive={activeNoteId === row.note.id}
            depth={0}
            onSelect={() => selectNote(row.note)}
            onRename={(e) => startRename(row.note, e)}
            onTrash={() => handleMoveToTrash(row.note.id)}
            onDuplicate={() => handleDuplicateNote(row.note.id)}
            onAddChild={() => handleCreateNote(row.note.id)}
            onToggleFavorite={() => handleToggleFavorite(row.note.id)}
            renamingNoteId={renamingNoteId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameInputRef={renameInputRef}
            commitRename={commitRename}
            cancelRename={() => setRenamingNoteId(null)}
            onContextMenu={(e) => setSidebarMenu({ note: row.note, x: e.clientX, y: e.clientY })}
          />
        )}

        {row.type === 'tree-node' && (
          <SidebarNoteItem
            note={row.node.note}
            isActive={activeNoteId === row.node.note.id}
            depth={row.depth}
            onSelect={() => selectNote(row.node.note)}
            onRename={(e) => startRename(row.node.note, e)}
            onTrash={() => handleMoveToTrash(row.node.note.id)}
            onDuplicate={() => handleDuplicateNote(row.node.note.id)}
            onAddChild={() => handleCreateNote(row.node.note.id)}
            onToggleFavorite={() => handleToggleFavorite(row.node.note.id)}
            renamingNoteId={renamingNoteId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameInputRef={renameInputRef}
            commitRename={commitRename}
            cancelRename={() => setRenamingNoteId(null)}
            hasChildren={row.node.children.length > 0 || undefined}
            isExpanded={expandedNodes.has(row.node.note.id)}
            onToggleExpand={() => toggleExpanded(row.node.note.id)}
            onContextMenu={(e) => setSidebarMenu({ note: row.node.note, x: e.clientX, y: e.clientY })}
          />
        )}

        {row.type === 'trash-header' && (
          <div className="pt-1 mt-1 border-t border-[color:var(--sidebar-border)]">
            <button
              onClick={() => setShowTrash(!showTrash)}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all rounded-[4px]"
            >
              <Trash className="h-4 w-4" />
              <span>Trash</span>
              {trashedNotes.length > 0 && (
                <span className="ml-auto text-[10px] opacity-50">
                  {trashedNotes.length}
                </span>
              )}
            </button>
          </div>
        )}

        {row.type === 'trash-note' && (
          <div className="group flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[13px] opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all mx-1">
            <span className="text-sm">{row.note.meta.icon || ""}</span>
            <span className="flex-1 truncate">{row.note.title}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleRestoreFromTrash(row.note.id)}
                className="rounded-[3px] p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
                title="Restore"
              >
                <Undo2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => handleDeletePermanently(row.note.id)}
                className="rounded p-0.5 hover:bg-destructive/10 text-destructive"
                title="Delete permanently"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {row.type === 'empty-search' && (
          <div className="px-3 py-6 text-center text-[12px] opacity-40">No results</div>
        )}
        {row.type === 'empty-tree' && (
          <div className="px-3 py-6 text-center text-[12px] opacity-40">No pages yet</div>
        )}
        {row.type === 'empty-trash' && (
          <div className="px-4 py-3 text-[11px] opacity-30 text-center">No pages in trash</div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r transition-all duration-300 ease-in-out md:relative",
        "bg-[color:var(--sidebar)] text-[color:var(--sidebar-foreground)] border-[color:var(--sidebar-border)]",
        sidebarVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0 pointer-events-none md:w-0 md:min-w-0 md:border-0"
      )}
      onMouseLeave={() => {
        if (!isSidebarPinned) setSidebarHovered(false);
      }}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-3 py-2.5 min-h-[46px] shrink-0">
        <button
          onClick={() => navigate("/dashboard/student")}
          className="flex items-center gap-2 rounded-[4px] px-2 py-1 text-sm font-medium text-[color:var(--sidebar-foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors truncate max-w-[180px]"
        >
          <div className="h-5 w-5 rounded-[4px] border border-[color:var(--sidebar-border)] bg-[color:var(--sidebar-accent)] flex items-center justify-center text-[10px] font-semibold text-[color:var(--sidebar-foreground)] shrink-0">
            S
          </div>
          <span className="truncate text-[13px]">Study Notes</span>
        </button>
        <button
          onClick={() => setIsSidebarPinned(!isSidebarPinned)}
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
      <div className="px-2 pb-1 shrink-0">
        <div className="flex items-center gap-2 rounded-[4px] hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-[5px] text-[color:var(--sidebar-foreground)] transition-colors">
          <Search className="h-3.5 w-3.5 opacity-50 shrink-0" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-[13px] outline-none placeholder:opacity-40"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X className="h-3 w-3 opacity-40 hover:opacity-80" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="px-2 pb-1 shrink-0">
        <button
          onClick={() => setShowSettings(true)}
          className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings & Appearance</span>
        </button>
      </div>

      {/* Virtualized List Container */}
      <div className="flex-1 overflow-hidden notion-sidebar-scroll relative">
        <AutoSizer renderProp={({ height, width }) => {
          if (height === undefined || width === undefined) return null;
          return (
            <List<{}>
              className="notion-sidebar-scroll overflow-x-hidden"
              rowCount={rows.length}
              rowHeight={getItemSize}
              rowComponent={Row}
              rowProps={{}}
              style={{ height, width }}
            />
          );
        }} />
      </div>

      {/* New Page Button */}
      <div className="border-t border-[color:var(--sidebar-border)] px-2 py-2 shrink-0">
        <button
          onClick={() => handleCreateNote()}
          className="flex w-full items-center gap-2 rounded-[4px] px-2.5 py-1.5 text-[13px] text-[color:var(--sidebar-foreground)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
        >
          <Plus className="h-4 w-4" />
          New page
        </button>
      </div>
    </aside>
  );
}
