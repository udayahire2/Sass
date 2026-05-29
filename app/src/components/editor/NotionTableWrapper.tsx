import { NodeViewWrapper } from '@tiptap/react';
import { NotionTable, type TableColumn, type TableRowData } from '../ui/notion-table';

interface NotionTableWrapperProps {
  node: {
    attrs: {
      data: {
        columns: TableColumn[];
        rows: TableRowData[];
      };
    };
  };
  updateAttributes: (attrs: { data: { columns: TableColumn[]; rows: TableRowData[] } }) => void;
}

export default function NotionTableWrapper({
  node,
  updateAttributes,
}: NotionTableWrapperProps) {
  const tableData = node.attrs.data;

  const handleTableChange = (newData: { columns: TableColumn[]; rows: TableRowData[] }) => {
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
