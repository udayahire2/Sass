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

  // Context menu state
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

  // Sync ref with fresh state on every render
  useEffect(() => {
    slashStateRef.current = {
      isOpen: slashMenuOpen,
      selectedIndex,
      filteredItems: filteredSlashItems,
    };
  }, [slashMenuOpen, selectedIndex, filteredSlashItems]);

  // Reset selectedIndex when filtered items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [slashQuery]);

  const checkSlashMenu = useCallback((editorInstance: any) => {
    const { selection } = editorInstance.state;
    const { $from } = selection;

    const parent = $from.parent;

    // Only trigger in paragraph nodes (not inside code blocks, headings, etc.)
    if (parent.type.name !== 'paragraph') {
      if (slashMenuOpen) {
        setSlashMenuOpen(false);
        setSlashQuery('');
      }
      return;
    }

    const text = parent.textContent;

    // Check if the line starts with '/' and cursor is after it
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
        class: 'focus:outline-none min-h-[200px]',
        spellcheck: spellcheck ? 'true' : 'false',
      },
      handlePaste: (view, event) => {
        if (!pasteImageLinkRef.current) return false;
        const text = event.clipboardData?.getData('text/plain');
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
          // Delete the slash character and any typed query
          const { selection } = view.state;
          const { $from } = selection;
          view.dispatch(view.state.tr.delete($from.start(), $from.end()));
          return true;
        }

        // Let Tab also act as Enter for quick selection
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

  // Shiki code block rendering is managed natively by ShikiCodeBlock extension NodeView.

  // Close slash menu on click outside editor
  useEffect(() => {
    if (!slashMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside the slash menu itself
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

  // Synchronize dynamic updates of "content" from outside the editor
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

  // Synchronize dynamic updates of the "editable" prop
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editable, editor]);

  // Synchronize spellcheck updates dynamically
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
        className={cn("w-full flex flex-col group relative", className)}
      >
        <ContextMenuTrigger className="contents">
          <div className="w-full text-foreground transition-all duration-200 bg-transparent border-none">
            <EditorContent
          editor={editor}
          className="w-full text-base focus:outline-none focus:ring-0"
        />

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
          </div>

          {editable && showWordCount && (
            <div className="flex justify-start text-xs text-muted-foreground/40 pt-16 pb-8 select-none font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
              <span className="mx-2">·</span>
              <span>{characterCount} {characterCount === 1 ? 'character' : 'characters'}</span>
            </div>
          )}
        </ContextMenuTrigger>
      </div>

      {editable && <EditorContextMenu editor={editor} />}
    </ContextMenu>
  );
}
