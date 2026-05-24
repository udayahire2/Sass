import { useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Copy,
  Scissors,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  FileCode,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ContextMenuProps {
  editor: Editor;
  position: { x: number; y: number };
  onClose: () => void;
}

type SubMenu = 'none' | 'turnInto';

export default function ContextMenu({ editor, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [subMenu, setSubMenu] = useState<SubMenu>('none');

  // Position the menu within viewport bounds
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const padding = 8;

    let x = position.x;
    let y = position.y;

    if (x + rect.width + padding > window.innerWidth) {
      x = window.innerWidth - rect.width - padding;
    }
    if (y + rect.height + padding > window.innerHeight) {
      y = window.innerHeight - rect.height - padding;
    }

    menuRef.current.style.left = `${x}px`;
    menuRef.current.style.top = `${y}px`;
  }, [position]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handleCopy = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    navigator.clipboard.writeText(text);
    onClose();
  };

  const handleCut = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    navigator.clipboard.writeText(text);
    editor.chain().focus().deleteSelection().run();
    onClose();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
    onClose();
  };

  const turnIntoItems = [
    { label: 'Text', icon: Type, action: () => editor.chain().focus().setParagraph().run() },
    { label: 'Heading 1', icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 as const }).run() },
    { label: 'Heading 2', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 as const }).run() },
    { label: 'Heading 3', icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 as const }).run() },
    { label: 'Bullet List', icon: List, action: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Numbered List', icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Code Block', icon: FileCode, action: () => editor.chain().focus().toggleCodeBlock().run() },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[220px] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/15 py-1.5 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ left: position.x, top: position.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Text Formatting Section */}
      <div className="px-1.5 py-0.5">
        <span className="px-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">Format</span>
      </div>

      <div className="flex items-center gap-0.5 px-2 py-1">
        <ContextFormatButton
          icon={BoldIcon}
          isActive={editor.isActive('bold')}
          onClick={() => handleAction(() => editor.chain().focus().toggleBold().run())}
          title="Bold"
        />
        <ContextFormatButton
          icon={ItalicIcon}
          isActive={editor.isActive('italic')}
          onClick={() => handleAction(() => editor.chain().focus().toggleItalic().run())}
          title="Italic"
        />
        <ContextFormatButton
          icon={UnderlineIcon}
          isActive={editor.isActive('underline')}
          onClick={() => handleAction(() => editor.chain().focus().toggleUnderline().run())}
          title="Underline"
        />
        <ContextFormatButton
          icon={StrikeIcon}
          isActive={editor.isActive('strike')}
          onClick={() => handleAction(() => editor.chain().focus().toggleStrike().run())}
          title="Strikethrough"
        />
        <ContextFormatButton
          icon={CodeIcon}
          isActive={editor.isActive('code')}
          onClick={() => handleAction(() => editor.chain().focus().toggleCode().run())}
          title="Code"
        />
        <ContextFormatButton
          icon={LinkIcon}
          isActive={editor.isActive('link')}
          onClick={() => {
            const url = window.prompt('Enter URL:', editor.getAttributes('link').href || '');
            if (url !== null) {
              if (url.trim() === '') {
                editor.chain().focus().extendMarkRange('link').unsetLink().run();
              } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
              }
            }
            onClose();
          }}
          title="Link"
        />
      </div>

      <div className="h-px bg-border/40 mx-2 my-1" />

      {/* Turn Into Sub-menu */}
      <div className="relative px-1">
        <button
          type="button"
          onMouseEnter={() => setSubMenu('turnInto')}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground/80 hover:bg-muted/70 transition-colors cursor-pointer"
        >
          <Type className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="flex-1 text-left">Turn into</span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
        </button>

        {/* Turn Into Submenu */}
        {subMenu === 'turnInto' && (
          <div
            className="absolute left-full top-0 ml-1 min-w-[180px] rounded-xl border border-border/50 bg-popover/95 backdrop-blur-xl shadow-2xl shadow-black/10 py-1 animate-in fade-in slide-in-from-left-1 duration-100"
            onMouseLeave={() => setSubMenu('none')}
          >
            {turnIntoItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAction(item.action)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-xs font-medium text-foreground/80 hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border/40 mx-2 my-1" />

      {/* Actions */}
      <div className="px-1">
        <ContextMenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={handleCopy} />
        <ContextMenuItem icon={Scissors} label="Cut" shortcut="Ctrl+X" onClick={handleCut} />
        <ContextMenuItem icon={Trash2} label="Delete" onClick={handleDelete} destructive />
      </div>
    </div>
  );
}

/* Small inline format button for the top row */
function ContextFormatButton({
  icon: Icon,
  isActive,
  onClick,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all cursor-pointer",
        isActive && "bg-primary/10 text-primary"
      )}
      title={title}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

/* Standard context menu item */
function ContextMenuItem({
  icon: Icon,
  label,
  shortcut,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer",
        destructive
          ? "text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          : "text-foreground/80 hover:bg-muted/70"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[10px] text-muted-foreground/40 font-mono">{shortcut}</span>
      )}
    </button>
  );
}
