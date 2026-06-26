import { X, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showWordCount: boolean;
  spellcheck: boolean;
  pasteImageLink: boolean;
  onPreferenceChange: (key: string, value: boolean) => void;
}

export function NotesSettingsModal({
  isOpen,
  onClose,
  showWordCount,
  spellcheck,
  pasteImageLink,
  onPreferenceChange,
}: NotesSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[480px] border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 bg-background text-foreground border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2 select-none">
            <Settings className="h-4 w-4 text-muted-foreground/60" />
            <h2 className="text-sm font-semibold text-foreground/90">
              Editor Preferences
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-accent/20 transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Pane */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[400px]">
          <div className="select-none">
            <p className="text-xs text-muted-foreground">
              Configure advanced behavior settings for your digital note canvas.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground/85">Show Word Count</h4>
                <p className="text-[11px] text-muted-foreground/60">Display a live word and character count at the bottom of the editor.</p>
              </div>
              <button
                type="button"
                onClick={() => onPreferenceChange("showWordCount", !showWordCount)}
                className={cn(
                  "h-4.5 w-8 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-200 outline-none border-none",
                  showWordCount ? "bg-primary" : "bg-muted-foreground/20"
                )}
              >
                <div className={cn(
                  "h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  showWordCount && "translate-x-3.5"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground/85">Spellcheck & Autocorrect</h4>
                <p className="text-[11px] text-muted-foreground/60">Highlight spelling errors and enable browser autocorrect features.</p>
              </div>
              <button
                type="button"
                onClick={() => onPreferenceChange("spellcheck", !spellcheck)}
                className={cn(
                  "h-4.5 w-8 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-200 outline-none border-none",
                  spellcheck ? "bg-primary" : "bg-muted-foreground/20"
                )}
              >
                <div className={cn(
                  "h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  spellcheck && "translate-x-3.5"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <div>
                <h4 className="text-xs font-semibold text-foreground/85">Paste Image Links directly</h4>
                <p className="text-[11px] text-muted-foreground/60">Automatically resolve direct image URLs into embedded canvas images.</p>
              </div>
              <button
                type="button"
                onClick={() => onPreferenceChange("pasteImageLink", !pasteImageLink)}
                className={cn(
                  "h-4.5 w-8 rounded-full flex items-center px-0.5 cursor-pointer transition-colors duration-200 outline-none border-none",
                  pasteImageLink ? "bg-primary" : "bg-muted-foreground/20"
                )}
              >
                <div className={cn(
                  "h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                  pasteImageLink && "translate-x-3.5"
                )} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
