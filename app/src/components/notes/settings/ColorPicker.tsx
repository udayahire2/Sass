import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ColorPickerProps } from "./types";

export function ColorPicker({ id, value, className, ring, isSelected }: ColorPickerProps) {
  return (
    <div className="group flex flex-col items-center gap-1.5">
      <RadioGroupItem value={value} id={id} className="sr-only" />
      <Label htmlFor={id} className="cursor-pointer">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center group-hover:scale-110",
            className,
            isSelected ? `ring-2 ring-offset-2 ring-offset-background ${ring}` : "border-transparent"
          )}
        >
          {isSelected && (
            <Check className={cn("w-4 h-4", value === "default" ? "text-background" : "text-white")} />
          )}
        </div>
      </Label>
    </div>
  );
}
