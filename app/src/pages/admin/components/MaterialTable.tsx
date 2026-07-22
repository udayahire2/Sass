"use client";

import { memo, useMemo, useState, useCallback } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { CheckCircle2, Clock3, Eye, FileText, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardFrame, CardFrameFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardStatusBadge } from "@/components/dashboard/dashboard-ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type StudyMaterial } from "@/services/study-service";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RejectionDialog } from "./RejectionDialog";
import { MaterialPreviewDrawer } from "./MaterialPreviewDrawer";

interface MaterialTableProps {
  materials: StudyMaterial[];
  showActions: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkReject?: (ids: string[], reason?: string) => void;
  onPageChange: (page: number) => void; // now required
  emptyMessage: string;
  emptyIcon: React.ElementType; // safer type
  page: number;   // 1‑based
  pageSize: number;
  total: number;
}

export function MaterialTable({
  materials,
  showActions,
  onApprove,
  onReject,
  onBulkApprove,
  onBulkReject,
  onPageChange,
  emptyMessage,
  emptyIcon: EmptyIcon,
  page: externalPage,
  pageSize,
  total,
}: MaterialTableProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [rejectingItem, setRejectingItem] = useState<{ id: string; title: string } | null>(null);
  const [isBulkRejecting, setIsBulkRejecting] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  // Controlled pagination: derive pageIndex from prop
  const pageIndex = externalPage - 1;

  const handlePaginationChange = useCallback(
    (updater: any) => {
      // We only need the new page index; ignore complex updaters for simplicity
      const nextPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPageChange(nextPagination.pageIndex + 1);
    },
    [pageIndex, pageSize, onPageChange]
  );

  // Urgency calculation (memoised per row to avoid Date.now() recalc issues)
  const getUrgencyBadge = useCallback(
    (createdAt: string, status: string) => {
      if (status !== "pending") return null;
      const hours =
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
      if (hours >= 72) {
        return (
          <Badge variant="destructive" className="ml-1.5 px-1 py-0 text-[9px] font-bold animate-pulse">
            <AlertTriangle className="mr-0.5 h-2.5 w-2.5" /> Critical
          </Badge>
        );
      }
      if (hours >= 48) {
        return (
          <Badge variant="warning" className="ml-1.5 px-1 py-0 text-[9px] font-semibold">
            Overdue
          </Badge>
        );
      }
      return null;
    },
    []
  );

  // Define columns – now includes all dependencies that affect the cell renders
  const columns = useMemo<ColumnDef<StudyMaterial>[]>(() => {
    const cols: ColumnDef<StudyMaterial>[] = [];

    if (showActions) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 40,
      });
    }

    cols.push(
      {
        accessorKey: "title",
        header: "Content",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span
              className="truncate text-sm font-medium hover:underline cursor-pointer"
              onClick={() => setPreviewMaterial(row.original)}
            >
              {row.original.title}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground capitalize">
              ({row.original.type})
            </span>
            {getUrgencyBadge(row.original.createdAt, row.original.status)}
          </div>
        ),
        size: 280,
      },
      {
        accessorKey: "author",
        header: "Author",
        cell: ({ row }) => (
          <span className="truncate block max-w-[120px]">
            {row.original.author}
          </span>
        ),
        size: 120,
        meta: { hideBelow: "sm" },
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <span className="truncate block max-w-[120px]">
            {row.original.subject}
          </span>
        ),
        size: 120,
        meta: { hideBelow: "md" },
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {new Date(row.original.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
        size: 100,
        meta: { hideBelow: "lg" },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <DashboardStatusBadge status={row.original.status} />
        ),
        size: 100,
      }
    );

    if (showActions) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewMaterial(row.original);
              }}
              title="Preview Material"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setRejectingItem({ id: row.original._id, title: row.original.title });
              }}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Reject ${row.original.title}`}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onApprove?.(row.original._id);
              }}
              className="text-primary hover:bg-primary/10"
              aria-label={`Approve ${row.original.title}`}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Approve
            </Button>
          </div>
        ),
        size: 180,
      });
    }

    return cols;
  }, [showActions, onApprove, getUrgencyBadge]); // stable dependencies

  const pageCount = Math.ceil(total / pageSize);

  const table = useReactTable({
    data: materials,
    columns,
    state: {
      sorting,
      pagination: { pageIndex, pageSize }, // fully controlled
      rowSelection,
    },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount,
    enableSortingRemoval: false,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedCount = selectedRows.length;

  const handleExecuteBulkApprove = () => {
    const ids = selectedRows.map((r) => r.original._id);
    onBulkApprove?.(ids);
    setRowSelection({});
  };

  const handleConfirmRejection = (reason: string) => {
    if (isBulkRejecting) {
      const ids = selectedRows.map((r) => r.original._id);
      onBulkReject?.(ids, reason);
      setRowSelection({});
      setIsBulkRejecting(false);
    } else if (rejectingItem) {
      onReject?.(rejectingItem.id, reason);
      setRejectingItem(null);
    }
  };

  if (materials.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-md border">
        {EmptyIcon && <EmptyIcon className="mb-2 h-10 w-10 text-muted-foreground" />}
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">
          Check back later or adjust your search filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea>
        <CardFrame className="w-full relative">
          <Table variant="card" className="table-fixed w-full p-2">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    const size = header.column.getSize();
                    const hideBelow = (header.column.columnDef.meta as any)
                      ?.hideBelow as string | undefined;

                    return (
                      <TableHead
                        key={header.id}
                        style={{ width: size ? `${size}px` : undefined }}
                        className={cn(
                          hideBelow && {
                            "hidden sm:table-cell": hideBelow === "sm",
                            "hidden md:table-cell": hideBelow === "md",
                            "hidden lg:table-cell": hideBelow === "lg",
                          }
                        )}
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
                            onClick={header.column.getToggleSortingHandler()}
                            role="button"
                            tabIndex={0}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <span className="shrink-0 opacity-50">
                              {{
                                asc: "↑",
                                desc: "↓",
                              }[header.column.getIsSorted() as string] ?? null}
                            </span>
                          </div>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "hover:bg-muted/40 cursor-pointer transition-colors",
                      row.getIsSelected() && "bg-muted/60"
                    )}
                    onClick={() => setPreviewMaterial(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const hideBelow = (cell.column.columnDef.meta as any)
                        ?.hideBelow as string | undefined;
                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            hideBelow && {
                              "hidden sm:table-cell": hideBelow === "sm",
                              "hidden md:table-cell": hideBelow === "md",
                              "hidden lg:table-cell": hideBelow === "lg",
                            }
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    No materials found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Floating Bulk Action Bar */}
          {selectedCount > 0 && showActions && (
            <div className="sticky bottom-3 left-4 right-4 mx-auto my-2 flex max-w-lg items-center justify-between gap-3 rounded-xl border bg-popover/95 p-3 shadow-xl backdrop-blur-md transition-all z-20">
              <span className="text-xs font-semibold px-2">
                {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setRowSelection({})}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="xs"
                  onClick={() => setIsBulkRejecting(true)}
                >
                  <XCircle className="mr-1 h-3.5 w-3.5" /> Reject ({selectedCount})
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={handleExecuteBulkApprove}
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve ({selectedCount})
                </Button>
              </div>
            </div>
          )}

          <CardFrameFooter className="p-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <p className="text-sm text-muted-foreground">Viewing</p>
                {/* Key forces re‑mount when total/pageCount changes, preventing stale selection */}
                <Select
                  key={`page-select-${pageCount}`}
                  items={Array.from({ length: pageCount }, (_, i) => {
                    const start = i * pageSize + 1;
                    const end = Math.min((i + 1) * pageSize, total);
                    const pageNum = i + 1;
                    return { label: `${start}-${end}`, value: pageNum };
                  })}
                  onValueChange={(value) => {
                    // Ensure numeric value
                    const pageNum = Number(value);
                    if (!isNaN(pageNum)) {
                      table.setPageIndex(pageNum - 1);
                    }
                  }}
                  value={pageIndex + 1}
                >
                  <SelectTrigger
                    aria-label="Select result range"
                    className="w-fit min-w-20"
                    size="sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {Array.from({ length: pageCount }, (_, i) => {
                      const start = i * pageSize + 1;
                      const end = Math.min((i + 1) * pageSize, total);
                      const pageNum = i + 1;
                      return (
                        <SelectItem key={pageNum} value={pageNum}>
                          {`${start}-${end}`}
                        </SelectItem>
                      );
                    })}
                  </SelectPopup>
                </Select>
                <p className="text-sm text-muted-foreground">
                  of{" "}
                  <strong className="font-medium text-foreground">{total}</strong>{" "}
                  results
                </p>
              </div>

              <Pagination className="justify-end">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="sm:*:[svg]:hidden"
                      render={
                        <Button
                          disabled={!table.getCanPreviousPage()}
                          onClick={() => table.previousPage()}
                          size="sm"
                          variant="outline"
                        />
                      }
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      className="sm:*:[svg]:hidden"
                      render={
                        <Button
                          disabled={!table.getCanNextPage()}
                          onClick={() => table.nextPage()}
                          size="sm"
                          variant="outline"
                        />
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardFrameFooter>
        </CardFrame>
      </ScrollArea>

      {/* Rejection Dialog */}
      <RejectionDialog
        open={!!rejectingItem || isBulkRejecting}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingItem(null);
            setIsBulkRejecting(false);
          }
        }}
        title={rejectingItem?.title}
        itemCount={isBulkRejecting ? selectedCount : 1}
        onConfirm={handleConfirmRejection}
      />

      {/* Material Preview Drawer */}
      <MaterialPreviewDrawer
        material={previewMaterial}
        open={!!previewMaterial}
        onOpenChange={(open) => {
          if (!open) setPreviewMaterial(null);
        }}
        onApprove={onApprove}
        onReject={(id) => {
          const mat = materials.find((m) => m._id === id);
          if (mat) {
            setRejectingItem({ id: mat._id, title: mat.title });
          }
        }}
      />
    </>
  );
}