import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Helper to determine the active note editor theme class dynamically
const getActiveThemeClass = () => {
  if (typeof document === "undefined") return "theme-light-editor";
  const container = document.querySelector('[class*="theme-"]');
  if (container) {
    const matchedClass = Array.from(container.classList).find(
      (cls) => cls.startsWith("theme-") && cls.endsWith("-editor")
    );
    if (matchedClass) return matchedClass;
  }
  return "theme-light-editor";
};

export const SelectClean = SelectPrimitive.Root;

export function SelectCleanTrigger({
  className,
  children,
  ...props
}: SelectPrimitive.Trigger.Props): React.ReactElement {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "relative inline-flex h-7 min-w-0 select-none items-center justify-between gap-1.5 rounded-md border-none bg-transparent px-2 text-left text-xs font-semibold text-muted-foreground shadow-none outline-none transition-colors hover:bg-sidebar-accent hover:text-foreground focus:ring-0 focus:ring-offset-0 cursor-pointer",
        className
      )}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <SelectPrimitive.Icon data-slot="select-icon">
        <ChevronDownIcon className="size-3.5 shrink-0 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectCleanValue({
  className,
  ...props
}: SelectPrimitive.Value.Props): React.ReactElement {
  return (
    <SelectPrimitive.Value
      className={cn("truncate", className)}
      data-slot="select-value"
      {...props}
    />
  );
}

export function SelectCleanContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "start",
  alignOffset = 0,
  alignItemWithTrigger = false,
  anchor,
  ...props
}: SelectPrimitive.Popup.Props & {
  side?: SelectPrimitive.Positioner.Props["side"];
  sideOffset?: SelectPrimitive.Positioner.Props["sideOffset"];
  align?: SelectPrimitive.Positioner.Props["align"];
  alignOffset?: SelectPrimitive.Positioner.Props["alignOffset"];
  alignItemWithTrigger?: SelectPrimitive.Positioner.Props["alignItemWithTrigger"];
  anchor?: SelectPrimitive.Positioner.Props["anchor"];
}): React.ReactElement {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50 select-none"
        data-slot="select-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          className={cn("origin-(--transform-origin) text-foreground outline-none", getActiveThemeClass())}
          data-slot="select-popup"
          {...props}
        >
          <SelectPrimitive.ScrollUpArrow
            className="top-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:top-px before:h-[200%] before:rounded-t-[calc(var(--radius-lg)-1px)] before:bg-linear-to-b before:from-50% before:from-background"
            data-slot="select-scroll-up-arrow"
          >
            <ChevronUpIcon className="relative size-3.5" />
          </SelectPrimitive.ScrollUpArrow>
          <div className="relative h-full min-w-(--anchor-width) max-h-[300px] rounded-lg border bg-background not-dark:bg-clip-padding shadow-lg before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] dark:before:shadow-[0_-1px_--theme(--color-white/6%)]">
            <SelectPrimitive.List
              className={cn(
                "max-h-[280px] overflow-y-auto p-1 scrollbar-none",
                className
              )}
              data-slot="select-list"
            >
              {children}
            </SelectPrimitive.List>
          </div>
          <SelectPrimitive.ScrollDownArrow
            className="bottom-0 z-50 flex h-6 w-full cursor-default items-center justify-center before:pointer-events-none before:absolute before:inset-x-px before:bottom-px before:h-[200%] before:rounded-b-[calc(var(--radius-lg)-1px)] before:bg-linear-to-t before:from-50% before:from-background"
            data-slot="select-scroll-down-arrow"
          >
            <ChevronDownIcon className="relative size-3.5" />
          </SelectPrimitive.ScrollDownArrow>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

export function SelectCleanItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props): React.ReactElement {
  return (
    <SelectPrimitive.Item
      className={cn(
        "grid min-h-8 in-data-[side=none]:min-w-[calc(var(--anchor-width)+1.25rem)] cursor-default grid-cols-[1rem_1fr] items-center gap-1.5 rounded-md py-1 ps-2 pe-4 text-xs font-semibold outline-none data-disabled:pointer-events-none data-highlighted:bg-sidebar-accent data-highlighted:text-foreground data-disabled:opacity-64 select-none [&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="select-item"
      {...props}
    >
      <SelectPrimitive.ItemIndicator className="col-start-1 flex items-center justify-center">
        <svg
          aria-hidden="true"
          fill="none"
          height="13"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          width="13"
          className="text-primary"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M5.252 12.7 10.2 18.63 18.748 5.37" />
        </svg>
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText className="col-start-2 min-w-0 truncate">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
