import { X, Palette, Settings, Sliders, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorTheme: string;
  onThemeChange: (theme: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  editorTheme,
  onThemeChange,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const themes = [
    {
      id: "light",
      name: "Notion Light",
      bgClass: "bg-white border-neutral-200 text-neutral-800",
      previewBg: "#ffffff",
      desc: "Default warm light background",
    },
    {
      id: "dark",
      name: "Notion Dark",
      bgClass: "bg-[#191919] border-neutral-800 text-white",
      previewBg: "#191919",
      desc: "Sleek organic dark canvas",
    },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-[680px] h-[480px] bg-background border rounded-md flex overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Sidebar */}
        <aside className="w-48 border-r bg-muted/30 p-3 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1.5 mb-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
              Settings
            </span>
          </div>

          <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium bg-black/5 dark:bg-white/5 text-foreground transition-all cursor-pointer">
            <Palette className="h-4 w-4 text-primary" />
            <span>Appearance</span>
          </button>
          
          <button className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer">
            <Sliders className="h-4 w-4" />
            <span>Preferences</span>
          </button>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Appearance & Styling</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Core Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <h3 className="text-[13px] font-medium text-foreground/80 mb-1">
                Editor Theme
              </h3>
              <p className="text-xs text-muted-foreground">
                Customize the look and feel of your workspace to fit your workflow.
              </p>
            </div>

            {/* Grid of themes */}
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => {
                const isActive = editorTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={cn(
                      "flex flex-col text-left p-3 rounded-md border transition-colors duration-150 cursor-pointer relative group",
                      isActive
                        ? "border-foreground bg-muted"
                        : "border-border hover:border-foreground/20 hover:bg-black/5 dark:hover:bg-white/5"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-12 rounded border mb-2 relative overflow-hidden transition-colors",
                        theme.bgClass
                      )}
                    >
                      <div className="absolute top-2 left-2 flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 h-1.5 rounded bg-foreground/10" />
                      <div className="absolute bottom-4 left-2 w-12 h-1.5 rounded bg-foreground/20" />
                    </div>

                    <span className="text-[13px] font-semibold">{theme.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-full">
                      {theme.desc}
                    </span>

                    {isActive && (
                      <span className="absolute top-2 right-2 text-foreground bg-background rounded-full w-4 h-4 flex items-center justify-center border border-border">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
