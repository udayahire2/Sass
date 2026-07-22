import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  itemCount?: number;
  onConfirm: (reason: string) => void;
}

const PRESET_REASONS = [
  "Inappropriate content",
  "Incomplete / Low quality",
  "Duplicate submission",
  "Incorrect subject/branch",
  "Copyright issues",
];

export function RejectionDialog({
  open,
  onOpenChange,
  title,
  itemCount = 1,
  onConfirm,
}: RejectionDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  const handleConfirm = () => {
    const finalReason = customReason.trim() || selectedReason || "Submission rejected by admin";
    onConfirm(finalReason);
    onOpenChange(false);
    setSelectedReason("");
    setCustomReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Submission</DialogTitle>
          <DialogDescription>
            {itemCount > 1
              ? `Provide a reason for rejecting ${itemCount} selected materials.`
              : `Specify why "${title || "this item"}" is being rejected.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 text-sm">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
              Quick Reasons
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <Badge
                    key={reason}
                    variant={isSelected ? "destructive" : "outline"}
                    className="cursor-pointer text-xs py-1 px-2.5 transition-colors hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedReason(isSelected ? "" : reason);
                      if (!isSelected) setCustomReason("");
                    }}
                  >
                    {reason}
                  </Badge>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="custom-reason-input" className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
              Custom Reason (Optional)
            </label>
            <textarea
              id="custom-reason-input"
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Provide specific feedback for the uploader..."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter variant="default">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
