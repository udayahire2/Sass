import { useState } from "react";
import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { Check, Copy } from "lucide-react";

import {
  SelectClean,
  SelectCleanContent,
  SelectCleanItem,
  SelectCleanTrigger,
  SelectCleanValue,
} from "../ui/SelectClean";

interface CodeBlockProps {
  node: {
    attrs: {
      language: string;
    };
    textContent: string;
  };
  updateAttributes: (attrs: { language: string }) => void;
  extension: unknown;
  editor: any;
}

const LANGUAGES = [
  { value: "text", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "jsx", label: "JSX" },
  { value: "json", label: "JSON" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "bash", label: "Bash" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "yaml", label: "YAML" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
];

export default function CodeBlockComponent({
  node,
  updateAttributes,
  editor,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const currentLang = node.attrs.language || "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(node.textContent || "");

      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  const lineCount = Math.max(
    (node.textContent || "").split("\n").length,
    1
  );

  const lines = Array.from(
    { length: lineCount },
    (_, index) => index + 1
  );

  return (
    <NodeViewWrapper
      className="
        custom-code-block
        relative
        my-4
        overflow-hidden
        rounded-xl
        border
        border-border
        bg-code-bg
        font-mono
        shadow-sm
        transition-colors
        hover:border-border/80
      "
    >
      {/* Header */}
      <div
        contentEditable={false}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="
          flex
          items-center
          justify-between
          px-1.5
          py-1.5
        "
      >
        <div
          className="relative flex items-center"
          onMouseDown={(e) => e.preventDefault()}
        >
          {editor?.isEditable ? (
            <SelectClean
              value={currentLang}
              onValueChange={(value) =>
                updateAttributes({ language: value ?? '' })
              }
            >
              <SelectCleanTrigger>
                <SelectCleanValue placeholder="Language" />
              </SelectCleanTrigger>

              <SelectCleanContent>
                {LANGUAGES.map((lang) => (
                  <SelectCleanItem
                    key={lang.value}
                    value={lang.value}
                  >
                    {lang.label}
                  </SelectCleanItem>
                ))}
              </SelectCleanContent>
            </SelectClean>
          ) : (
            <span className="px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground">
              {LANGUAGES.find((l) => l.value === currentLang)?.label || currentLang}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          title={isCopied ? "Copied!" : "Copy code"}
          className="
            flex
            items-center
            justify-center
            rounded-md
            p-1.5
            text-muted-foreground
            opacity-60
            transition-all
            hover:bg-accent
            hover:text-accent-foreground
            hover:opacity-100
          "
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="flex">
        {/* Line Numbers */}
        <div
          contentEditable={false}
          className="
            flex
            flex-col
            py-4
            min-w-[40px]
            px-2
            text-right
            text-[12px]
            leading-6
            text-muted-foreground
            select-none
          "
        >
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>

        {/* Code Content */}
        <pre
          className="
            m-0
            flex-1
            overflow-x-auto
            px-4
            py-4
            text-[13px]
            leading-6
          "
        >
          <NodeViewContent
            as="div"
            className="
              block
              whitespace-pre
              font-mono
              text-[13px]
              leading-6
              text-foreground
              outline-none
            "
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
