import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  Quote,
  FileCode,
  Link2,
  Check,
  X,
  ChevronDown,
  Copy,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BubbleToolbarProps {
  editor: Editor;
}

type ActivePanel = 'none' | 'turnInto' | 'link';

export default function BubbleToolbar({ editor }: BubbleToolbarProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [urlValue, setUrlValue] = useState('');

  if (!editor) return null;

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlValue.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: urlValue.trim() }).run();
    }
    setUrlValue('');
    setActivePanel('none');
  };

  const handleLinkClick = () => {
    if (activePanel === 'link') {
      setActivePanel('none');
      return;
    }
    const previousUrl = editor.getAttributes('link').href;
    setUrlValue(previousUrl || '');
    setActivePanel('link');
  };

  const handleTurnIntoClick = () => {
    setActivePanel(activePanel === 'turnInto' ? 'none' : 'turnInto');
  };

  const getActiveBlockLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('bulletList')) return 'Bullet List';
    if (editor.isActive('orderedList')) return 'Numbered List';
    if (editor.isActive('blockquote')) return 'Quote';
    if (editor.isActive('codeBlock')) return 'Code Block';
    return 'Text';
  };

  const turnIntoOptions = [
    {
      label: 'Text',
      icon: Type,
      active: !editor.isActive('heading') && !editor.isActive('bulletList') && !editor.isActive('orderedList') && !editor.isActive('blockquote') && !editor.isActive('codeBlock'),
      action: () => { editor.chain().focus().setParagraph().run(); setActivePanel('none'); },
    },
    {
      label: 'Heading 1',
      icon: Heading1,
      active: editor.isActive('heading', { level: 1 }),
      action: () => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setActivePanel('none'); },
    },
    {
      label: 'Heading 2',
      icon: Heading2,
      active: editor.isActive('heading', { level: 2 }),
      action: () => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setActivePanel('none'); },
    },
    {
      label: 'Heading 3',
      icon: Heading3,
      active: editor.isActive('heading', { level: 3 }),
      action: () => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setActivePanel('none'); },
    },
    {
      label: 'Bullet List',
      icon: List,
      active: editor.isActive('bulletList'),
      action: () => { editor.chain().focus().toggleBulletList().run(); setActivePanel('none'); },
    },
    {
      label: 'Numbered List',
      icon: ListOrdered,
      active: editor.isActive('orderedList'),
      action: () => { editor.chain().focus().toggleOrderedList().run(); setActivePanel('none'); },
    },
    {
      label: 'Quote',
      icon: Quote,
      active: editor.isActive('blockquote'),
      action: () => { editor.chain().focus().toggleBlockquote().run(); setActivePanel('none'); },
    },
    {
      label: 'Code Block',
      icon: FileCode,
      active: editor.isActive('codeBlock'),
      action: () => { editor.chain().focus().toggleCodeBlock().run(); setActivePanel('none'); },
    },
  ];

  const handleCopy = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    navigator.clipboard.writeText(text);
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{
        placement: 'top',
        offset: 8,
        onHide: () => setActivePanel('none'),
      }}
      className="flex flex-col rounded-md border border-border bg-popover shadow-sm overflow-hidden z-50"
    >
      {/* Main Toolbar Row */}
      <div className="flex items-center gap-0.5 px-1 py-1">
        {/* Turn Into Dropdown */}
        <button
          type="button"
          onClick={handleTurnIntoClick}
          className={cn(
            "flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-all",
            activePanel === 'turnInto' && "bg-muted text-foreground"
          )}
        >
          <span className="truncate max-w-[80px]">{getActiveBlockLabel()}</span>
          <ChevronDown className={cn("h-3 w-3 opacity-50 transition-transform", activePanel === 'turnInto' && "rotate-180")} />
        </button>

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Text Formatting */}
        <ToolbarButton
          icon={BoldIcon}
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          icon={ItalicIcon}
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          icon={UnderlineIcon}
          isActive={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        />
        <ToolbarButton
          icon={StrikeIcon}
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough (Ctrl+Shift+S)"
        />
        <ToolbarButton
          icon={CodeIcon}
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code (Ctrl+E)"
        />

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Link */}
        <ToolbarButton
          icon={LinkIcon}
          isActive={editor.isActive('link') || activePanel === 'link'}
          onClick={handleLinkClick}
          title="Add Link (Ctrl+K)"
        />

        <div className="h-4 w-px bg-border mx-0.5" />

        {/* Actions */}
        <ToolbarButton
          icon={Copy}
          isActive={false}
          onClick={handleCopy}
          title="Copy"
        />
        <ToolbarButton
          icon={Trash2}
          isActive={false}
          onClick={handleDelete}
          title="Delete"
          destructive
        />
      </div>

      {/* Turn Into Panel */}
      {activePanel === 'turnInto' && (
        <div className="border-t border-border p-1 max-h-64 overflow-y-auto">
          <div className="px-2 py-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Turn into</span>
          </div>
          {turnIntoOptions.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={opt.action}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-left font-medium hover:bg-muted transition-all",
                opt.active && "bg-primary/10 text-primary"
              )}
            >
              <div className={cn(
                "flex items-center justify-center h-7 w-7 rounded-md border border-border bg-muted shrink-0",
                opt.active && "border-primary/30 bg-primary/10"
              )}>
                <opt.icon className={cn("h-3.5 w-3.5", opt.active ? "text-primary" : "text-muted-foreground")} />
              </div>
              <span className={cn("text-foreground/90", opt.active && "text-primary font-semibold")}>{opt.label}</span>
              {opt.active && <Check className="h-3 w-3 text-primary ml-auto" />}
            </button>
          ))}
        </div>
      )}

      {/* Link Input Panel */}
      {activePanel === 'link' && (
        <form
          onSubmit={handleLinkSubmit}
          className="flex items-center gap-2 border-t border-border bg-muted/10 px-2 py-2"
        >
          <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="Paste link or type URL..."
            className="flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 placeholder:text-muted-foreground/50 text-foreground font-medium min-w-[180px]"
            autoFocus
          />
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="submit"
              className="p-1 rounded-md text-emerald-500 hover:bg-emerald-500/10 transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('none')}
              className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      )}
    </BubbleMenu>
  );
}

/* Reusable toolbar icon button (flattened) */
function ToolbarButton({
  icon: Icon,
  isActive,
  onClick,
  title,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  title: string;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-1.5 rounded-md text-foreground hover:bg-muted transition-all",
        isActive && "bg-primary/10 text-primary",
        destructive && "hover:text-destructive hover:bg-destructive/10"
      )}
      title={title}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
