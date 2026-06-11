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

const EMOJI_KEYWORDS: Record<string, string[]> = {
  // People
  "😀": ["smile", "happy", "grin", "face", "joy"],
  "😃": ["smile", "happy", "grin", "face", "joy"],
  "😄": ["smile", "happy", "grin", "face", "joy"],
  "😁": ["smile", "happy", "grin", "face", "joy", "teeth"],
  "😆": ["smile", "happy", "grin", "face", "laugh", "squint"],
  "😅": ["smile", "happy", "grin", "face", "sweat", "relief"],
  "🤣": ["laugh", "rofl", "rolling", "floor", "face", "funny"],
  "😂": ["laugh", "tear", "joy", "face", "funny", "haha"],
  "🙂": ["smile", "happy", "slight", "face"],
  "😊": ["smile", "happy", "blush", "face", "warm"],
  "😇": ["angel", "halo", "innocent", "face", "good"],
  "🥰": ["love", "hearts", "adore", "affection", "face", "warm"],
  "😍": ["love", "hearts", "heart-eyes", "adore", "face"],
  "🤩": ["star-struck", "excited", "wow", "face", "star"],
  "😘": ["kiss", "heart", "love", "blow-kiss", "face"],
  "😗": ["kiss", "whistle", "face"],
  "😋": ["yummy", "delicious", "tongue", "face", "food"],
  "😛": ["tongue", "silly", "face"],
  "😜": ["tongue", "wink", "silly", "face"],
  "🤪": ["zany", "crazy", "goofy", "silly", "face"],
  "😎": ["cool", "sunglasses", "chill", "face"],
  "🤓": ["nerd", "glasses", "geek", "smart", "face"],
  "🧐": ["monocle", "inspect", "smart", "face", "skeptical"],
  "😏": ["smirk", "sly", "suggestive", "face"],
  "🥳": ["party", "celebrate", "birthday", "horn", "hat", "face"],
  "😤": ["triumph", "steam", "nose", "proud", "angry", "face"],
  "😠": ["angry", "mad", "face", "annoyed"],
  "🥺": ["pleading", "begging", "sad", "puppy", "eyes", "face"],
  "😢": ["crying", "sad", "tear", "face"],
  "😭": ["crying", "sad", "tear", "sob", "loud", "face"],

  // Nature
  "🐶": ["dog", "puppy", "animal", "pet", "bark"],
  "🐱": ["cat", "kitten", "animal", "pet", "meow"],
  "🐭": ["mouse", "rat", "animal", "pet"],
  "🐹": ["hamster", "animal", "pet"],
  "🐰": ["rabbit", "bunny", "animal", "pet"],
  "🦊": ["fox", "animal", "wild"],
  "🐻": ["bear", "animal", "wild"],
  "🐼": ["panda", "animal", "china"],
  "🐨": ["koala", "animal", "australia"],
  "🐯": ["tiger", "animal", "wild", "cat"],
  "🦁": ["lion", "animal", "wild", "king"],
  "🐮": ["cow", "animal", "farm"],
  "🐷": ["pig", "animal", "farm"],
  "🐸": ["frog", "animal", "amphibian", "jump"],
  "🐵": ["monkey", "animal", "ape"],
  "🐔": ["chicken", "bird", "farm", "rooster"],
  "🐧": ["penguin", "bird", "antarctica", "cold"],
  "🐦": ["bird", "animal", "fly"],
  "🦅": ["eagle", "bird", "wild", "predator", "usa"],
  "🦋": ["butterfly", "insect", "pretty", "fly"],
  "🐛": ["bug", "caterpillar", "insect", "worm"],
  "🐝": ["bee", "insect", "honey", "buzz"],
  "🌸": ["flower", "cherry", "blossom", "pink", "plant", "spring"],
  "🌺": ["flower", "hibiscus", "tropical", "plant"],
  "🌻": ["flower", "sunflower", "yellow", "plant"],
  "🌹": ["flower", "rose", "red", "love", "plant"],
  "🌲": ["tree", "pine", "forest", "evergreen", "plant"],
  "🌴": ["tree", "palm", "beach", "tropical", "plant"],
  "🍀": ["clover", "four-leaf", "luck", "green", "irish"],
  "🌈": ["rainbow", "sky", "color", "nature"],

  // Food
  "🍎": ["apple", "red", "fruit", "healthy"],
  "🍊": ["tangerine", "orange", "fruit", "citrus"],
  "🍋": ["lemon", "yellow", "fruit", "citrus", "sour"],
  "🍌": ["banana", "yellow", "fruit"],
  "🍉": ["watermelon", "fruit", "summer"],
  "🍇": ["grapes", "fruit", "purple"],
  "🍓": ["strawberry", "red", "fruit", "berry"],
  "🫐": ["blueberries", "fruit", "berry", "blue"],
  "🍑": ["peach", "fruit", "orange"],
  "🥭": ["mango", "fruit", "tropical"],
  "🍍": ["pineapple", "fruit", "tropical"],
  "🥝": ["kiwi", "fruit"],
  "🍔": ["hamburger", "burger", "fast-food", "meat"],
  "🍕": ["pizza", "cheese", "fast-food", "slice"],
  "🌮": ["taco", "mexican", "fast-food"],
  "🍣": ["sushi", "japanese", "fish", "rice"],
  "🍜": ["ramen", "noodles", "japanese", "soup"],
  "🍩": ["donut", "sweet", "dessert"],
  "🍪": ["cookie", "sweet", "dessert", "chocolate"],
  "🎂": ["cake", "birthday", "sweet", "dessert", "candle"],
  "🍰": ["shortcake", "cake", "sweet", "dessert", "slice"],
  "🧁": ["cupcake", "sweet", "dessert"],
  "🍫": ["chocolate", "bar", "sweet", "dessert"],
  "🍿": ["popcorn", "movie", "snack"],
  "☕": ["coffee", "tea", "hot", "drink", "cafe", "mug"],
  "🍵": ["tea", "green", "hot", "drink", "matcha"],
  "🧃": ["juice", "drink", "box"],
  "🥤": ["soda", "drink", "cup", "straw"],
  "🍺": ["beer", "drink", "alcohol", "mug"],
  "🍷": ["wine", "drink", "alcohol", "glass"],

  // Activities
  "⚽": ["soccer", "football", "ball", "sport", "game"],
  "🏀": ["basketball", "ball", "sport", "game"],
  "🏈": ["football", "ball", "sport", "game", "usa"],
  "⚾": ["baseball", "ball", "sport", "game"],
  "🎾": ["tennis", "ball", "sport", "game"],
  "🏐": ["volleyball", "ball", "sport", "game"],
  "🏉": ["rugby", "ball", "sport", "game"],
  "🎱": ["billiards", "pool", "8-ball", "game"],
  "🏓": ["ping-pong", "table-tennis", "sport", "game"],
  "🏸": ["badminton", "sport", "game"],
  "🥊": ["boxing", "glove", "sport", "fight"],
  "🎯": ["bullseye", "target", "dart", "game", "direct"],
  "🎮": ["video-game", "controller", "play", "gaming"],
  "🕹️": ["joystick", "play", "gaming"],
  "🎲": ["die", "dice", "game", "random"],
  "🧩": ["puzzle", "piece", "game"],
  "🎭": ["performing-arts", "theater", "drama", "masks"],
  "🎨": ["artist-palette", "paint", "art", "drawing"],
  "🎬": ["clapperboard", "movie", "film", "cinema"],
  "🎤": ["microphone", "sing", "music", "audio"],
  "🎧": ["headphone", "music", "listen", "audio"],
  "🎵": ["musical-note", "music", "sound"],
  "🎹": ["keyboard", "piano", "music", "instrument"],
  "🥁": ["drum", "music", "instrument", "beat"],
  "🎷": ["saxophone", "music", "instrument", "jazz"],
  "🎺": ["trumpet", "music", "instrument"],
  "🎸": ["guitar", "music", "instrument", "rock"],
  "🪗": ["accordion", "music", "instrument"],
  "🏆": ["trophy", "winner", "prize", "award", "gold"],
  "🥇": ["medal", "gold", "winner", "prize", "award"],

  // Travel
  "🚗": ["car", "automobile", "drive", "vehicle", "red"],
  "🚕": ["taxi", "cab", "drive", "vehicle", "yellow"],
  "🚌": ["bus", "drive", "vehicle", "yellow"],
  "🏎️": ["race-car", "drive", "vehicle", "fast"],
  "🚓": ["police-car", "drive", "vehicle", "cop"],
  "🚑": ["ambulance", "vehicle", "hospital", "emergency"],
  "🚒": ["fire-engine", "truck", "vehicle", "emergency", "fire"],
  "🚐": ["minibus", "vehicle"],
  "🛻": ["pickup", "truck", "vehicle"],
  "🚚": ["delivery-truck", "vehicle"],
  "✈️": ["airplane", "flight", "plane", "travel", "fly"],
  "🚀": ["rocket", "space", "launch", "fly", "fast"],
  "🛸": ["ufo", "alien", "space"],
  "🚁": ["helicopter", "fly", "vehicle"],
  "⛵": ["sailboat", "boat", "water", "sea"],
  "🚢": ["ship", "boat", "water", "sea", "cruise"],
  "🏠": ["house", "home", "building"],
  "🏡": ["house-with-garden", "home", "building"],
  "🏢": ["office-building", "building", "work"],
  "🏰": ["castle", "palace", "building"],
  "🗼": ["tokyo-tower", "building", "japan"],
  "🗽": ["statue-of-liberty", "monument", "usa"],
  "⛩️": ["shinto-shrine", "temple", "japan"],
  "🕌": ["mosque", "temple", "religion"],
  "🌍": ["globe-europe-africa", "earth", "world", "map", "space"],
  "🌎": ["globe-americas", "earth", "world", "map", "space"],
  "🌏": ["globe-asia-australia", "earth", "world", "map", "space"],
  "🗺️": ["world-map", "travel", "map"],
  "🏔️": ["mountain", "snow", "nature", "cold"],
  "🌋": ["volcano", "nature", "hot", "fire"],

  // Objects
  "💡": ["light-bulb", "idea", "smart", "electricity"],
  "🔦": ["flashlight", "light", "dark"],
  "📱": ["mobile-phone", "smartphone", "tech", "call"],
  "💻": ["laptop", "computer", "tech", "work", "code"],
  "⌨️": ["keyboard", "computer", "tech", "type"],
  "🖥️": ["desktop-computer", "computer", "tech", "work"],
  "🖨️": ["printer", "tech", "paper"],
  "📷": ["camera", "photo", "picture", "lens"],
  "📹": ["video-camera", "movie", "film"],
  "🎥": ["movie-camera", "movie", "film", "cinema"],
  "📺": ["television", "tv", "screen"],
  "📻": ["radio", "music", "news"],
  "⏰": ["alarm-clock", "time", "wake"],
  "🕰️": ["mantelpiece-clock", "time"],
  "📡": ["satellite-dish", "space", "signal"],
  "🔋": ["battery", "power", "energy"],
  "💾": ["floppy-disk", "save", "computer"],
  "💿": ["optical-disk", "cd", "dvd", "computer", "music"],
  "📀": ["dvd", "movie", "computer"],
  "📚": ["books", "read", "study", "library", "school", "education"],
  "📖": ["open-book", "read", "study", "library", "school", "education"],
  "✏️": ["pencil", "write", "draw", "school"],
  "🖊️": ["pen", "write", "draw", "school"],
  "📝": ["memo", "note", "write", "paper"],
  "📌": ["pushpin", "pin", "note", "board"],
  "📎": ["paperclip", "clip", "office"],
  "🔑": ["key", "lock", "unlock", "door"],
  "🔒": ["locked", "lock", "security", "safe"],
  "🔓": ["unlocked", "lock", "security", "safe"],
  "🔧": ["wrench", "tool", "fix", "repair"],

  // Symbols
  "❤️": ["heart", "red-heart", "love", "like"],
  "🧡": ["heart", "orange-heart", "love", "like"],
  "💛": ["heart", "yellow-heart", "love", "like"],
  "💚": ["heart", "green-heart", "love", "like"],
  "💙": ["heart", "blue-heart", "love", "like"],
  "💜": ["heart", "purple-heart", "love", "like"],
  "🖤": ["heart", "black-heart", "love", "like"],
  "🤍": ["heart", "white-heart", "love", "like"],
  "🤎": ["heart", "brown-heart", "love", "like"],
  "💔": ["broken-heart", "sad", "love"],
  "❣️": ["heart-exclamation", "love"],
  "💕": ["two-hearts", "love"],
  "💞": ["revolving-hearts", "love"],
  "💓": ["beating-heart", "love"],
  "💗": ["growing-heart", "love"],
  "💖": ["sparkling-heart", "love", "sparkle"],
  "💘": ["heart-arrow", "love", "cupid"],
  "💝": ["heart-ribbon", "love", "gift"],
  "⭐": ["star", "yellow-star", "gold", "favorite"],
  "🌟": ["glowing-star", "gold", "favorite", "sparkle"],
  "✨": ["sparkles", "magic", "pretty", "shine"],
  "⚡": ["high-voltage", "lightning", "electricity", "power", "fast"],
  "🔥": ["fire", "hot", "flame", "burn", "cool"],
  "💥": ["collision", "explosion", "bang"],
  "❄️": ["snowflake", "cold", "snow", "winter"],
  "🎉": ["party-popper", "celebrate", "congratulations", "confetti"],
  "🎊": ["confetti-ball", "celebrate", "congratulations"],
  "✅": ["check-mark", "done", "yes", "correct", "success"],
  "❌": ["cross-mark", "no", "incorrect", "wrong", "cancel"],
  "⚠️": ["warning", "alert", "danger", "caution"]
};

// ─── Component ────────────────────────────────────────────────────────────────

interface EmojiPickerProps {
  isOpen: boolean;
  onSelect: (emoji: string) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  theme?: string;
}

export function EmojiPicker({ isOpen, onSelect, onClose, triggerRef, theme }: EmojiPickerProps) {
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
      emojis: cat.emojis.filter((emoji) => {
        const keywords = EMOJI_KEYWORDS[emoji] || [];
        return (
          cat.name.toLowerCase().includes(query) ||
          emoji.includes(query) ||
          keywords.some((k) => k.includes(query))
        );
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
        "fixed z-[9999] w-[340px] rounded-xl border shadow-xl flex flex-col overflow-hidden transition-all duration-150 ease-out",
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
        maxHeight: "min(380px, calc(100vh - 24px))",
      }}
    >
      {/* ── Search Bar ─────────────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 h-8",
            "bg-muted/50 border border-border/40",
            "focus-within:border-primary/40 focus-within:bg-background",
            "transition-colors duration-150"
          )}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[13px] placeholder:text-muted-foreground/45 text-foreground"
          />
        </div>
      </div>

      {/* ── Emoji Grid ─────────────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-3 notion-sidebar-scroll"
        style={{ overflowY: "auto" }}
      >
        {filteredCategories.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <span className="text-xs text-muted-foreground/50">
              No emojis found
            </span>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.name} className="mb-1">
              {/* Category Header */}
              <div
                className="sticky top-0 z-10 py-1.5 px-0.5 bg-background/95 backdrop-blur-sm"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
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
                      "hover:bg-sidebar-accent active:bg-sidebar-accent/80",
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
