# Editor Toolbar Components Architecture

## Overview

The `EditorToolbar` component has been refactored into modular, reusable components organized in the `toolbar/` subdirectory. This improves maintainability, testability, and code reusability.

## Component Structure

```
editor/
├── EditorToolbar.tsx          # Main toolbar component
├── toolbar/
│   ├── index.ts               # Barrel export
│   ├── ToolbarButton.tsx      # Reusable button component
│   ├── ToolbarSeparator.tsx   # Visual divider
│   ├── HeadingDropdown.tsx    # Heading level selector
│   ├── TextFormattingSection.tsx  # Bold, italic, underline, strikethrough
│   ├── ListButtons.tsx        # Bullet and numbered lists
│   ├── CodeBlocksSection.tsx  # Code, code block, blockquote
│   ├── LinkInput.tsx          # Link button + input form
│   ├── ImageInput.tsx         # Image button + input form
│   ├── TableInsert.tsx        # Insert table button
│   └── UndoRedo.tsx           # Undo/redo buttons
└── [other editor files]
```

## Components Description

### Core Components

#### 1. **ToolbarButton**
A reusable, memoized button component for all toolbar actions.

```tsx
<ToolbarButton
  onClick={() => editor.chain().focus().toggleBold().run()}
  isActive={editor.isActive('bold')}
  title="Bold (Ctrl+B)"
  disabled={false}
>
  <BoldIcon className="h-4 w-4" />
</ToolbarButton>
```

**Props:**
- `onClick: () => void` - Button click handler
- `isActive?: boolean` - Highlights button when active
- `disabled?: boolean` - Disables button and reduces opacity
- `title?: string` - Tooltip text
- `children: React.ReactNode` - Icon or content
- `className?: string` - Additional Tailwind classes

**Features:**
- Consistent styling and hover effects
- Active state highlighting
- Disabled state management
- Smooth transitions

---

#### 2. **ToolbarSeparator**
A visual divider between toolbar sections.

```tsx
<ToolbarSeparator />
```

**Renders:** A thin vertical line with muted color

---

### Feature Components

#### 3. **HeadingDropdown**
Selector for heading levels (H1, H2, H3) and normal text.

```tsx
<HeadingDropdown editor={editor} />
```

**Features:**
- Dropdown menu with 4 options (Normal Text, H1, H2, H3)
- Click-outside detection to close dropdown
- Active state highlighting
- Displays current heading level

---

#### 4. **TextFormattingSection**
Inline text formatting buttons.

```tsx
<TextFormattingSection editor={editor} />
```

**Includes:**
- Bold (Ctrl+B)
- Italic (Ctrl+I)
- Underline (Ctrl+U)
- Strikethrough

---

#### 5. **ListButtons**
List creation and management.

```tsx
<ListButtons editor={editor} />
```

**Includes:**
- Bullet List
- Numbered (Ordered) List

---

#### 6. **CodeBlocksSection**
Code and block-level formatting.

```tsx
<CodeBlocksSection editor={editor} />
```

**Includes:**
- Inline Code
- Code Block
- Blockquote

---

#### 7. **LinkInput**
Link creation and management with URL input form.

```tsx
<LinkInput
  editor={editor}
  isOpen={showLinkInput}
  onToggle={() => setShowLinkInput(!showLinkInput)}
/>
```

**Structure:**
- `LinkButton` - Button in toolbar row
- `LinkForm` - Input form below toolbar
- `LinkInput` - Combined component (for backward compatibility)

**Features:**
- URL input with validation
- Empty URL removes link
- Auto-focus on input
- Green confirm button, red cancel button

---

#### 8. **ImageInput**
Image insertion with URL input form.

```tsx
<ImageInput
  editor={editor}
  isOpen={showImageInput}
  onToggle={() => setShowImageInput(!showImageInput)}
/>
```

**Structure:**
- `ImageButton` - Button in toolbar row
- `ImageForm` - Input form below toolbar
- `ImageInput` - Combined component (for backward compatibility)

**Features:**
- Image URL input
- URL validation
- Auto-focus on input
- Insert and cancel buttons

---

#### 9. **TableInsert**
Insert a 3x3 table with header row.

```tsx
<TableInsert editor={editor} />
```

**Default:**
- Rows: 3
- Columns: 3
- Header row: Yes

---

#### 10. **UndoRedo**
Undo and redo operations.

```tsx
<UndoRedo editor={editor} />
```

**Features:**
- Disabled state when no undo/redo available
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)

---

## EditorToolbar Component

The main toolbar component that orchestrates all sub-components.

```tsx
<EditorToolbar editor={editor} />
```

**Features:**
- Sticky positioning at top of editor
- Flex layout with wrapping
- Horizontal scroll on overflow (mobile-friendly)
- Shadow for depth
- State management for link and image inputs
- Mutual exclusivity: Only one input form open at a time

---

## UI Improvements

### 1. **Responsive Design**
- Toolbar wraps on smaller screens
- Horizontal scrolling fallback
- Touch-friendly button sizes

### 2. **Better Visual Hierarchy**
- Added shadow to toolbar (`shadow-sm`)
- Clear separators between logical groups
- Consistent icon sizes (h-4 w-4)

### 3. **Improved Accessibility**
- All buttons have `title` attributes (tooltips)
- Keyboard shortcuts documented
- Semantic HTML structure
- Focus management in dropdowns

### 4. **Animation**
- Smooth transitions on hover and active states
- Slide-in animation for input forms
- Fade-in animation for dropdown menu

### 5. **State Management**
- Parent component manages link/image input visibility
- Mutual exclusivity prevents overlapping forms
- Clean state handling without prop drilling

### 6. **Code Quality**
- TypeScript strict typing
- Component composition over monolithic code
- Single responsibility principle
- Easy to test individual components

---

## Usage Example

```tsx
import EditorToolbar from '@/components/editor/EditorToolbar';
import { useEditor, EditorContent } from '@tiptap/react';

export function Editor() {
  const editor = useEditor({
    extensions: [/* ... */],
    content: '',
  });

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <EditorContent 
        editor={editor}
        className="prose prose-sm p-4 focus:outline-none"
      />
    </div>
  );
}
```

---

## Styling

All components use Tailwind CSS with the following conventions:

- **Button states:**
  - Normal: `text-foreground/80 hover:text-foreground hover:bg-muted/70`
  - Active: `bg-muted text-primary`
  - Disabled: `opacity-40 disabled:cursor-not-allowed`

- **Spacing:**
  - Button padding: `p-1.5`
  - Toolbar padding: `p-1.5`
  - Gap between elements: `gap-1`

- **Typography:**
  - Text size: `text-xs` (smaller for toolbar)
  - Font weight: `font-medium` or `font-semibold`

- **Colors:**
  - Foreground: Text color
  - Background: Card background
  - Border: Border color
  - Primary: Accent color for active states

---

## Performance Considerations

1. **Memoization:** Components don't re-render unnecessarily
2. **Event delegation:** Buttons use direct event handlers
3. **Lazy rendering:** Dropdown menus only render when open
4. **No unnecessary re-renders:** Parent state changes don't cascade

---

## Browser Support

- Modern browsers with ES2020+ support
- Tailwind CSS 3.0+
- React 18+
- TipTap 2.0+

---

## Future Enhancements

1. **Color picker** for text/background colors
2. **Font family selector**
3. **Font size selector**
4. **Text alignment buttons**
5. **Keyboard shortcuts display**
6. **Toolbar customization** (show/hide buttons)
7. **Floating menu** for selected text
8. **Command palette** (slash commands)
9. **Image resize** handles
10. **Link preview** on hover

---

## Migration Guide

If updating from the old monolithic EditorToolbar:

### Old (Monolithic)
```tsx
// All 400+ lines in one file
import EditorToolbar from '@/components/editor/EditorToolbar';
```

### New (Modular)
```tsx
// Same import, but now using modular components
import EditorToolbar from '@/components/editor/EditorToolbar';

// Or use individual components
import { ToolbarButton, HeadingDropdown } from '@/components/editor/toolbar';
```

No breaking changes! The new architecture is fully backward compatible.

---

## File Sizes (Comparison)

| Component | Old Size | New Size | Savings |
|-----------|----------|----------|---------|
| EditorToolbar.tsx | 423 lines | 78 lines | 81% |
| Total Toolbar code | 423 lines | ~250 lines | 41% |
| Per-component reusability | Low | High | - |

---

## Testing

Each component can be tested independently:

```tsx
// Example: Testing ToolbarButton
describe('ToolbarButton', () => {
  it('should render with active state', () => {
    render(<ToolbarButton isActive={true} onClick={jest.fn()} />);
    // Assert active styles
  });
});
```

---

## Support

For issues or questions about the toolbar components, refer to:
- TipTap documentation: https://www.tiptap.dev/
- Tailwind CSS: https://tailwindcss.com/
- React: https://react.dev/
