/**
 * Notion-style color palette for text and background highlighting.
 * Each color maps to a CSS value that works well in both light and dark modes.
 */

export interface NotionColor {
  name: string;
  /** Label shown in the UI */
  label: string;
  /** CSS color value */
  value: string;
}

// ── Text Colors ─────────────────────────────────────────────
export const NOTION_TEXT_COLORS: NotionColor[] = [
  { name: 'default', label: 'Default', value: '' },
  { name: 'gray', label: 'Gray', value: '#787774' },
  { name: 'brown', label: 'Brown', value: '#9F6B53' },
  { name: 'orange', label: 'Orange', value: '#D9730D' },
  { name: 'yellow', label: 'Yellow', value: '#CB912F' },
  { name: 'green', label: 'Green', value: '#448361' },
  { name: 'blue', label: 'Blue', value: '#337EA9' },
  { name: 'purple', label: 'Purple', value: '#9065B0' },
  { name: 'pink', label: 'Pink', value: '#C14C8A' },
  { name: 'red', label: 'Red', value: '#D44C47' },
];

// ── Background / Highlight Colors ───────────────────────────
export const NOTION_BG_COLORS: NotionColor[] = [
  { name: 'default', label: 'Default', value: '' },
  { name: 'gray_bg', label: 'Gray', value: 'rgba(120,119,116,0.13)' },
  { name: 'brown_bg', label: 'Brown', value: 'rgba(159,107,83,0.13)' },
  { name: 'orange_bg', label: 'Orange', value: 'rgba(217,115,13,0.13)' },
  { name: 'yellow_bg', label: 'Yellow', value: 'rgba(203,145,47,0.13)' },
  { name: 'green_bg', label: 'Green', value: 'rgba(68,131,97,0.13)' },
  { name: 'blue_bg', label: 'Blue', value: 'rgba(51,126,169,0.13)' },
  { name: 'purple_bg', label: 'Purple', value: 'rgba(144,101,176,0.13)' },
  { name: 'pink_bg', label: 'Pink', value: 'rgba(193,76,138,0.13)' },
  { name: 'red_bg', label: 'Red', value: 'rgba(212,76,71,0.13)' },
];

/** Preview swatch color for background highlights (more opaque for visibility) */
export const NOTION_BG_SWATCHES: Record<string, string> = {
  gray_bg: 'rgba(120,119,116,0.25)',
  brown_bg: 'rgba(159,107,83,0.25)',
  orange_bg: 'rgba(217,115,13,0.25)',
  yellow_bg: 'rgba(203,145,47,0.25)',
  green_bg: 'rgba(68,131,97,0.25)',
  blue_bg: 'rgba(51,126,169,0.25)',
  purple_bg: 'rgba(144,101,176,0.25)',
  pink_bg: 'rgba(193,76,138,0.25)',
  red_bg: 'rgba(212,76,71,0.25)',
};
