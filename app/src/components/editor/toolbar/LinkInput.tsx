import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Link2, Check, X } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface LinkInputProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
}

// Link button - used in the toolbar
export const LinkButton = ({ editor, isOpen, onToggle }: LinkInputProps) => {
  return (
    <ToolbarButton
      onClick={onToggle}
      isActive={editor.isActive('link') || isOpen}
      title="Hyperlink (Ctrl+K)"
    >
      <Link2 className="h-4 w-4" />
    </ToolbarButton>
  );
};

// Link form - used below the toolbar
export const LinkForm = ({ editor, isOpen, onToggle }: LinkInputProps) => {
  const [urlValue, setUrlValue] = useState('');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlValue.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: urlValue.trim() }).run();
    }
    setUrlValue('');
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={handleLinkSubmit}
      className="flex items-center gap-2 border-t border-border bg-muted/30 p-2 animate-in slide-in-from-top-1 duration-150"
    >
      <Link2 className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
      <input
        type="url"
        value={urlValue}
        onChange={(e) => setUrlValue(e.target.value)}
        placeholder="Paste or type URL (empty to unlink)..."
        className="flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 placeholder:text-muted-foreground/60 text-foreground font-medium"
        autoFocus
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="submit"
          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 focus:outline-none cursor-pointer transition-colors"
          title="Apply link"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlValue('');
            onToggle();
          }}
          className="p-1 rounded-md text-destructive hover:bg-destructive/10 focus:outline-none cursor-pointer transition-colors"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
};

// Combined component for backwards compatibility
export const LinkInput = ({ editor, isOpen, onToggle }: LinkInputProps) => {
  return (
    <>
      <LinkButton editor={editor} isOpen={isOpen} onToggle={onToggle} />
      <LinkForm editor={editor} isOpen={isOpen} onToggle={onToggle} />
    </>
  );
};
