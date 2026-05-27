import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemMenuButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  destructive?: boolean;
}

export function ItemMenuButton({
  icon: Icon,
  label,
  onClick,
  destructive,
}: ItemMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-[12px] transition-colors",
        destructive
          ? "text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
          : "text-foreground/70 hover:bg-muted/60"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
