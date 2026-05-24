import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Image as ImageIcon, Check, X } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface ImageInputProps {
  editor: Editor;
  isOpen: boolean;
  onToggle: () => void;
}

// Image button - used in the toolbar
export const ImageButton = ({ isOpen, onToggle }: ImageInputProps) => {
  return (
    <ToolbarButton
      onClick={onToggle}
      isActive={isOpen}
      title="Insert Image"
    >
      <ImageIcon className="h-4 w-4" />
    </ToolbarButton>
  );
};

// Image form - used below the toolbar
export const ImageForm = ({ editor, isOpen, onToggle }: ImageInputProps) => {
  const [imageUrlValue, setImageUrlValue] = useState('');

  const handleImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageUrlValue.trim() !== '') {
      editor.chain().focus().setImage({ src: imageUrlValue.trim() }).run();
    }
    setImageUrlValue('');
  };

  if (!isOpen) return null;

  return (
    <form
      onSubmit={handleImageSubmit}
      className="flex items-center gap-2 border-t border-border bg-muted/30 p-2 animate-in slide-in-from-top-1 duration-150"
    >
      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
      <input
        type="url"
        value={imageUrlValue}
        onChange={(e) => setImageUrlValue(e.target.value)}
        placeholder="Enter image URL..."
        className="flex-1 bg-transparent border-none text-xs outline-none focus:ring-0 placeholder:text-muted-foreground/60 text-foreground font-medium"
        autoFocus
      />
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="submit"
          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-500/10 focus:outline-none cursor-pointer transition-colors"
          title="Insert image"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setImageUrlValue('');
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
export const ImageInput = ({ editor, isOpen, onToggle }: ImageInputProps) => {
  return (
    <>
      <ImageButton editor={editor} isOpen={isOpen} onToggle={onToggle} />
      <ImageForm editor={editor} isOpen={isOpen} onToggle={onToggle} />
    </>
  );
};
