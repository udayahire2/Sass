import { Editor } from '@tiptap/react';
import { Undo as UndoIcon, Redo as RedoIcon } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface UndoRedoProps {
  editor: Editor;
}

export const UndoRedo = ({ editor }: UndoRedoProps) => {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <RedoIcon className="h-4 w-4" />
      </ToolbarButton>
    </>
  );
};
