import { NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';
import { NotionTable, type TableColumn, type TableRowData } from '../ui/notion-table';

type NotionTableData = { columns: TableColumn[]; rows: TableRowData[] };

const defaultTableData: NotionTableData = {
  columns: [
    { id: 'col-1', width: 180 },
    { id: 'col-2', width: 180 },
    { id: 'col-3', width: 180 },
  ],
  rows: [
    { id: 'row-1', cells: ['', '', ''] },
    { id: 'row-2', cells: ['', '', ''] },
    { id: 'row-3', cells: ['', '', ''] },
    { id: 'row-4', cells: ['', '', ''] },
  ],
};

export default function NotionTableWrapper({
  node,
  updateAttributes,
}: ReactNodeViewProps) {
  const tableData = (node.attrs.data as NotionTableData | undefined) || defaultTableData;

  const handleTableChange = (newData: NotionTableData) => {
    // Only update if data actually changed to prevent loops
    if (JSON.stringify(tableData) !== JSON.stringify(newData)) {
      updateAttributes({ data: newData });
    }
  };

  return (
    <NodeViewWrapper className="notion-table-node-view w-full my-6 select-none relative group/table-node">
      <NotionTable 
        data={tableData} 
        onChange={handleTableChange} 
      />
    </NodeViewWrapper>
  );
}
