import type * as React from "react";
import { cn } from "@/lib/utils";

export function EditorTable({
  className,
  ...props
}: React.ComponentProps<"table">): React.ReactElement {
  return (
    <div
      className="relative w-full overflow-x-auto rounded-md border border-border bg-card"
      data-slot="editor-table-container"
    >
      <table
        className={cn(
          "w-full border-collapse text-sm text-foreground",
          className,
        )}
        data-slot="editor-table"
        {...props}
      />
    </div>
  );
}

export function EditorTableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">): React.ReactElement {
  return (
    <thead
      className={cn("bg-muted/30 border-b border-border", className)}
      data-slot="editor-table-header"
      {...props}
    />
  );
}

export function EditorTableBody({
  className,
  ...props
}: React.ComponentProps<"tbody">): React.ReactElement {
  return (
    <tbody
      className={cn(
        "[&_tr:last-child]:border-0",
        className,
      )}
      data-slot="editor-table-body"
      {...props}
    />
  );
}

export function EditorTableRow({
  className,
  ...props
}: React.ComponentProps<"tr">): React.ReactElement {
  return (
    <tr
      className={cn(
        "border-b border-border transition-none",
        className,
      )}
      data-slot="editor-table-row"
      {...props}
    />
  );
}

export function EditorTableHead({
  className,
  ...props
}: React.ComponentProps<"th">): React.ReactElement {
  return (
    <th
      className={cn(
        "p-2 px-3 text-left align-top font-medium text-muted-foreground border-r border-border last:border-r-0 relative group",
        className,
      )}
      data-slot="editor-table-head"
      {...props}
    />
  );
}

export function EditorTableCell({
  className,
  ...props
}: React.ComponentProps<"td">): React.ReactElement {
  return (
    <td
      className={cn(
        "p-2 px-3 align-top border-r border-border last:border-r-0 relative group bg-transparent",
        className,
      )}
      data-slot="editor-table-cell"
      {...props}
    />
  );
}
