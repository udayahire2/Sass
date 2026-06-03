import { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Copy, Check, ChevronDown } from 'lucide-react';

interface CodeBlockProps {
  node: {
    attrs: {
      language: string;
    };
    textContent: string;
  };
  updateAttributes: (attrs: { language: string }) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <NodeViewWrapper className="custom-code-block relative my-4 rounded-xl border border-zinc-700 dark:border-zinc-700/50 overflow-hidden bg-zinc-950 dark:bg-[#0d0d0d] font-mono shadow-lg dark:shadow-xl hover:border-zinc-600 dark:hover:border-zinc-600 transition-colors">
      
      {/* 1. Header Area: Selector & Copy Button */}
      <div 
        className="flex items-center justify-between px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/50" 
        contentEditable={false}
      >
        <div className="relative flex items-center group/select">
          <select
            value={currentLang}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="appearance-none bg-transparent text-xs font-sans text-zinc-400 hover:text-zinc-200 cursor-pointer outline-none pr-5 z-10"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-zinc-900 text-zinc-300">
                {lang.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-0 transition-colors group-hover/select:text-zinc-300 pointer-events-none" />
        </div>

        <button
          onClick={handleCopy}
          className="p-1 text-zinc-400 hover:text-zinc-200 bg-zinc-800/40 hover:bg-zinc-700/60 rounded-md transition-all"
          title={isCopied ? 'Copied!' : 'Copy code'}
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Code Area: Line Numbers + TextContent */}
      <div className="flex relative">
        {/* Line Gutter - Removed border, reduced right padding */}
        <div 
          className="flex flex-col text-[13px] leading-6 py-4 pl-4 pr-2 text-zinc-500 select-none text-right bg-zinc-950/30"
          contentEditable={false}
        >
          {lines.map((num) => (
            <span key={num}>{num}</span>
          ))}
        </div>

        {/* Tiptap Code Editor - Adjusted left padding to close the gap */}
        <pre className="py-4 pl-2 pr-4 m-0 bg-transparent overflow-x-auto text-sm leading-6 flex-1">
          <NodeViewContent
            as="code"
            className="font-mono text-[13px] leading-6 block outline-none text-zinc-300 whitespace-pre"
          />
        </pre>
      </div>

    </NodeViewWrapper>
  );
}