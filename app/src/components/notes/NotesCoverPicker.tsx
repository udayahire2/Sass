import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link2, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Gradient Presets ─────────────────────────────────────────────────────────

interface GradientPreset {
  name: string;
  value: string;
}

const GRADIENT_PRESETS: GradientPreset[] = [
  {
    name: "Warm Sunset",
    value: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
  },
  {
    name: "Cool Ocean",
    value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    name: "Forest Dawn",
    value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  },
  {
    name: "Purple Nebula",
    value: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
  },
  {
    name: "Soft Peach",
    value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    name: "Midnight City",
    value: "linear-gradient(135deg, #232526 0%, #414345 100%)",
  },
  {
    name: "Rose Water",
    value: "linear-gradient(135deg, #e6b0aa 0%, #f5cac3 50%, #fae1dd 100%)",
  },
  {
    name: "Arctic Blue",
    value: "linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%)",
  },
  {
    name: "Lavender Fields",
    value: "linear-gradient(135deg, #c9d6ff 0%, #e2e2e2 100%)",
  },
  {
    name: "Golden Hour",
    value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    name: "Deep Space",
    value: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
  },
  {
    name: "Emerald Mist",
    value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    name: "Coral Reef",
    value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fdfcfb 100%)",
  },
  {
    name: "Storm Clouds",
    value: "linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)",
  },
  {
    name: "Cherry Blossom",
    value: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  },
  {
    name: "Sahara Sand",
    value: "linear-gradient(135deg, #d4a574 0%, #e6c8a0 50%, #f2e0c9 100%)",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

type TabId = "gallery" | "link";

interface NotesCoverPickerProps {
  isOpen: boolean;
  onSelect: (coverUrl: string) => void;
  onRemove: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  theme?: string;
}

export function NotesCoverPicker({
  isOpen,
  onSelect,
  onRemove,
  onClose,
  triggerRef,
  theme,
}: NotesCoverPickerProps) {
  const [activeTab, setActiveTab] = useState<TabId>("gallery");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Position calculation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = 380;
    const panelHeight = 440;

    let top = rect.bottom + 6;
    let left = rect.left + rect.width / 2 - panelWidth / 2;

    // Keep within viewport
    if (left + panelWidth > window.innerWidth - 12) {
      left = window.innerWidth - panelWidth - 12;
    }
    if (left < 12) left = 12;
    if (top + panelHeight > window.innerHeight - 12) {
      top = rect.top - panelHeight - 6;
    }

    setPosition({ top, left });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsVisible(true));
    });

    return () => {
      setIsVisible(false);
    };
  }, [isOpen, triggerRef]);

  // ── Click outside ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  // ── Reset on close ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("gallery");
      setLinkUrl("");
      setIsVisible(false);
    }
  }, [isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleGradientSelect = useCallback(
    (gradient: string) => {
      onSelect(gradient);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleLinkSubmit = useCallback(() => {
    const trimmed = linkUrl.trim();
    if (trimmed) {
      onSelect(trimmed);
      onClose();
    }
  }, [linkUrl, onSelect, onClose]);

  const handleRemove = useCallback(() => {
    onRemove();
    onClose();
  }, [onRemove, onClose]);

  const handleLinkKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleLinkSubmit();
      }
    },
    [handleLinkSubmit]
  );

  // ── Tabs config ───────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string }[] = [
    { id: "gallery", label: "Gallery" },
    { id: "link", label: "Link" },
  ];

  // ── Don't render when closed ──────────────────────────────────────────────

  if (!isOpen || !position) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        "fixed z-[9999] w-[380px] rounded-xl border shadow-xl flex flex-col overflow-hidden transition-all duration-150 ease-out",
        theme === "light" && "theme-light-editor bg-white text-[#37352f] border-[#e8e5e0]",
        theme === "dark" && "theme-dark-editor bg-[#191919] text-white border-[#ffffff14]",
        theme === "sepia" && "theme-sepia-editor bg-[#fbf6ec] text-[#433422] border-amber-100/50",
        theme === "nord" && "theme-nord-editor bg-[#2e3440] text-[#d8dee9] border-slate-700/50",
        "backdrop-blur-xl",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-1 scale-[0.98]"
      )}
      style={{
        top: position.top,
        left: position.left,
        maxHeight: "min(460px, calc(100vh - 24px))",
      }}
    >
      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 px-3 pt-2.5 border-b border-border/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 pb-2.5 pt-1 text-[13px] font-medium",
              "transition-colors duration-100 cursor-pointer",
              activeTab === tab.id
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "gallery" ? (
          /* ── Gallery Tab ──────────────────────────────────────────── */
          <div className="p-3">
            <div className="mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Color & Gradient
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleGradientSelect(preset.value)}
                  className={cn(
                    "group relative h-[60px] rounded-lg overflow-hidden",
                    "ring-1 ring-[#00000008] dark:ring-[#ffffff0a]",
                    "hover:ring-2 hover:ring-[#37352f40] dark:hover:ring-[#ffffff40]",
                    "active:scale-[0.97]",
                    "transition-all duration-150 cursor-pointer"
                  )}
                  title={preset.name}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: preset.value }}
                  />
                  {/* Hover overlay with name */}
                  <div
                    className={cn(
                      "absolute inset-0 flex items-end p-1.5",
                      "bg-gradient-to-t from-black/40 to-transparent",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-150"
                    )}
                  >
                    <span className="text-[10px] font-medium text-white/90 truncate leading-tight">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Link Tab ────────────────────────────────────────────── */
          <div className="p-3">
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                Paste an image link
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex-1 flex items-center gap-2 rounded-lg px-3 h-9",
                  "bg-muted/50 border border-border/40",
                  "focus-within:border-primary/40 focus-within:bg-background",
                  "transition-colors duration-150"
                )}
              >
                <Link2 className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={handleLinkKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground/45 text-foreground"
                  autoFocus
                />
              </div>

              <button
                type="button"
                onClick={handleLinkSubmit}
                disabled={!linkUrl.trim()}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-lg shrink-0",
                  "transition-all duration-150 cursor-pointer",
                  linkUrl.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Helper text */}
            <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground/50">
              Works with any image from the web. Paste a direct link to a .jpg, .png, or .webp file
              for best results.
            </p>
          </div>
        )}
      </div>

      {/* ── Remove Button Footer ────────────────────────────────────── */}
      <div className="border-t border-border/40 px-3 py-2">
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-md",
            "text-[13px] text-destructive",
            "hover:bg-destructive/10 active:bg-destructive/15",
            "transition-colors duration-100 cursor-pointer"
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Remove cover</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
