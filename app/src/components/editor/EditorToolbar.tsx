import { useState } from 'react';
import { Editor } from '@tiptap/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  HeadingDropdown,
  TextFormattingSection,
  ListButtons,
  CodeBlocksSection,
  TableInsert,
  UndoRedo,
  ToolbarSeparator,
} from './toolbar';
import { LinkButton, LinkForm } from './toolbar/LinkInput';
import { ImageButton, ImageForm } from './toolbar/ImageInput';

interface EditorToolbarProps {
  editor: Editor;
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);

  if (!editor) return null;

  return (
    <div className="flex flex-col border-b border-border bg-card select-none sticky top-0 z-30 rounded-t-lg transition-colors">
      {/* Main Toolbar Row with Horizontal ScrollArea */}
      <ScrollArea className="w-full">
        <div className="flex flex-nowrap items-center gap-1 p-1.5 min-w-max">
          {/* Heading Dropdown */}
          <HeadingDropdown editor={editor} />

          <ToolbarSeparator />

          {/* Text Formatting */}
          <TextFormattingSection editor={editor} />

          <ToolbarSeparator />

          {/* Lists */}
          <ListButtons editor={editor} />

          <ToolbarSeparator />

          {/* Code Blocks & Blockquote */}
          <CodeBlocksSection editor={editor} />

          <ToolbarSeparator />

          {/* Links & Images - Buttons Only */}
          <LinkButton
            editor={editor}
            isOpen={showLinkInput}
            onToggle={() => {
              setShowLinkInput(!showLinkInput);
              setShowImageInput(false);
            }}
          />

          <ImageButton
            editor={editor}
            isOpen={showImageInput}
            onToggle={() => {
              setShowImageInput(!showImageInput);
              setShowLinkInput(false);
            }}
          />

          <ToolbarSeparator />

          {/* Table Insert */}
          <TableInsert editor={editor} />

          <ToolbarSeparator />

          {/* Undo / Redo */}
          <UndoRedo editor={editor} />
        </div>
      </ScrollArea>

      {/* Link Input Form */}
      <LinkForm
        editor={editor}
        isOpen={showLinkInput}
        onToggle={() => {
          setShowLinkInput(!showLinkInput);
          setShowImageInput(false);
        }}
      />

      {/* Image Input Form */}
      <ImageForm
        editor={editor}
        isOpen={showImageInput}
        onToggle={() => {
          setShowImageInput(!showImageInput);
          setShowLinkInput(false);
        }}
      />
    </div>
  );
}
