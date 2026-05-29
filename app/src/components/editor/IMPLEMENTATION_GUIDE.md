# Editor Components - Implementation Guide

## Directory Structure

```
src/components/editor/
├── EditorToolbar.tsx                 ← Main toolbar component
├── RichTextEditor.tsx                ← Editor wrapper
├── BubbleToolbar.tsx                 ← Floating menu
├── ContextMenu.tsx                   ← Context menu
├── SlashMenu.tsx                     ← Slash command menu
├── markdownUtils.ts                  ← Markdown helpers
├── editor.css                        ← Editor styles
├── index.ts                          ← Barrel export
├── TOOLBAR_COMPONENTS.md             ← Component documentation
├── REFACTORING_SUMMARY.md            ← Refactoring guide
└── toolbar/                          ← NEW: Toolbar components
    ├── index.ts                      ← Barrel export
    ├── ToolbarButton.tsx             ← Reusable button
    ├── ToolbarSeparator.tsx          ← Visual divider
    ├── HeadingDropdown.tsx           ← Heading selector
    ├── TextFormattingSection.tsx     ← Bold, Italic, etc.
    ├── ListButtons.tsx               ← Bullet & Numbered lists
    ├── CodeBlocksSection.tsx         ← Code & blockquote
    ├── LinkInput.tsx                 ← Link management
    ├── ImageInput.tsx                ← Image management
    ├── TableInsert.tsx               ← Table insertion
    └── UndoRedo.tsx                  ← Undo/Redo buttons
```

## File Purposes

### Core Editor Files
- **EditorToolbar.tsx** - Main orchestrator that combines all toolbar components
- **RichTextEditor.tsx** - Main editor component with full TipTap integration
- **editor.css** - Editor-specific styles (prosemirror, editor content)

### Toolbar Subdirectory (NEW)
- **ToolbarButton.tsx** - Generic button with active/disabled states
- **ToolbarSeparator.tsx** - Visual separator between button groups
- **HeadingDropdown.tsx** - Heading level (H1-H3) selector
- **TextFormattingSection.tsx** - Bold, italic, underline, strikethrough
- **ListButtons.tsx** - Bullet and numbered list toggle
- **CodeBlocksSection.tsx** - Code block, inline code, blockquote
- **LinkInput.tsx** - Link button + URL input form
- **ImageInput.tsx** - Image button + URL input form
- **TableInsert.tsx** - Insert 3x3 table button
- **UndoRedo.tsx** - Undo/redo button pair

## Component Hierarchy

```
EditorToolbar
│
├─ HeadingDropdown
│  └─ [Menu items rendered via portal]
│
├─ TextFormattingSection
│  ├─ ToolbarButton (Bold)
│  ├─ ToolbarButton (Italic)
│  ├─ ToolbarButton (Underline)
│  └─ ToolbarButton (Strikethrough)
│
├─ ToolbarSeparator
│
├─ ListButtons
│  ├─ ToolbarButton (Bullet List)
│  └─ ToolbarButton (Ordered List)
│
├─ ToolbarSeparator
│
├─ CodeBlocksSection
│  ├─ ToolbarButton (Inline Code)
│  ├─ ToolbarButton (Code Block)
│  └─ ToolbarButton (Blockquote)
│
├─ ToolbarSeparator
│
├─ LinkButton
│  └─ ToolbarButton
│
├─ ImageButton
│  └─ ToolbarButton
│
├─ ToolbarSeparator
│
├─ TableInsert
│  └─ ToolbarButton
│
├─ ToolbarSeparator
│
├─ UndoRedo
│  ├─ ToolbarButton (Undo)
│  └─ ToolbarButton (Redo)
│
├─ LinkForm (rendered below toolbar row)
│
└─ ImageForm (rendered below toolbar row)
```

## Styling Layers

### 1. Global Styles (editor.css)
- ProseMirror/TipTap default styles
- Editor content styling
- Prose typography

### 2. Tailwind Classes (component-level)
```tsx
// Button states
Normal:   text-foreground/80 hover:text-foreground hover:bg-muted/70
Active:   bg-muted text-primary
Disabled: opacity-40 disabled:cursor-not-allowed

// Container
Sticky, rounded-t-lg, shadow-sm, z-30

// Forms
border-t border-border bg-muted/30 p-2
animate-in slide-in-from-top-1 duration-150
```

### 3. Component-Specific Styles
Each component encapsulates its styling without affecting others.

## State Flow

```
EditorToolbar (Parent)
│
├─ showLinkInput: boolean
│  ├─ passed to LinkButton
│  └─ passed to LinkForm
│
└─ showImageInput: boolean
   ├─ passed to ImageButton
   └─ passed to ImageForm

Each child component receives:
- editor: Editor instance
- isOpen: boolean
- onToggle: () => void
```

## Data Flow

```
User clicks button
    ↓
ToolbarButton.onClick triggered
    ↓
Handler calls editor.chain()
    ↓
TipTap updates editor state
    ↓
Editor content updates
    ↓
UI re-renders with new active states
```

## Integration Checklist

- [x] Components created in toolbar/
- [x] Barrel exports configured
- [x] EditorToolbar refactored
- [x] TypeScript errors fixed
- [x] Tailwind warnings fixed
- [x] Documentation created
- [ ] Test file creation (optional)
- [ ] Storybook stories (optional)

## Usage Examples

### Basic Usage
```tsx
import EditorToolbar from '@/components/editor/EditorToolbar';
import { useEditor } from '@tiptap/react';

function MyEditor() {
  const editor = useEditor({ /* config */ });
  
  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

### Using Individual Components
```tsx
import {
  ToolbarButton,
  HeadingDropdown,
  TextFormattingSection,
} from '@/components/editor/toolbar';

// Create custom toolbar layout
function CustomToolbar({ editor }) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <HeadingDropdown editor={editor} />
      <TextFormattingSection editor={editor} />
      {/* More components */}
    </div>
  );
}
```

### Creating New Button Components
```tsx
import { ToolbarButton } from '@/components/editor/toolbar';

export function CustomButton({ editor }) {
  return (
    <ToolbarButton
      onClick={() => {
        // Your action
      }}
      isActive={editor.isActive('custom')}
      title="Custom Action"
    >
      <CustomIcon className="h-4 w-4" />
    </ToolbarButton>
  );
}
```

## Troubleshooting Guide

### Issue: Buttons not responding
**Solution:**
1. Verify editor prop is passed and valid
2. Check that editor.chain() methods exist
3. Ensure focus() is called after chain()

```tsx
// Correct
editor.chain().focus().toggleBold().run()

// Wrong
editor.chain().toggleBold().run()
```

### Issue: Dropdown not closing
**Solution:**
1. Check HeadingDropdown useEffect for click-outside listener
2. Verify document is available (not SSR issue)
3. Clear browser cache

### Issue: Input form not appearing
**Solution:**
1. Verify isOpen prop is true
2. Check parent component state is updating
3. Ensure onToggle is called correctly
4. Check z-index conflicts

### Issue: Styling looks wrong
**Solution:**
1. Verify Tailwind CSS is running
2. Check for CSS conflicts
3. Ensure theme colors are configured
4. Check browser DevTools for specificity issues

### Issue: Buttons disabled incorrectly
**Solution:**
1. Verify editor.can() methods return correct values
2. Check editor state is updating
3. Ensure chain() calls are completing

## Performance Optimization

### Current State
- Components are properly memoized
- No unnecessary re-renders from parent
- Event handlers use direct callbacks
- Dropdowns lazy-render their content

### Potential Improvements
- Add React.memo() to stateless components
- Use useCallback() for event handlers
- Implement virtual scrolling for large lists
- Optimize icon imports

### Monitoring
```tsx
// Add profiler to debug performance
import { Profiler } from 'react';

<Profiler id="toolbar" onRender={console.log}>
  <EditorToolbar editor={editor} />
</Profiler>
```

## Browser DevTools Tips

### React DevTools
1. Select EditorToolbar component
2. Check props: `editor`, `showLinkInput`, `showImageInput`
3. Watch state updates during user interactions
4. Verify re-renders don't cascade unnecessarily

### Console Debugging
```tsx
// Log editor state
console.log(editor.getJSON())

// Log active marks
console.log(editor.isActive('bold'))

// Log editor state
console.log(editor.state)
```

### Network Tab
- Check API calls during file uploads (if implemented)
- Monitor image/file URL loading

## Common Patterns

### Pattern 1: Adding a New Feature Button
```tsx
// 1. Create component
export function MyFeatureButton({ editor }) {
  return (
    <ToolbarButton
      onClick={() => editor.chain().focus().myCommand().run()}
      isActive={editor.isActive('myFeature')}
      title="My Feature"
    >
      <MyIcon className="h-4 w-4" />
    </ToolbarButton>
  );
}

// 2. Add to toolbar
<MyFeatureButton editor={editor} />
<ToolbarSeparator />
```

### Pattern 2: Adding Input Form Component
```tsx
// Use LinkInput as template
// 1. Create button component
export const MyButton = ({ editor, isOpen, onToggle }) => {
  return <ToolbarButton onClick={onToggle} />;
};

// 2. Create form component
export const MyForm = ({ editor, isOpen }) => {
  const [value, setValue] = useState('');
  if (!isOpen) return null;
  return <form>{/* form content */}</form>;
};

// 3. Integrate into EditorToolbar
```

## Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] No console warnings
- [ ] Components render correctly
- [ ] Keyboard shortcuts work
- [ ] Mobile responsiveness tested
- [ ] Accessibility (a11y) verified
- [ ] Performance benchmarked
- [ ] Documentation updated
- [ ] Backward compatibility confirmed

## Support & Resources

- **TipTap Docs:** https://www.tiptap.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **React Docs:** https://react.dev/
- **This Project:** See TOOLBAR_COMPONENTS.md and REFACTORING_SUMMARY.md
