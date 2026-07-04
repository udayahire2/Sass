import { memo } from "react";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DashboardEmptyState, DashboardStatusBadge } from "@/components/dashboard/dashboard-ui";
import { type StudyMaterial } from "@/services/study-service";
import { cn } from "@/lib/utils";

export function MaterialTable({
  materials,
  showActions,
  onApprove,
  onReject,
  onPageChange,
  emptyMessage,
  emptyIcon: EmptyIcon,
  page,
  pageSize,
  total,
}: {
  materials: StudyMaterial[];
  showActions: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPageChange?: (page: number) => void;
  emptyMessage: string;
  emptyIcon: typeof Clock3;
  page: number;
  pageSize: number;
  total: number;
}) {
  if (materials.length === 0) {
    return (
      <DashboardEmptyState
        title={emptyMessage}
        description="Check back later or adjust your search filter."
        icon={EmptyIcon}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <ScrollArea
        className="h-[400px]"
        scrollbarGutter
      >
        <Table className="table-fixed w-full min-w-[850px]">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[30%] min-w-[200px]">
                Content
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[120px]">
                Author
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[120px]">
                Subject
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[100px]">
                Submitted
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[10%] min-w-[100px]">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[180px]">
                {showActions ? "Actions" : ""}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <MaterialRow
                key={material._id}
                material={material}
                onApprove={onApprove}
                onReject={onReject}
                showActions={showActions}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>

      {total > pageSize && (
        <Pagination className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {`${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
          </span>
          <PaginationContent className="flex items-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                render={<button />}
                onClick={() => onPageChange?.(Math.max(1, page - 1))}
                disabled={page === 1}
                className={cn(
                  "h-7 px-2 text-xs",
                  page === 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 tabular-nums text-xs">
                {page} / {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                render={<button />}
                onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className={cn(
                  "h-7 px-2 text-xs",
                  page === pageCount && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

const MaterialRow = memo(function MaterialRow({
  material,
  onApprove,
  onReject,
  showActions,
}: {
  material: StudyMaterial;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions: boolean;
}) {
  return (
    <TableRow className="border-b hover:bg-muted/20">
      <TableCell className="py-2.5 truncate max-w-[200px]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{material.title}</span>
          <span className="ml-1 text-xs text-muted-foreground capitalize shrink-0">
            ({material.type})
          </span>
        </div>
      </TableCell>
      <TableCell className="py-2.5 text-sm truncate max-w-[120px]">
        {material.author}
      </TableCell>
      <TableCell className="py-2.5 text-sm truncate max-w-[120px]">
        {material.subject}
      </TableCell>
      <TableCell className="py-2.5 text-sm text-muted-foreground">
        {new Date(material.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </TableCell>
      <TableCell className="py-2.5">
        <DashboardStatusBadge status={material.status} />
      </TableCell>
      <TableCell className="py-2.5 text-right w-[15%] min-w-[180px]">
        {showActions && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onReject?.(material._id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onApprove?.(material._id)}
              className="text-primary hover:bg-primary/10"
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});
