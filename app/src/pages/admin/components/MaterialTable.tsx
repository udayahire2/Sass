"use client";

import { memo, useMemo, useState } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardFrame, CardFrameFooter } from "@/components/ui/card";
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

// ========== Types ==========
interface MaterialTableProps {
  materials: StudyMaterial[];
  showActions: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPageChange?: (page: number) => void; // kept for external sync if needed
  emptyMessage: string;
  emptyIcon: typeof Clock3;
  page: number;
  pageSize: number;
  total: number;
}

// ========== Component ==========
export function MaterialTable({
  materials,
  showActions,
  onApprove,
  onReject,
  onPageChange,
  emptyMessage,
  emptyIcon: EmptyIcon,
  page: externalPage,
  pageSize,
  total,
}: MaterialTableProps) {
  // ---- Empty state early return ----
  if (materials.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-md border">
        <EmptyIcon className="mb-2 h-10 w-10 text-muted-foreground" />
        <h3 className="text-lg font-medium">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground">
          Check back later or adjust your search filter.
        </p>
      </div>
    );
  }

  // ---- TanStack Table setup ----
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true }, // default sort by newest
  ]);

  // Internal pagination state (sync with external `page`)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: externalPage - 1, // convert 1‑based to 0‑based
    pageSize,
  });

  // Update external page when internal pagination changes
  const handlePaginationChange = (updater: any) => {
    const newPagination =
      typeof updater === "function" ? updater(pagination) : updater;
    setPagination(newPagination);
    if (onPageChange) {
      onPageChange(newPagination.pageIndex + 1);
    }
  };

  // Define columns with responsive visibility
  const columns = useMemo<ColumnDef<StudyMaterial>[]>(() => {
    const cols: ColumnDef<StudyMaterial>[] = [
      {
        accessorKey: "title",
        header: "Content",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate text-sm font-medium">
              {row.original.title}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground capitalize">
              ({row.original.type})
            </span>
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
        meta: { hideBelow: "sm" }, // custom meta for responsive
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
          <span className="text-sm text-muted-foreground">
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
      },
    ];

    if (showActions) {
      cols.push({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onReject?.(row.original._id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Reject ${row.original.title}`}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onApprove?.(row.original._id)}
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
  }, [showActions, onApprove, onReject]);

  const table = useReactTable({
    data: materials,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, // we handle pagination externally (total, page)
    pageCount: Math.ceil(total / pageSize),
    enableSortingRemoval: false,
  });

  // ---- Render ----
  return (
    <ScrollArea>
    <CardFrame className="w-full">
      <Table variant="card" className="table-fixed w-full min-w-[640px]">
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            header.column.getToggleSortingHandler()?.(e);
                          }
                        }}
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
              <TableRow key={row.id}>
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
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={columns.length}
              >
                No materials found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <CardFrameFooter className="p-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Viewing range selector */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <p className="text-sm text-muted-foreground">Viewing</p>
            <Select
              items={Array.from({ length: table.getPageCount() }, (_, i) => {
                const start = i * pageSize + 1;
                const end = Math.min((i + 1) * pageSize, total);
                const pageNum = i + 1;
                return { label: `${start}-${end}`, value: pageNum };
              })}
              onValueChange={(value) => {
                const pageNum = value as number;
                table.setPageIndex(pageNum - 1);
              }}
              value={table.getState().pagination.pageIndex + 1}
            >
              <SelectTrigger
                aria-label="Select result range"
                className="w-fit min-w-[60px]"
                size="sm"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {Array.from({ length: table.getPageCount() }, (_, i) => {
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

          {/* Pagination buttons */}
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
  );
}