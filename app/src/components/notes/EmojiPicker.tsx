import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Emoji Data ───────────────────────────────────────────────────────────────

interface EmojiCategory {
  name: string;
  emojis: string[];
}

const EMOJI_DATA: EmojiCategory[] = [
  {
    name: "People",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊",
      "😇","🥰","😍","🤩","😘","😗","😋","😛","😜","🤪",
      "😎","🤓","🧐","😏","🥳","😤","😠","🥺","😢","😭",
    ],
  },
  {
    name: "Nature",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
      "🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦅","🦋",
      "🐛","🐝","🌸","🌺","🌻","🌹","🌲","🌴","🍀","🌈",
    ],
  },
  {
    name: "Food",
    emojis: [
      "🍎","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍑","🥭",
      "🍍","🥝","🍔","🍕","🌮","🍣","🍜","🍩","🍪","🎂",
      "🍰","🧁","🍫","🍿","☕","🍵","🧃","🥤","🍺","🍷",
    ],
  },
  {
    name: "Activities",
    emojis: [
      "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸",
      "🥊","🎯","🎮","🕹️","🎲","🧩","🎭","🎨","🎬","🎤",
      "🎧","🎵","🎹","🥁","🎷","🎺","🎸","🪗","🏆","🥇",
    ],
  },
  {
    name: "Travel",
    emojis: [
      "🚗","🚕","🚌","🏎️","🚓","🚑","🚒","🚐","🛻","🚚",
      "✈️","🚀","🛸","🚁","⛵","🚢","🏠","🏡","🏢","🏰",
      "🗼","🗽","⛩️","🕌","🌍","🌎","🌏","🗺️","🏔️","🌋",
    ],
  },
  {
    name: "Objects",
    emojis: [
      "💡","🔦","📱","💻","⌨️","🖥️","🖨️","📷","📹","🎥",
      "📺","📻","⏰","🕰️","📡","🔋","💾","💿","📀","📚",
      "📖","✏️","🖊️","📝","📌","📎","🔑","🔒","🔓","🔧",
    ],
  },
  {
    name: "Symbols",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
      "❣️","💕","💞","💓","💗","💖","💘","💝","⭐","🌟",
      "✨","⚡","🔥","💥","❄️","🎉","🎊","✅","❌","⚠️",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface EmojiPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function EmojiPicker({ isOpen, onSelect, onClose, triggerRef }: EmojiPickerProps) {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Position calculation ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const panelWidth = 340;
    const panelHeight = 380;

    let top = rect.bottom + 6;
    let left = rect.left;

    // Keep within viewport
    if (left + panelWidth > window.innerWidth - 12) {
      left = window.innerWidth - panelWidth - 12;
    }
    if (left < 12) left = 12;
    if (top + panelHeight > window.innerHeight - 12) {
      top = rect.top - panelHeight - 6;
    }

    setPosition({ top, left });

    // Animate in
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

  // ── Focus search on open ──────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && inputRef.current) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ── Reset search on close ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setIsVisible(false);
    }
  }, [isOpen]);

  // ── Filtered emojis ───────────────────────────────────────────────────────

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return EMOJI_DATA;

    const query = search.toLowerCase().trim();
    return EMOJI_DATA.map((cat) => ({
      ...cat,
      emojis: cat.emojis.filter(() => {
        // Simple search: match category name
        return cat.name.toLowerCase().includes(query);
      }),
    })).filter((cat) => cat.emojis.length > 0);
  }, [search]);

  // ── Emoji click handler ───────────────────────────────────────────────────

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose]
  );

  // ── Don't render when closed ──────────────────────────────────────────────

  if (!isOpen || !position) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        "fixed z-[9999] w-[340px] rounded-xl border shadow-xl",
        "bg-white dark:bg-[#2F2F2F]",
        "border-[#e8e5e0] dark:border-[#ffffff14]",
        "flex flex-col overflow-hidden",
        "transition-all duration-150 ease-out",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-1 scale-[0.98]"
      )}
      style={{
        top: position.top,
        left: position.left,
        maxHeight: "min(380px, calc(100vh - 24px))",
      }}
    >
      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 h-8",
            "bg-[#f7f6f3] dark:bg-[#ffffff0a]",
            "border border-transparent",
            "focus-within:border-[#e3e2df] dark:focus-within:border-[#ffffff1a]",
            "focus-within:bg-white dark:focus-within:bg-[#ffffff0f]",
            "transition-colors duration-150"
          )}
        >
          <Search className="h-3.5 w-3.5 text-[#a9a9a7] dark:text-[#ffffff50] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "flex-1 bg-transparent border-none outline-none",
              "text-[13px] placeholder:text-[#b4b4b0] dark:placeholder:text-[#ffffff40]",
              "text-[#37352f] dark:text-[#ffffffcf]"
            )}
          />
        </div>
      </div>

      {/* ── Emoji Grid ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-3 pb-3",
          "scrollbar-thin scrollbar-thumb-[#e8e5e0] dark:scrollbar-thumb-[#ffffff14]"
        )}
        style={{ overflowY: "auto" }}
      >
        {filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <span className="text-xs text-[#b4b4b0] dark:text-[#ffffff40]">
              No emojis found
            </span>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="mb-1">
              {/* Category Header */}
              <div
                className={cn(
                  "sticky top-0 z-10 py-1.5 px-0.5",
                  "bg-white/95 dark:bg-[#2F2F2F]/95",
                  "backdrop-blur-sm"
                )}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#b4b4b0] dark:text-[#ffffff50]">
                  {category.name}
                </span>
              </div>

              {/* Emoji Grid */}
              <div className="grid grid-cols-8 gap-0.5">
                {category.emojis.map((emoji, i) => (
                  <button
                    key={`${category.name}-${i}`}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className={cn(
                      "flex items-center justify-center w-[36px] h-[36px]",
                      "rounded-md text-[20px] leading-none",
                      "hover:bg-[#f0efec] dark:hover:bg-[#ffffff14]",
                      "active:bg-[#e8e5e0] dark:active:bg-[#ffffff1f]",
                      "transition-colors duration-75",
                      "cursor-pointer select-none"
                    )}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}
