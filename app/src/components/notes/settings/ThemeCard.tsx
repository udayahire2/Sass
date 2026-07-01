import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { ThemeCardProps } from "./types";

export function ThemeCard({ id, value, label }: ThemeCardProps) {
  return (
    <div className="relative flex items-center gap-3 border p-3 rounded-lg cursor-pointer hover:border-primary/50 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
      <RadioGroupItem value={value} id={id} />
      <Label
        htmlFor={id}
        className="font-normal text-sm cursor-pointer flex-1 before:absolute before:inset-0"
      >
        {label}
      </Label>
    </div>
  );
}