import { Editor } from '@tiptap/react';
import {
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface ListButtonsProps {
  editor: Editor;
}

export const ListButtons = ({ editor }: ListButtonsProps) => {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet List"
      >
        <ListIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered List"
      >
        <ListOrderedIcon className="h-4 w-4" />
      </ToolbarButton>
    </>
  );
};
