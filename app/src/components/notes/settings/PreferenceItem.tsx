import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PreferenceItemProps } from "./types";

export function PreferenceItem({
  id,
  label,
  checked,
  onChange,
}: PreferenceItemProps) {
  return (
    <div className="flex items-center gap-3 hover:bg-accent/40 p-2 -mx-2 rounded-md transition-colors">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(c) => onChange(!!c)}
      />
      <Label htmlFor={id} className="font-normal text-sm cursor-pointer flex-1">
        {label}
      </Label>
    </div>
  );
}