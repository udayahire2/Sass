import type { Note } from "@/services/api";
import type { NoteMetadata } from "@/lib/notesMetadata";

export interface NoteWithMeta extends Note {
  meta: NoteMetadata;
  bodyMarkdown: string;
}

export interface TreeNode {
  note: NoteWithMeta;
  children: TreeNode[];
}
