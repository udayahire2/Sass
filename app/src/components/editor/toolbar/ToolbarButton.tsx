import React from 'react';
import { cn } from '@/lib/utils';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  ToolbarButtonProps
>(
  (
    {
      onClick,
      isActive = false,
      disabled = false,
      title,
      children,
      className,
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
          'p-1.5 rounded-md transition-all focus:outline-none cursor-pointer',
          'text-foreground/80 hover:text-foreground hover:bg-muted/70',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          isActive && 'bg-muted text-primary',
          className
        )}
      >
        {children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';
