import { FileText, Plus, Menu } from "lucide-react";

interface EmptyStateProps {
  sidebarVisible: boolean;
  notesCount: number;
  onCreateNote: () => void;
  onToggleSidebar: () => void;
}

export function EmptyState({
  sidebarVisible,
  notesCount,
  onCreateNote,
  onToggleSidebar,
}: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-background text-center">
      {!sidebarVisible && (
        <button
          onClick={onToggleSidebar}
          className="absolute top-3 left-3 rounded-[5px] p-1.5 text-foreground/50 hover:bg-muted/60 transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>
      )}
      <div className="flex flex-col items-center gap-2">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center">
          <FileText className="h-7 w-7 text-muted-foreground/30" />
        </div>
        <p className="text-sm text-muted-foreground/60 mt-2">
          {notesCount === 0
            ? "Create your first page"
            : "Select a page or create a new one"}
        </p>
        <button
          onClick={onCreateNote}
          className="mt-3 flex items-center gap-2 rounded-[8px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New page
        </button>
      </div>
    </div>
  );
}
