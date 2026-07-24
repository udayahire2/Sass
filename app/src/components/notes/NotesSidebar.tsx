import {
  Plus,
  X,
  ChevronDown,
  Trash2,
  Undo2,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarNoteItem } from "./SidebarNoteItem";
import { SidebarTreeNode } from "./SidebarTreeNode";
import type { NoteWithMeta, TreeNode } from "./types";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface NotesSidebarProps {
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

export function NotesSidebar({
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
}: NotesSidebarProps) {
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:p-2">
        <div className="flex flex-col gap-2">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/dashboard/student")}
                    className={cn(
                      "w-full justify-start gap-2 px-2",
                      isCollapsed && "justify-center p-0"
                    )}
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="font-semibold group-data-[collapsible=icon]:hidden">
                      Goto Dashboard
                    </span>
                  </Button>
                }
              />
              <TooltipPopup side="right" hidden={!isCollapsed}>
                Goto Dashboard
              </TooltipPopup>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="group-data-[collapsible=icon]:hidden relative px-1 pt-2">
          <Input
            type="text"
            placeholder="Search notes"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 shadow-none"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-2 h-8 w-8 hover:bg-transparent"
              onClick={() => onSearchChange("")}
            >
              <X className="h-4 w-4 opacity-50" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Settings Navigation */}
        <SidebarGroup className="py-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Settings & Appearance"
                onClick={onOpenSettings}
              >
                <Settings />
                <span>Settings & Appearance</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Favorites Section */}
        {favorites.length > 0 && !searchQuery && (
          <SidebarGroup>
            <SidebarGroupLabel
              className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:hidden"
              onClick={onToggleFavoritesExpanded}
            >
              Favorites
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  !favoritesExpanded && "-rotate-90"
                )}
              />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {favoritesExpanded && (
                <SidebarMenu>
                  {favorites.map((note) => (
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
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Private Pages */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Private
          </SidebarGroupLabel>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <SidebarGroupAction
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateNote();
                    }}
                    title="New page"
                  >
                    <Plus />
                  </SidebarGroupAction>
                }
              />
              <TooltipPopup side="right">New page</TooltipPopup>
            </Tooltip>
          </TooltipProvider>

          <SidebarGroupContent>
            <SidebarMenu>
              {searchQuery ? (
                filteredActiveNotes.length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs opacity-40 group-data-[collapsible=icon]:hidden">
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
                <div className="px-3 py-6 text-center text-xs opacity-40 group-data-[collapsible=icon]:hidden">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Trash */}
        {!searchQuery && (
          <SidebarGroup className="mt-auto pt-4">
            <SidebarGroupLabel
              className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:hidden"
              onClick={onToggleTrash}
            >
              Trash {trashedNotes.length > 0 && `(${trashedNotes.length})`}
              <ChevronDown
                className={cn(
                  "ml-auto h-4 w-4 transition-transform",
                  !showTrash && "-rotate-90"
                )}
              />
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {showTrash && (
                <SidebarMenu>
                  {trashedNotes.length === 0 ? (
                    <div className="px-4 py-3 text-xs opacity-30 text-center group-data-[collapsible=icon]:hidden">
                      No pages in trash
                    </div>
                  ) : (
                    trashedNotes.map((note) => (
                      <SidebarMenuItem key={note.id} className="group/trash-item">
                        <SidebarMenuButton tooltip={note.title}>
                          <span>{note.meta.icon || "📄"}</span>
                          <span>{note.title}</span>
                        </SidebarMenuButton>
                        <div className="absolute right-1 top-1 flex items-center gap-0.5 opacity-0 group-hover/trash-item:opacity-100 transition-opacity">
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/10"
                                    onClick={() => onRestoreFromTrash(note.id)}
                                  >
                                    <Undo2 className="h-3 w-3" />
                                  </Button>
                                }
                              />
                              <TooltipPopup>Restore</TooltipPopup>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => onDeletePermanently(note.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                }
                              />
                              <TooltipPopup>Delete permanently</TooltipPopup>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </SidebarMenuItem>
                    ))
                  )}
                </SidebarMenu>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New page" onClick={() => onCreateNote()}>
              <Plus />
              <span>New page</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

