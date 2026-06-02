import { Editor } from '@tiptap/react';
import {
  Code as CodeIcon,
  FileCode as FileCodeIcon,
  Quote as QuoteIcon,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

interface CodeBlocksSectionProps {
  editor: Editor;
}

export const CodeBlocksSection = ({ editor }: CodeBlocksSectionProps) => {
  return (
    <>
      <Toggle
        size="sm"
        pressed={editor.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        title="Inline Code"
      >
        <CodeIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('codeBlock')}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <FileCodeIcon className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        title="Blockquote"
      >
        <QuoteIcon className="h-4 w-4" />
      </Toggle>
    </>
  );
};
