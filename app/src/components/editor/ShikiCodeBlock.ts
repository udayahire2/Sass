import CodeBlock from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { createHighlighter, type Highlighter } from 'shiki';
import CodeBlockComponent from './CodeBlockComponent';
import { normalizeLanguage } from './markdownUtils';

let shikiHighlighter: Highlighter | null = null;
let isLoadingShiki = false;
const loadedCallbacks: (() => void)[] = [];

async function getShiki() {
  if (shikiHighlighter) return shikiHighlighter;
  if (isLoadingShiki) {
    return new Promise<Highlighter>((resolve) => {
      loadedCallbacks.push(() => resolve(shikiHighlighter!));
    });
  }
  isLoadingShiki = true;
  shikiHighlighter = await createHighlighter({
    themes: ['github-light', 'github-dark-dimmed'],
    langs: [
      'javascript', 'typescript', 'tsx', 'jsx', 'json', 'css', 'html', 
      'bash', 'python', 'java', 'sql', 'markdown', 'rust', 'go', 'yaml', 
      'cpp', 'c', 'text'
    ],
  });
  isLoadingShiki = false;
  while (loadedCallbacks.length > 0) {
    loadedCallbacks.shift()?.();
  }
  return shikiHighlighter;
}

// Pre-fetch Shiki highlighter
getShiki();

function getDecorations(doc: any) {
  const decorations: Decoration[] = [];
  
  if (!shikiHighlighter) {
    return DecorationSet.empty;
  }

  const isDark = document.documentElement.classList.contains('dark');
  const theme = isDark ? 'github-dark-dimmed' : 'github-light';

  doc.descendants((node: any, pos: number) => {
    if (node.type.name === 'codeBlock') {
      const text = node.textContent;
      const lang = node.attrs.language || 'text';
      
      try {
        const lines = shikiHighlighter!.codeToTokens(text, {
          lang: lang,
          theme: theme,
        });

        let index = 0;
        for (const line of lines.tokens || lines) {
          for (const token of line) {
            const start = pos + 1 + index;
            const end = start + token.content.length;
            
            if (start < end) {
              const style = `color: ${token.color || 'inherit'}`;
              decorations.push(
                Decoration.inline(start, end, {
                  style,
                  class: 'shiki-token',
                })
              );
            }
            index += token.content.length;
          }
          index += 1; // newline
        }
      } catch (err) {
        // Fallback or ignore
      }
    }
  });

  return DecorationSet.create(doc, decorations);
}

const shikiHighlightKey = new PluginKey('shiki-highlighting');

// Custom VS-Code style Indentation (Tab) and Outdent (Shift-Tab)
const handleTab = ({ editor }: { editor: any }) => {
  const { state, dispatch } = editor.view;
  const { selection, tr } = state;
  const { $from, $to } = selection;

  if (!editor.isActive('codeBlock')) {
    return false;
  }

  const start = $from.pos;
  const end = $to.pos;
  
  // If selection is single line and empty, just insert 2 spaces
  const hasNewline = state.doc.textBetween(start, end).includes('\n');
  if (selection.empty || !hasNewline) {
    editor.commands.insertContent('  ');
    return true;
  }

  const blockStart = $from.before();
  const blockEnd = $from.after();
  const blockText = state.doc.textBetween(blockStart + 1, blockEnd - 1);

  const relStart = start - (blockStart + 1);
  const relEnd = end - (blockStart + 1);

  const lines = blockText.split('\n');
  const linePositions: number[] = [];
  let currentPos = 0;
  
  for (const line of lines) {
    linePositions.push(currentPos);
    currentPos += line.length + 1;
  }

  const newTr = tr;
  let offset = 0;

  for (let i = 0; i < linePositions.length; i++) {
    const lineStart = linePositions[i];
    const lineEnd = i === linePositions.length - 1 ? blockText.length : linePositions[i + 1] - 1;

    const overlaps = Math.max(lineStart, relStart) <= Math.min(lineEnd, relEnd);
    
    if (overlaps) {
      const insertPos = blockStart + 1 + lineStart + offset;
      newTr.insertText('  ', insertPos);
      offset += 2;
    }
  }

  if (dispatch) {
    const newSelection = TextSelection.create(newTr.doc, start + 2, end + offset);
    newTr.setSelection(newSelection);
    dispatch(newTr);
  }

  return true;
};

const handleShiftTab = ({ editor }: { editor: any }) => {
  const { state, dispatch } = editor.view;
  const { selection, tr } = state;
  const { $from, $to } = selection;

  if (!editor.isActive('codeBlock')) {
    return false;
  }

  const start = $from.pos;
  const end = $to.pos;
  const blockStart = $from.before();
  const blockEnd = $from.after();
  const blockText = state.doc.textBetween(blockStart + 1, blockEnd - 1);

  const relStart = start - (blockStart + 1);
  const relEnd = end - (blockStart + 1);

  const lines = blockText.split('\n');
  const linePositions: number[] = [];
  let currentPos = 0;
  
  for (const line of lines) {
    linePositions.push(currentPos);
    currentPos += line.length + 1;
  }

  const newTr = tr;
  let offset = 0;
  let firstLineRemovedOffset = 0;

  for (let i = 0; i < linePositions.length; i++) {
    const lineStart = linePositions[i];
    const lineEnd = i === linePositions.length - 1 ? blockText.length : linePositions[i + 1] - 1;

    const isCursorLine = selection.empty && relStart >= lineStart && relStart <= lineEnd;
    const overlaps = isCursorLine || (!selection.empty && Math.max(lineStart, relStart) <= Math.min(lineEnd, relEnd));
    
    if (overlaps) {
      const lineText = lines[i];
      let spacesToRemove = 0;
      if (lineText.startsWith('\t')) {
        spacesToRemove = 1;
      } else if (lineText.startsWith('  ')) {
        spacesToRemove = 2;
      } else if (lineText.startsWith(' ')) {
        spacesToRemove = 1;
      }

      if (spacesToRemove > 0) {
        const deleteStart = blockStart + 1 + lineStart - offset;
        const deleteEnd = deleteStart + spacesToRemove;
        newTr.delete(deleteStart, deleteEnd);
        offset += spacesToRemove;
        
        if (i === 0 || (selection.empty && isCursorLine)) {
          firstLineRemovedOffset = spacesToRemove;
        }
      }
    }
  }

  if (dispatch && offset > 0) {
    const newStart = Math.max(blockStart + 1, start - firstLineRemovedOffset);
    const newEnd = Math.max(blockStart + 1, end - offset);
    const newSelection = selection.empty 
      ? TextSelection.create(newTr.doc, newStart)
      : TextSelection.create(newTr.doc, newStart, newEnd);
    newTr.setSelection(newSelection);
    dispatch(newTr);
  }

  return true;
};

export const ShikiCodeBlock = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: 'javascript',
        parseHTML: element => {
          const dataLang = element.getAttribute('data-language');
          if (dataLang) return normalizeLanguage(dataLang);
          const codeEl = element.querySelector('code');
          if (codeEl) {
            const match = codeEl.className.match(/language-([a-zA-Z0-9_+#-]+)/);
            if (match) return normalizeLanguage(match[1]);
          }
          return null;
        },
        renderHTML: attributes => {
          if (!attributes.language) {
            return {};
          }
          return { 'data-language': attributes.language };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent as any);
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Tab: ({ editor }) => handleTab({ editor }),
      'Shift-Tab': ({ editor }) => handleShiftTab({ editor }),
    };
  },

  addProseMirrorPlugins() {
    return [
      ...this.parent?.() || [],
      new Plugin({
        key: shikiHighlightKey,
        state: {
          init(_, { doc }) {
            return getDecorations(doc);
          },
          apply(tr, set, _oldState, newState) {
            const shikiMeta = tr.getMeta('shikiLoaded');
            const themeMeta = tr.getMeta('themeChanged');
            if (tr.docChanged || shikiMeta || themeMeta) {
              return getDecorations(newState.doc);
            }
            return set.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
        view(editorView) {
          if (!shikiHighlighter) {
            getShiki().then(() => {
              if (!editorView.isDestroyed) {
                editorView.dispatch(editorView.state.tr.setMeta('shikiLoaded', true));
              }
            });
          }

          // Listen for theme transitions to re-render highlighting colors
          const observer = new MutationObserver(() => {
            if (!editorView.isDestroyed) {
              editorView.dispatch(editorView.state.tr.setMeta('themeChanged', true));
            }
          });

          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
          });

          return {
            destroy() {
              observer.disconnect();
            }
          };
        }
      })
    ];
  }
});
