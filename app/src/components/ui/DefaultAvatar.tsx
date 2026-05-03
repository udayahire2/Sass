import { cn } from "@/lib/utils";

interface DefaultAvatarProps {
  name?: string;
  size?: number;
  className?: string;
}

const COLORS = [
  "#5C6BC0",
  "#26A69A",
  "#EF5350",
  "#AB47BC",
  "#FF7043",
  "#29B6F6",
  "#66BB6A",
  "#FFA726",
];

export function DefaultAvatar({
  name = "",
  size = 40,
  className,
}: DefaultAvatarProps) {
  const getInitials = (str: string) => {
    const words = str.trim().split(/\s+/);
    if (!words.length || !words[0]) return "U";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  const getColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash += str.charCodeAt(i);
    }
    return COLORS[hash % COLORS.length];
  };

  const initials = getInitials(name);
  const bgColor = getColor(name);
  const fontSize = Math.max(10, size * 0.4);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        color: "#ffffff",
        fontSize: `${fontSize}px`,
        userSelect: "none",
        lineHeight: 1,
      }}
    >
      {initials}
    </div>
  );
}
