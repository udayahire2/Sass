import { useState } from "react";
import { X, Palette, Settings, Sparkles, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorTheme: string;
  onThemeChange: (theme: string) => void;
  showWordCount: boolean;
  spellcheck: boolean;
  pasteImageLink: boolean;
  onPreferenceChange: (key: string, value: boolean) => void;
}

export function NotesSettingsModal({
  isOpen,
  onClose,
  editorTheme,
  onThemeChange,
  showWordCount,
  spellcheck,
  pasteImageLink,
  onPreferenceChange,
}: NotesSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"appearance" | "preferences">("appearance");

  if (!isOpen) return null;

  const themes = [
    {
      id: "light",
      name: "Notion Light",
      sidebarBg: "bg-[#fbfbfa]",
      contentBg: "bg-white",
      borderColor: "border-[#edece9]",
      titleColor: "bg-[#37352f]/25",
      lineColor: "bg-[#37352f]/10",
      desc: "Default warm light background",
    },
    {
      id: "dark",
      name: "Notion Dark",
      sidebarBg: "bg-[#202020]",
      contentBg: "bg-[#191919]",
      borderColor: "border-[#ffffff14]",
      titleColor: "bg-white/25",
      lineColor: "bg-white/10",
      desc: "Sleek organic dark canvas",
    },
    {
      id: "sepia",
      name: "Warm Sepia",
      sidebarBg: "bg-[#f4ecd8]",
      contentBg: "bg-[#fbf6ec]",
      borderColor: "border-[#5c4a3714]",
      titleColor: "bg-[#433422]/25",
      lineColor: "bg-[#433422]/10",
      desc: "Cozy eye-friendly sepia canvas",
    },
    {
      id: "nord",
      name: "Polar Nord",
      sidebarBg: "bg-[#242933]",
      contentBg: "bg-[#2e3440]",
      borderColor: "border-[#d8dee914]",
      titleColor: "bg-[#d8dee9]/25",
      lineColor: "bg-[#d8dee9]/10",
      desc: "Nordic arctic frost palette",
    },
  ];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className={cn(
        "relative w-full max-w-[680px] h-[480px] border rounded-2xl shadow-2xl flex overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200",
        editorTheme === "light" && "theme-light-editor bg-white text-[#37352f] border-[#edece9]",
        editorTheme === "dark" && "theme-dark-editor bg-[#191919] text-white border-[#ffffff14]",
        editorTheme === "sepia" && "theme-sepia-editor bg-[#fbf6ec] text-[#433422] border-[#5c4a3714]",
        editorTheme === "nord" && "theme-nord-editor bg-[#2e3440] text-[#d8dee9] border-[#d8dee914]"
      )}>
        {/* Sidebar */}
        <aside className="w-48 border-r border-border/40 bg-sidebar p-3 flex flex-col gap-1.5 shrink-0 select-none">
          <div className="flex items-center gap-2 px-2.5 py-1.5 mb-2">
            <Settings className="h-4 w-4 text-muted-foreground/60" />
            <span className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
              Settings
            </span>
          </div>

          <button
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all cursor-pointer w-full text-left",
              activeTab === "appearance"
                ? "bg-primary/10 text-primary font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </button>
          
          <button
            onClick={() => setActiveTab("preferences")}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all cursor-pointer w-full text-left",
              activeTab === "preferences"
                ? "bg-primary/10 text-primary font-semibold shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            )}
          >
            <Sliders className="h-4 w-4" />
            <span>Preferences</span>
          </button>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
            <div className="flex items-center gap-2 select-none">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground/90">
                {activeTab === "appearance" ? "Appearance & Styling" : "Editor Preferences"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground/60 hover:text-foreground hover:bg-sidebar-accent transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Core Panel Content */}
          {activeTab === "appearance" ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 select-none">
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
                        "flex flex-col text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer shadow-sm relative group",
                        isActive
                          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                          : "border-border/60 hover:border-foreground/20 hover:bg-sidebar-accent"
                      )}
                    >
                      {/* Split column mini workspace mockup */}
                      <div
                        className={cn(
                          "w-full h-14 rounded-lg border mb-2 relative overflow-hidden flex transition-all shadow-inner",
                          isActive ? "border-primary/40" : "border-border/40"
                        )}
                      >
                        {/* Mock Sidebar */}
                        <div className={cn("w-1/4 h-full border-r p-1.5 space-y-1", theme.sidebarBg, theme.borderColor)}>
                          <div className={cn("w-full h-1 rounded", theme.lineColor)} />
                          <div className={cn("w-2/3 h-1 rounded", theme.lineColor)} />
                          <div className={cn("w-5/6 h-1 rounded", theme.lineColor)} />
                        </div>
                        {/* Mock Canvas */}
                        <div className={cn("w-3/4 h-full p-2 space-y-1.5", theme.contentBg)}>
                          <div className={cn("w-1/3 h-1.5 rounded", theme.titleColor)} />
                          <div className={cn("w-full h-1 rounded", theme.lineColor)} />
                          <div className={cn("w-full h-1 rounded", theme.lineColor)} />
                          <div className={cn("w-4/5 h-1 rounded", theme.lineColor)} />
                        </div>
                      </div>

                      <span className="text-[13px] font-semibold text-foreground/90">{theme.name}</span>
                      <span className="text-[10px] text-muted-foreground/70 truncate max-w-full">
                        {theme.desc}
                      </span>

                      {isActive && (
                        <span className="absolute top-2 right-2 text-primary font-bold text-xs bg-background rounded-full w-4.5 h-4.5 flex items-center justify-center shadow">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="select-none">
                <h3 className="text-[13px] font-medium text-foreground/80 mb-1">
                  Editor Configuration
                </h3>
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
          )}
        </main>
      </div>
    </div>
  );
}
