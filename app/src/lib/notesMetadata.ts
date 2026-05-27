/**
 * Notes Metadata — YAML-like frontmatter parser/serializer
 *
 * Stores page-level metadata (icon, cover, favorite, font, width, trash, parentId)
 * inside the note's content_markdown using a simple frontmatter block.
 *
 * Format:
 * ---
 * icon: 📝
 * cover: linear-gradient(...)
 * favorite: true
 * font: sans
 * fullWidth: false
 * trash: false
 * parentId: abc123
 * ---
 * <actual markdown content>
 */

export type PageFont = 'sans' | 'serif' | 'mono';

export interface NoteMetadata {
  icon: string;
  cover: string;
  favorite: boolean;
  font: PageFont;
  fullWidth: boolean;
  trash: boolean;
  parentId: string;
}

export const DEFAULT_METADATA: NoteMetadata = {
  icon: '',
  cover: '',
  favorite: false,
  font: 'sans',
  fullWidth: false,
  trash: false,
  parentId: '',
};

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;

/**
 * Parse the frontmatter block from a markdown string.
 * Returns both the metadata and the remaining content.
 */
export function parseNoteContent(raw: string): {
  metadata: NoteMetadata;
  content: string;
} {
  if (!raw) {
    return { metadata: { ...DEFAULT_METADATA }, content: '' };
  }

  const match = raw.match(FRONTMATTER_REGEX);
  if (!match) {
    return { metadata: { ...DEFAULT_METADATA }, content: raw };
  }

  const frontmatterBlock = match[1];
  const content = raw.slice(match[0].length);
  const metadata: NoteMetadata = { ...DEFAULT_METADATA };

  for (const line of frontmatterBlock.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    switch (key) {
      case 'icon':
        metadata.icon = value;
        break;
      case 'cover':
        metadata.cover = value;
        break;
      case 'favorite':
        metadata.favorite = value === 'true';
        break;
      case 'font':
        if (value === 'sans' || value === 'serif' || value === 'mono') {
          metadata.font = value;
        }
        break;
      case 'fullWidth':
        metadata.fullWidth = value === 'true';
        break;
      case 'trash':
        metadata.trash = value === 'true';
        break;
      case 'parentId':
        metadata.parentId = value;
        break;
    }
  }

  return { metadata, content };
}

/**
 * Serialize metadata + content back into a markdown string with frontmatter.
 * Only includes non-default values to keep the frontmatter minimal.
 */
export function serializeNoteContent(
  metadata: NoteMetadata,
  content: string
): string {
  const lines: string[] = [];

  if (metadata.icon) lines.push(`icon: ${metadata.icon}`);
  if (metadata.cover) lines.push(`cover: ${metadata.cover}`);
  if (metadata.favorite) lines.push(`favorite: true`);
  if (metadata.font !== 'sans') lines.push(`font: ${metadata.font}`);
  if (metadata.fullWidth) lines.push(`fullWidth: true`);
  if (metadata.trash) lines.push(`trash: true`);
  if (metadata.parentId) lines.push(`parentId: ${metadata.parentId}`);

  if (lines.length === 0) {
    return content;
  }

  return `---\n${lines.join('\n')}\n---\n${content}`;
}
