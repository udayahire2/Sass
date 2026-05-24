import { Editor } from '@tiptap/react';
import { Table as TableIcon } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface TableInsertProps {
  editor: Editor;
}

export const TableInsert = ({ editor }: TableInsertProps) => {
  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <ToolbarButton
      onClick={handleInsertTable}
      title="Insert 3x3 Table"
    >
      <TableIcon className="h-4 w-4" />
    </ToolbarButton>
  );
};
