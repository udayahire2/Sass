import { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CodeBlockProps {
  node: {
    attrs: {
      language: string;
    };
    textContent: string;
  };
  updateAttributes: (attrs: { language: string }) => void;
  extension: any;
}

const LANGUAGES = [
  { value: 'text', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'jsx', label: 'JSX' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'yaml', label: 'YAML' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

export default function CodeBlockComponent({
  node: { attrs: { language } },
  updateAttributes,
  node,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const currentLang = language || 'text';

  const handleCopy = async () => {
    const code = node?.textContent || '';
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const lineCount = (node?.textContent || '').split('\n').length || 1;
  const currentLangLabel = LANGUAGES.find(l => l.value === currentLang)?.label || currentLang;

  return (
    <NodeViewWrapper className="custom-code-block relative group/code-block my-6 rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-900 font-mono">
      {/* Minimal Notion-style header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/40 select-none">
        {/* Language selector - minimal */}
        <div className="relative flex items-center">
          <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mr-1">
            {currentLangLabel}
          </span>
          <ChevronDown className="w-3 h-3 text-zinc-500 dark:text-zinc-500" />
          <select
            value={currentLang}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            contentEditable={false}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Copy button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="flex h-6 items-center gap-1 px-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-sm"
          contentEditable={false}
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>

      {/* Code area with line numbers */}
      <div className="flex text-sm leading-6 relative">
        {/* Line numbers column */}
        <div
          className="select-none text-right pr-3 pl-2 text-zinc-400 dark:text-zinc-600 font-mono text-[11px] min-w-[2.5rem] py-3 bg-zinc-100/50 dark:bg-zinc-800/20 border-r border-zinc-200 dark:border-zinc-800"
          contentEditable={false}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Editable code content */}
        <pre className="flex-1 py-3 px-3 m-0 bg-transparent overflow-x-auto">
          <NodeViewContent
            as="code"
            className="font-mono text-[13px] leading-6 block outline-none text-zinc-800 dark:text-zinc-200 whitespace-pre"
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}