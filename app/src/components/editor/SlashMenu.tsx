import { useEffect, useRef, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Editor } from '@tiptap/react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  FileCode,
  Quote,
  Table,
  Minus,
  Image,
  Code,
  type LucideIcon,
  Heading4
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface SlashItem {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  icon: LucideIcon;
  category: 'basic' | 'media' | 'advanced';
  action: (editor: Editor) => void;
}

/**
 * Clears the slash command text (everything in the current paragraph node)
 * and then runs the provided chain callback in a SINGLE transaction.
 */
function clearSlashAndRun(
  editor: Editor,
  run: (chain: ReturnType<Editor['chain']>) => void
) {
  const { $from } = editor.state.selection;
  const start = $from.start();
  const end = $from.end();

  const chain = editor.chain().focus().deleteRange({ from: start, to: end });
  run(chain);
}

export const ALL_SLASH_ITEMS: SlashItem[] = [
  {
    id: 'text',
    label: 'Text',
    description: 'Just start writing with plain text.',
    icon: Type,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.setParagraph().run());
    }
  },
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Big section heading.',
    shortcut: '#',
    icon: Heading1,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleHeading({ level: 1 }).run());
    }
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium section heading.',
    shortcut: '##',
    icon: Heading2,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleHeading({ level: 2 }).run());
    }
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small section heading.',
    shortcut: '###',
    icon: Heading3,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleHeading({ level: 3 }).run());
    }
  },
  {
    id: 'h4',
    label: 'Heading 4',
    description: 'Extra Small section heading.',
    shortcut: '####',
    icon: Heading4,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleHeading({ level: 4 }).run());
    }
  },
  
  {
    id: 'bullet-list',
    label: 'Bulleted List',
    description: 'Create a simple bulleted list.',
    icon: List,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleBulletList().run());
    }
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Create a list with numbering.',
    icon: ListOrdered,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleOrderedList().run());
    }
  },
  {
    id: 'blockquote',
    label: 'Quote',
    description: 'Capture a quote.',
    icon: Quote,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.toggleBlockquote().run());
    }
  },
  {
    id: 'divider',
    label: 'Divider',
    description: 'Visually divide blocks.',
    shortcut: '---',
    icon: Minus,
    category: 'basic',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) => chain.setHorizontalRule().run());
    }
  },
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Capture a code snippet.',
    shortcut: '```',
    icon: FileCode,
    category: 'advanced',
    action: (editor: Editor) => {
      const { $from } = editor.state.selection;
      const start = $from.start();
      const end = $from.end();

      editor
        .chain()
        .focus()
        .deleteRange({ from: start, to: end })
        .setCodeBlock()
        .run();
    }
  },
  {
    id: 'inline-code',
    label: 'Inline Code',
    description: 'Small code within text.',
    icon: Code,
    category: 'advanced',
    action: (editor: Editor) => {
      const { $from } = editor.state.selection;
      const start = $from.start();
      const end = $from.end();

      editor
        .chain()
        .focus()
        .deleteRange({ from: start, to: end })
        .run();

      requestAnimationFrame(() => {
        editor
          .chain()
          .focus()
          .toggleCode()
          .insertContent(' ')
          .run();
      });
    }
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Add a simple table.',
    icon: Table,
    category: 'advanced',
    action: (editor: Editor) => {
      clearSlashAndRun(editor, (chain) =>
        chain.insertNotionTable().run()
      );
    }
  },
  {
    id: 'image',
    label: 'Image',
    description: 'Embed with a URL.',
    icon: Image,
    category: 'media',
    action: (editor: Editor) => {
      const { $from } = editor.state.selection;
      const start = $from.start();
      const end = $from.end();
      editor.chain().focus().deleteRange({ from: start, to: end }).run();

      const url = window.prompt('Enter the image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  },
];

interface SlashMenuProps {
  editor: Editor;
  isOpen: boolean;
  selectedIndex: number;
  filteredItems: SlashItem[];
}

export default function SlashMenu({
  editor,
  isOpen,
  selectedIndex,
  filteredItems
}: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (!isOpen || !editor) {
      setVisible(false);
      return;
    }

    try {
      const { view } = editor;
      const coords = view.coordsAtPos(view.state.selection.from);

      let top = coords.bottom + 8;
      let left = coords.left;

      const menuEl = menuRef.current;
      if (menuEl) {
        const menuRect = menuEl.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (left + menuRect.width + 12 > vw) {
          left = vw - menuRect.width - 12;
        }
        if (left < 12) left = 12;

        if (top + menuRect.height + 12 > vh) {
          top = coords.top - menuRect.height - 8;
        }
        if (top < 12) top = 12;
      }

      setPos({ top, left });
      setVisible(true);
    } catch {
      setVisible(false);
    }
  }, [isOpen, editor, filteredItems, selectedIndex]);

  useEffect(() => {
    if (selectedRef.current && menuRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!editor || !isOpen) return null;

  const basicItems = filteredItems.filter(i => i.category === 'basic');
  const advancedItems = filteredItems.filter(i => i.category === 'advanced');
  const mediaItems = filteredItems.filter(i => i.category === 'media');

  let globalIndex = 0;

  const renderGroup = (label: string, items: SlashItem[]) => {
    if (items.length === 0) return null;
    return (
      <div key={label}>
        <div className="px-2 py-1.5 font-medium text-muted-foreground text-xs select-none">
          {label}
        </div>
        <div className="space-y-0.5">
          {items.map((item) => {
            const currentIndex = globalIndex++;
            return (
              <button
                key={item.id}
                ref={currentIndex === selectedIndex ? selectedRef : undefined}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  item.action(editor);
                }}
                className={cn(
                  "flex w-full min-h-8 cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1 text-sm text-foreground outline-none text-left transition-all cursor-pointer sm:min-h-7 [&>svg]:pointer-events-none [&>svg]:shrink-0",
                  currentIndex === selectedIndex
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-foreground/80 hover:bg-muted/70"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-6 w-6 rounded-md border shrink-0 transition-colors",
                  currentIndex === selectedIndex
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border/60 bg-muted/40 text-muted-foreground"
                )}>
                  <item.icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs truncate">{item.label}</div>
                </div>
                {item.shortcut && (
                  <span className="text-[10px] text-muted-foreground/40 font-mono shrink-0 select-none">
                    {item.shortcut}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const menu = (
    <div
      ref={menuRef}
      data-slash-menu
      className={cn(
        "fixed rounded-lg border bg-popover not-dark:bg-clip-padding shadow-lg/5 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] focus:outline-none dark:before:shadow-[0_-1px_--theme(--color-white/6%)] h-[320px] w-64 overflow-hidden z-[9999] flex flex-col select-none",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
      )}
      style={{
        top: pos.top,
        left: pos.left,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
    >
      <ScrollArea className="flex-1 max-h-[305px]">
        <div className="py-1 px-1">
          {renderGroup('Basic blocks', basicItems)}
          {renderGroup('Code & Tables', advancedItems)}
          {renderGroup('Media', mediaItems)}
          {filteredItems.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground/60 select-none">
              <p className="font-medium">No results</p>
              <p className="mt-1 text-[10px]">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return createPortal(menu, document.body);
}
