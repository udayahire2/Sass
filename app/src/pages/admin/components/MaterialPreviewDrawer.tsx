import {
  Drawer,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerPanel,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, FileText, User, BookOpen, Calendar, HardDrive } from "lucide-react";
import { type StudyMaterial } from "@/services/study-service";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-ui";

interface MaterialPreviewDrawerProps {
  material: StudyMaterial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function MaterialPreviewDrawer({
  material,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: MaterialPreviewDrawerProps) {
  if (!material) return null;

  const isPending = material.status === "pending";

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "N/A";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <Drawer position="right" open={open} onOpenChange={onOpenChange}>
      <DrawerPopup showCloseButton>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase">
              {material.type}
            </Badge>
            <DashboardStatusBadge status={material.status} />
          </div>
          <DrawerTitle className="text-lg font-semibold mt-1">
            {material.title}
          </DrawerTitle>
          <DrawerDescription className="text-xs">
            Review submission details and content preview before taking action.
          </DrawerDescription>
        </DrawerHeader>

        <DrawerPanel className="space-y-6 text-sm">
          {/* Metadata Grid */}
          <div className="rounded-lg border p-3 space-y-3 bg-muted/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Author
              </span>
              <span className="font-medium text-foreground">{material.author}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Subject
              </span>
              <span className="font-medium text-foreground">{material.subject}</span>
            </div>
            {material.branch && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" /> Branch
                </span>
                <span className="font-medium text-foreground">{material.branch}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Submitted
              </span>
              <span className="font-medium text-foreground">
                {new Date(material.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5" /> File Size
              </span>
              <span className="font-medium text-foreground">
                {formatBytes(material.fileSize)}
              </span>
            </div>
          </div>

          {/* File Card Mock Preview */}
          <div className="rounded-lg border border-dashed p-4 text-center space-y-2 bg-card">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="text-xs font-medium truncate">{material.originalFilename || material.title}</p>
            {material.url ? (
              <Button
                variant="outline"
                size="xs"
                asChild
                className="mt-1"
              >
                <a href={material.url} target="_blank" rel="noreferrer">
                  Open File Document
                </a>
              </Button>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">No direct file URL available</p>
            )}
          </div>
        </DrawerPanel>

        <DrawerFooter variant="default">
          {isPending && (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onReject?.(material._id);
                  onOpenChange(false);
                }}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Reject
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onApprove?.(material._id);
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
              </Button>
            </div>
          )}
        </DrawerFooter>
      </DrawerPopup>
    </Drawer>
  );
}
