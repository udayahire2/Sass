import { useEffect, useState, useRef, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { ShikiCodeBlock } from './ShikiCodeBlock';
import { NotionTableNode } from './NotionTableNode';

import { markdownToHtml, htmlToMarkdown } from './markdownUtils';
import BubbleToolbar from './BubbleToolbar';
import EditorContextMenu from './ContextMenu';
import SlashMenu, { ALL_SLASH_ITEMS } from './SlashMenu';
import { cn } from '@/lib/utils';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/contex-menu';
import './editor.css';

// Shiki highlighting is handled natively via ShikiCodeBlock Prosemirror plugin.

export interface RichTextEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  editable?: boolean;
  placeholder?: string;
  showWordCount?: boolean;
  className?: string;
  spellcheck?: boolean;
  pasteImageLink?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
  placeholder = 'Write something...',
  showWordCount = false,
  className,
  spellcheck = false,
  pasteImageLink = true,
}: RichTextEditorProps) {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const pasteImageLinkRef = useRef(pasteImageLink);
  useEffect(() => {
    pasteImageLinkRef.current = pasteImageLink;
  }, [pasteImageLink]);

  const filteredSlashItems = ALL_SLASH_ITEMS.filter(item =>
    item.label.toLowerCase().includes(slashQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const slashStateRef = useRef({
    isOpen: false,
    selectedIndex: 0,
    filteredItems: filteredSlashItems,
  });

  useEffect(() => {
    slashStateRef.current = {
      isOpen: slashMenuOpen,
      selectedIndex,
      filteredItems: filteredSlashItems,
    };
  }, [slashMenuOpen, selectedIndex, filteredSlashItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [slashQuery]);

  const checkSlashMenu = useCallback((editorInstance: any) => {
    const { selection } = editorInstance.state;
    const { $from } = selection;

    const parent = $from.parent;

    if (parent.type.name !== 'paragraph') {
      if (slashMenuOpen) {
        setSlashMenuOpen(false);
        setSlashQuery('');
      }
      return;
    }

    const text = parent.textContent;

    if (text.startsWith('/')) {
      const query = text.substring(1);
      setSlashMenuOpen(true);
      setSlashQuery(query);
    } else {
      if (slashMenuOpen) {
        setSlashMenuOpen(false);
        setSlashQuery('');
      }
    }
  }, [slashMenuOpen]);

  const editorRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'editor-youtube',
        },
      }),
      ShikiCodeBlock.configure({
        HTMLAttributes: {
          class: 'editor-code-block',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      NotionTableNode,
    ],
    content: markdownToHtml(content),
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        // Responsive min-height and padding applied directly to the editor content area
        class: 'focus:outline-none min-h-[150px] sm:min-h-[200px] p-2 sm:p-4 text-sm sm:text-base leading-relaxed',
        spellcheck: spellcheck ? 'true' : 'false',
      },
      handlePaste: (view, event) => {
        if (!pasteImageLinkRef.current) return false;
        const text = event.clipboardData?.getData('text/plain');
        const html = event.clipboardData?.getData('text/html');
        if (!text) return false;
        
        const isImageUrl = text.match(/\.(jpeg|jpg|gif|png|webp|svg)(?:\?.*)?$/i) || 
                           text.match(/^https:\/\/(?:images\.unsplash\.com|images\.pexels\.com|res\.cloudinary\.com)\/.+$/i);
                           
        if (isImageUrl) {
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src: text });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
          return true;
        }

        const isRichHtml = html && /<(h[1-6]|ul|ol|table|strong|em|a|pre|blockquote)[>\s]/i.test(html);
        const isMarkdown = /^(#{1,6}\s|\* |- |> |\d+\.\s|```|\[.*\]\(.*\))/m.test(text) || /(\*\*|__)[^\s].*[^\s](\*\*|__)/.test(text) || /`[^`]+`/.test(text);

        if (!isRichHtml && isMarkdown && editorRef.current) {
          event.preventDefault();
          const htmlContent = markdownToHtml(text);
          editorRef.current.commands.insertContent(htmlContent);
          return true;
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        const { isOpen, selectedIndex: selIdx, filteredItems } = slashStateRef.current;
        if (!isOpen) return false;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          const nextIndex = filteredItems.length > 0
            ? (selIdx + 1) % filteredItems.length
            : 0;
          setSelectedIndex(nextIndex);
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          const prevIndex = filteredItems.length > 0
            ? (selIdx - 1 + filteredItems.length) % filteredItems.length
            : 0;
          setSelectedIndex(prevIndex);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const item = filteredItems[selIdx];
          if (item) {
            item.action(editor!);
          }
          setSlashMenuOpen(false);
          setSlashQuery('');
          setSelectedIndex(0);
          return true;
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          setSlashMenuOpen(false);
          setSlashQuery('');
          setSelectedIndex(0);
          const { selection } = view.state;
          const { $from } = selection;
          view.dispatch(view.state.tr.delete($from.start(), $from.end()));
          return true;
        }

        if (event.key === 'Tab') {
          event.preventDefault();
          const item = filteredItems[selIdx];
          if (item) {
            item.action(editor!);
          }
          setSlashMenuOpen(false);
          setSlashQuery('');
          setSelectedIndex(0);
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChangeRef.current(markdown);
      checkSlashMenu(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      checkSlashMenu(editor);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!slashMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-slash-menu]')) return;
      if (editorWrapperRef.current && !editorWrapperRef.current.contains(target)) {
        setSlashMenuOpen(false);
        setSlashQuery('');
        setSelectedIndex(0);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [slashMenuOpen]);

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const htmlContent = markdownToHtml(content);
    if (editor.getHTML() !== htmlContent) {
      editor.commands.setContent(htmlContent, { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({
      editorProps: {
        attributes: {
          spellcheck: spellcheck ? 'true' : 'false',
        }
      }
    });
  }, [spellcheck, editor]);

  if (!editor) {
    return null;
  }

  const wordCount = editor.storage.characterCount.words();
  const characterCount = editor.storage.characterCount.characters();

  return (
    <ContextMenu>
      <div
        ref={editorWrapperRef}
        className={cn(
          "w-full flex flex-col group relative",
          // Responsive padding around the whole editor
          "px-2 sm:px-4",
          className
        )}
      >
        <ContextMenuTrigger className="contents">
          <div className="w-full text-foreground transition-all duration-200 bg-transparent border-none max-w-none">
            <EditorContent
              editor={editor}
              className="w-full focus:outline-none focus:ring-0"
            />
          </div>

          {editable && <BubbleToolbar editor={editor} />}

          {editable && (
            <SlashMenu
              editor={editor}
              isOpen={slashMenuOpen}
              selectedIndex={selectedIndex}
              filteredItems={filteredSlashItems}
              onClose={() => {
                setSlashMenuOpen(false);
                setSlashQuery('');
                setSelectedIndex(0);
              }}
            />
          )}
        </ContextMenuTrigger>

        {editable && showWordCount && (
          <div className={cn(
            "flex justify-start text-xs text-muted-foreground/40 pt-16 pb-8 select-none font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            // Hide on small screens to save space; visible on hover on larger screens
            "hidden sm:flex"
          )}>
            <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
            <span className="mx-2">·</span>
            <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
          </div>
        )}
      </div>

      {editable && <EditorContextMenu editor={editor} />}
    </ContextMenu>
  );
}