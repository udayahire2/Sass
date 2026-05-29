import { useState } from 'react';
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      console.error('Failed to copy text: ', err);
    }
  };

  const lineCount = (node?.textContent || '').split('\n').length || 1;
  const currentLangLabel = LANGUAGES.find(l => l.value === currentLang)?.label || currentLang;

  return (
    <NodeViewWrapper className="custom-code-block relative group/code-block rounded-xl border border-zinc-200 dark:border-zinc-800 my-6 overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-mono shadow-sm hover:shadow-md transition-all duration-200">
      {/* Premium Notion-style Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 select-none">
        {/* Custom Dynamic Language Selector Dropdown (with overlay) */}
        <div className="relative flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/40 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-800 rounded-md px-2.5 py-1.5 transition-all duration-150 cursor-pointer">
          <span className="text-[11px] font-sans font-bold uppercase tracking-wider">
            {currentLangLabel}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          
          <select
            value={currentLang}
            onChange={(e) => updateAttributes({ language: e.target.value })}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            contentEditable={false}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 font-sans normal-case text-sm">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs font-sans font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/40 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md px-2.5 py-1.5 transition-all duration-150 active:scale-95"
          title="Copy Code"
          contentEditable={false}
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 animate-in fade-in zoom-in-50 duration-200" />
              <span className="text-emerald-500 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      <div className="flex font-mono text-sm leading-relaxed relative bg-zinc-50 dark:bg-zinc-950">
        {/* Line Numbers Column */}
        <div 
          className="select-none text-right pr-4 pl-4 text-zinc-400 dark:text-zinc-600 font-mono py-4 border-r border-zinc-200 dark:border-zinc-900 text-[11px] min-w-[3.5rem] bg-zinc-100/30 dark:bg-zinc-950/40"
          contentEditable={false}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-6 h-6">{i + 1}</div>
          ))}
        </div>

        {/* Editable Content */}
        <pre className="flex-1 py-4 px-4 m-0 bg-transparent overflow-x-auto select-text scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <NodeViewContent
            as="code"
            className="font-mono text-xs leading-6 block outline-none min-h-[1.5rem] text-zinc-900 dark:text-zinc-100 whitespace-pre"
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
