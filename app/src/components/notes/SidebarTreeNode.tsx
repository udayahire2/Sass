import { SidebarNoteItem } from "./SidebarNoteItem";
import type { NoteWithMeta, TreeNode } from "./types";

interface SidebarTreeNodeProps {
  node: TreeNode;
  depth: number;
  activeNoteId: string | null;
  expandedNodes: Set<string>;
  toggleExpanded: (id: string) => void;
  onSelect: (note: NoteWithMeta) => void;
  onRename: (note: NoteWithMeta, e: React.MouseEvent) => void;
  onTrash: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onToggleFavorite: (id: string) => void;
  renamingNoteId: string | null;
  renameValue: string;
  setRenameValue: (v: string) => void;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  commitRename: () => void;
  cancelRename: () => void;
  onContextMenu?: (note: NoteWithMeta, e: React.MouseEvent) => void;
}

export function SidebarTreeNode({
  node,
  depth,
  activeNoteId,
  expandedNodes,
  toggleExpanded,
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
  onContextMenu,
}: SidebarTreeNodeProps) {
  const isExpanded = expandedNodes.has(node.note.id);
  const hasChildren = node.children.length > 0;

  return (
    <>
      <SidebarNoteItem
        note={node.note}
        isActive={activeNoteId === node.note.id}
        depth={depth}
        onSelect={() => onSelect(node.note)}
        onRename={(e) => onRename(node.note, e)}
        onTrash={() => onTrash(node.note.id)}
        onDuplicate={() => onDuplicate(node.note.id)}
        onAddChild={() => onAddChild(node.note.id)}
        onToggleFavorite={() => onToggleFavorite(node.note.id)}
        renamingNoteId={renamingNoteId}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        renameInputRef={renameInputRef}
        commitRename={commitRename}
        cancelRename={cancelRename}
        hasChildren={hasChildren || undefined}
        isExpanded={isExpanded}
        onToggleExpand={() => toggleExpanded(node.note.id)}
        onContextMenu={(e) => onContextMenu?.(node.note, e)}
      />
      {isExpanded &&
        node.children.map((child) => (
          <SidebarTreeNode
            key={child.note.id}
            node={child}
            depth={depth + 1}
            activeNoteId={activeNoteId}
            expandedNodes={expandedNodes}
            toggleExpanded={toggleExpanded}
            onSelect={onSelect}
            onRename={onRename}
            onTrash={onTrash}
            onDuplicate={onDuplicate}
            onAddChild={onAddChild}
            onToggleFavorite={onToggleFavorite}
            renamingNoteId={renamingNoteId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            renameInputRef={renameInputRef}
            commitRename={commitRename}
            cancelRename={cancelRename}
            onContextMenu={onContextMenu}
          />
        ))}
    </>
  );
}
