import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link2, Trash2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Solid cover presets.

interface CoverPreset {
  name: string;
  value: string;
}

const COVER_PRESETS: CoverPreset[] = [
  { name: "Default", value: "#f7f6f3" },
  { name: "Gray", value: "#e9e9e7" },
  { name: "Brown", value: "#eee0da" },
  { name: "Orange", value: "#fadec9" },
  { name: "Yellow", value: "#fdecc8" },
  { name: "Green", value: "#dbeddb" },
  { name: "Blue", value: "#d3e5ef" },
  { name: "Purple", value: "#e8deee" },
  { name: "Pink", value: "#f5e0e9" },
  { name: "Red", value: "#ffe2dd" },
  { name: "Charcoal", value: "#2f3437" },
  { name: "Ink", value: "#37352f" },
];

// ─── Component ────────────────────────────────────────────────────────────────

type TabId = "gallery" | "link";

interface CoverPickerProps {
  isOpen: boolean;
  onSelect: (coverUrl: string) => void;
  onRemove: () => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function CoverPicker({
  isOpen,
  onSelect,
  onRemove,
  onClose,
  triggerRef,
}: CoverPickerProps) {
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

  const handleCoverSelect = useCallback(
    (cover: string) => {
      onSelect(cover);
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
        "fixed z-[9999] w-[380px] rounded-md border",
        "bg-white dark:bg-[#2F2F2F]",
        "border-[#e8e5e0] dark:border-[#ffffff14]",
        "flex flex-col overflow-hidden",
        "transition-all duration-150 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-1"
      )}
      style={{
        top: position.top,
        left: position.left,
        maxHeight: "min(460px, calc(100vh - 24px))",
      }}
    >
      {/* ── Tab Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 px-3 pt-2.5 border-b border-[#f0efec] dark:border-[#ffffff0f]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-3 pb-2.5 pt-1 text-[13px] font-medium",
              "transition-colors duration-100 cursor-pointer",
              activeTab === tab.id
                ? "text-[#37352f] dark:text-[#ffffffcf]"
                : "text-[#a9a9a7] dark:text-[#ffffff50] hover:text-[#6b6b69] dark:hover:text-[#ffffff80]"
            )}
          >
            {tab.label}
            {/* Active indicator */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-[#37352f] dark:bg-[#ffffffcf]" />
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#b4b4b0] dark:text-[#ffffff50]">
                Color
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {COVER_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleCoverSelect(preset.value)}
                  className={cn(
                    "group relative h-[60px] rounded-md overflow-hidden border border-border",
                    "hover:border-foreground/30",
                    "transition-colors duration-150 cursor-pointer"
                  )}
                  title={preset.name}
                >
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: preset.value }}
                  />
                  <div
                    className={cn(
                      "absolute inset-0 flex items-end p-1.5",
                      "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-150"
                    )}
                  >
                    <span className="rounded-sm bg-background/90 px-1 text-[10px] font-medium text-foreground truncate leading-tight">
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#b4b4b0] dark:text-[#ffffff50]">
                Paste an image link
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex-1 flex items-center gap-2 rounded-lg px-3 h-9",
                  "bg-[#f7f6f3] dark:bg-[#ffffff0a]",
                  "border border-transparent",
                  "focus-within:border-[#e3e2df] dark:focus-within:border-[#ffffff1a]",
                  "focus-within:bg-white dark:focus-within:bg-[#ffffff0f]",
                  "transition-colors duration-150"
                )}
              >
                <Link2 className="h-3.5 w-3.5 text-[#a9a9a7] dark:text-[#ffffff50] shrink-0" />
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={handleLinkKeyDown}
                  className={cn(
                    "flex-1 bg-transparent border-none outline-none",
                    "text-[13px] placeholder:text-[#b4b4b0] dark:placeholder:text-[#ffffff40]",
                    "text-[#37352f] dark:text-[#ffffffcf]"
                  )}
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
                    ? "bg-[#37352f] dark:bg-[#ffffffcf] text-white dark:text-[#2F2F2F] hover:bg-[#2f2e2b] dark:hover:bg-white"
                    : "bg-[#f0efec] dark:bg-[#ffffff14] text-[#c8c7c3] dark:text-[#ffffff30] cursor-not-allowed"
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Helper text */}
            <p className="mt-3 text-[12px] leading-relaxed text-[#b4b4b0] dark:text-[#ffffff40]">
              Works with any image from the web. Paste a direct link to a .jpg, .png, or .webp file
              for best results.
            </p>
          </div>
        )}
      </div>

      {/* ── Remove Button Footer ────────────────────────────────────── */}
      <div className="border-t border-[#f0efec] dark:border-[#ffffff0f] px-3 py-2">
        <button
          type="button"
          onClick={handleRemove}
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded-md",
            "text-[13px] text-[#eb5757] dark:text-[#ff6b6b]",
            "hover:bg-[#fbe9e9] dark:hover:bg-[#ff6b6b14]",
            "active:bg-[#f5d5d5] dark:active:bg-[#ff6b6b22]",
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
