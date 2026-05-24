import { Editor } from '@tiptap/react';
import {
  Code as CodeIcon,
  FileCode as FileCodeIcon,
  Quote as QuoteIcon,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

interface CodeBlocksSectionProps {
  editor: Editor;
}

export const CodeBlocksSection = ({ editor }: CodeBlocksSectionProps) => {
  return (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive('code')}
        title="Inline Code"
      >
        <CodeIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        title="Code Block"
      >
        <FileCodeIcon className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <QuoteIcon className="h-4 w-4" />
      </ToolbarButton>
    </>
  );
};
