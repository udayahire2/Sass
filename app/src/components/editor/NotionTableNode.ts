import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import NotionTableWrapper from './NotionTableWrapper';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notionTable: {
      insertNotionTable: () => ReturnType;
    };
  }
}

export const NotionTableNode = Node.create({
  name: 'notionTable',
  group: 'block',
  atom: true, // Treated as a single block atom by ProseMirror
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      data: {
        default: {
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
          ]
        },
        parseHTML: element => {
          const dataStr = element.getAttribute('data-table-json');
          return dataStr ? JSON.parse(dataStr) : null;
        },
        renderHTML: attributes => {
          return {
            'data-table-json': JSON.stringify(attributes.data),
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="notion-table"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'notion-table' })];
  },

  addCommands() {
    return {
      insertNotionTable: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            data: {
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
              ]
            }
          }
        });
      }
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(NotionTableWrapper);
  }
});
