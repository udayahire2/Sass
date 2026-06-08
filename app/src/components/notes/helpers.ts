import type { NoteWithMeta, TreeNode } from "./types";

export function buildTree(notes: NoteWithMeta[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const note of notes) {
    map.set(note.id, { note, children: [] });
  }

  for (const note of notes) {
    const node = map.get(note.id)!;
    const parentId = note.meta.parentId;
    if (parentId && map.has(parentId)) {
      map.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function getAncestors(
  noteId: string,
  notes: NoteWithMeta[]
): NoteWithMeta[] {
  const byId = new Map(notes.map((n) => [n.id, n]));
  const ancestors: NoteWithMeta[] = [];
  let current = byId.get(noteId);
  while (current?.meta.parentId) {
    const parent = byId.get(current.meta.parentId);
    if (!parent || ancestors.includes(parent)) break;
    ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export interface FlattenedNode {
  node: TreeNode;
  depth: number;
}

export function flattenTree(
  nodes: TreeNode[],
  expandedNodes: Set<string>,
  depth: number = 0,
  result: FlattenedNode[] = []
): FlattenedNode[] {
  for (const node of nodes) {
    result.push({ node, depth });
    if (expandedNodes.has(node.note.id) && node.children.length > 0) {
      flattenTree(node.children, expandedNodes, depth + 1, result);
    }
  }
  return result;
}
