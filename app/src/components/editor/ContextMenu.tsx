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
  Undo,
  Redo,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenuPopup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubPopup,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuShortcut,
} from '@/components/ui/contex-menu';

interface EditorContextMenuProps {
  editor: Editor;
}

export default function EditorContextMenu({ editor }: EditorContextMenuProps) {
  const hasSelection = !editor.state.selection.empty;

  const handleCopy = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    navigator.clipboard.writeText(text);
    editor.commands.focus();
  };

  const handleCut = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    navigator.clipboard.writeText(text);
    editor.chain().focus().deleteSelection().run();
  };

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
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

  if (!hasSelection) {
    return (
      <ContextMenuPopup className="w-56">
        <ContextMenuGroup>
          <ContextMenuGroupLabel>History</ContextMenuGroupLabel>
          <ContextMenuItem onClick={() => editor.chain().focus().undo().run()}>
            <Undo />
            <span>Undo</span>
            <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => editor.chain().focus().redo().run()}>
            <Redo />
            <span>Redo</span>
            <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuGroup>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Plus />
            <span>Insert block</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubPopup className="w-48">
            {turnIntoItems.map((item) => (
              <ContextMenuItem key={item.label} onClick={item.action}>
                <item.icon />
                <span>{item.label}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubPopup>
        </ContextMenuSub>

        <ContextMenuSeparator />
        
        <ContextMenuItem variant="destructive" onClick={() => editor.commands.clearContent()}>
          <Trash2 />
          <span>Clear Canvas</span>
        </ContextMenuItem>
      </ContextMenuPopup>
    );
  }

  return (
    <ContextMenuPopup className="w-64">
      <ContextMenuGroup>
        <ContextMenuGroupLabel>Format</ContextMenuGroupLabel>
        <div className="flex items-center gap-0.5 px-2 py-1">
          <ContextFormatButton
            icon={BoldIcon}
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          />
          <ContextFormatButton
            icon={ItalicIcon}
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          />
          <ContextFormatButton
            icon={UnderlineIcon}
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          />
          <ContextFormatButton
            icon={StrikeIcon}
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          />
          <ContextFormatButton
            icon={CodeIcon}
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
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
            }}
            title="Link"
          />
        </div>
      </ContextMenuGroup>

      <ContextMenuSeparator />

      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <Type />
          <span>Turn into</span>
        </ContextMenuSubTrigger>
        <ContextMenuSubPopup className="w-48">
          {turnIntoItems.map((item) => (
            <ContextMenuItem key={item.label} onClick={item.action}>
              <item.icon />
              <span>{item.label}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuSubPopup>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={handleCopy}>
        <Copy />
        <span>Copy</span>
        <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={handleCut}>
        <Scissors />
        <span>Cut</span>
        <ContextMenuShortcut>Ctrl+X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onClick={handleDelete}>
        <Trash2 />
        <span>Delete</span>
      </ContextMenuItem>
    </ContextMenuPopup>
  );
}

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
      <Icon className="h-4 w-4" />
    </button>
  );
}
