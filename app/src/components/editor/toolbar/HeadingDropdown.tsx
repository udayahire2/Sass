import { useRef, useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { ChevronDown, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeadingDropdownProps {
  editor: Editor;
}

export const HeadingDropdown = ({ editor }: HeadingDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getActiveHeadingLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    return 'Normal Text';
  };

  const setHeading = (level: 1 | 2 | 3 | 0) => {
    if (level === 0) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
    }
    setIsOpen(false);
  };

  const headingOptions = [
    { level: 0, label: 'Normal Text', icon: <Type className="h-3.5 w-3.5" /> },
    { level: 1, label: 'Heading 1', shortLabel: 'H1' },
    { level: 2, label: 'Heading 2', shortLabel: 'H2' },
    { level: 3, label: 'Heading 3', shortLabel: 'H3' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-foreground/90 hover:bg-muted/70 transition-colors focus:outline-none cursor-pointer"
      >
        <span>{getActiveHeadingLabel()}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-40 rounded-lg border border-border bg-popover p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {headingOptions.map((option) => (
            <button
              key={`heading-${option.level}`}
              type="button"
              onClick={() => setHeading(option.level as 0 | 1 | 2 | 3)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-left font-medium hover:bg-muted/80 transition-colors cursor-pointer',
                (option.level === 0 && !editor.isActive('heading')) ||
                  (option.level !== 0 && editor.isActive('heading', { level: option.level as 1 | 2 | 3 }))
                  ? 'bg-muted text-primary'
                  : ''
              )}
            >
              {option.icon ? (
                option.icon
              ) : (
                <span className={cn('font-bold', {
                  'text-[13px]': option.level === 1,
                  'text-[12px]': option.level === 2,
                  'text-[11px]': option.level === 3,
                })}>
                  {option.shortLabel}
                </span>
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
