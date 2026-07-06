"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardFrame, CardFrameFooter } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Check,
  X,
  FileText,
  Video,
  File,
  Search,
  Clock,
  Eye,
  RefreshCw,
  Loader2,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchPendingMaterials,
  fetchApprovedMaterials,
  fetchRejectedMaterials,
  updateMaterialStatus,
  type StudyMaterial,
} from "@/services/study-service";
import { buildAssetUrl, fetchAssetBlobUrl } from "@/services/api";

const PAGE_SIZE = 10;

export default function ContentApprovalPage() {
  const [pendingRequests, setPendingRequests] = useState<StudyMaterial[]>([]);
  const [historyRequests, setHistoryRequests] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewingRequest, setViewingRequest] = useState<StudyMaterial | null>(
    null,
  );
  const [viewingFileUrl, setViewingFileUrl] = useState("");
  const [loadingViewingFile, setLoadingViewingFile] = useState(false);

  // --- Pagination states (client‑side) ---
  const [pendingPage, setPendingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // --- Load data ---
  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        fetchPendingMaterials(),
        fetchApprovedMaterials(),
        fetchRejectedMaterials(),
      ]);
      setPendingRequests(pending);
      setHistoryRequests([...approved, ...rejected]);
      // Reset pagination when data reloads
      setPendingPage(1);
      setHistoryPage(1);
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- File preview (unchanged) ---
  useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    setViewingFileUrl("");
    setLoadingViewingFile(false);

    if (!viewingRequest?.filePath || viewingRequest.url) {
      return () => undefined;
    }

    setLoadingViewingFile(true);
    const fileUrl = buildAssetUrl(viewingRequest.filePath, {
      studyMaterialId: viewingRequest.id || viewingRequest._id,
    });

    fetchAssetBlobUrl(fileUrl)
      .then((blobUrl) => {
        if (cancelled) {
          URL.revokeObjectURL(blobUrl);
          return;
        }
        objectUrl = blobUrl;
        setViewingFileUrl(blobUrl);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load file preview");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingViewingFile(false);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [viewingRequest]);

  // --- Action handlers ---
  const handleAction = async (id: string, action: "approve" | "reject") => {
    const status = action === "approve" ? "approved" : "rejected";
    const request = pendingRequests.find((r) => r._id === id);
    if (!request) return;

    // Optimistic update
    setPendingRequests((prev) => prev.filter((r) => r._id !== id));
    setHistoryRequests((prev) => [{ ...request, status }, ...prev]);

    const result = await updateMaterialStatus(id, status);
    if (result) {
      toast.success(`Content ${status} successfully!`);
    } else {
      toast.error(`Failed to ${action} content`);
      loadData(); // revert
    }
  };

  // --- Helpers (unchanged) ---
  const getTypeIcon = (type: string) => {
    switch ((type || "").toLowerCase()) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "ppt":
        return <File className="h-4 w-4 text-orange-500" />;
      case "docx":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "markdown":
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "notes":
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500 text-emerald-600 dark:text-emerald-400"
          >
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="border-red-500 text-red-600 dark:text-red-400"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600 dark:text-yellow-400"
          >
            Pending
          </Badge>
        );
    }
  };

  // --- Filtering ---
  const searchTerm = search.trim().toLowerCase();
  const matchesSearch = (r: StudyMaterial) =>
    !searchTerm ||
    [r.title, r.author, r.subject]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm));

  const filteredPending = useMemo(
    () => pendingRequests.filter(matchesSearch),
    [pendingRequests, searchTerm],
  );
  const filteredHistory = useMemo(
    () => historyRequests.filter(matchesSearch),
    [historyRequests, searchTerm],
  );

  // --- Pagination derived ---
  const pendingPageCount = Math.max(
    1,
    Math.ceil(filteredPending.length / PAGE_SIZE),
  );
  const historyPageCount = Math.max(
    1,
    Math.ceil(filteredHistory.length / PAGE_SIZE),
  );

  const paginatedPending = useMemo(() => {
    const start = (pendingPage - 1) * PAGE_SIZE;
    return filteredPending.slice(start, start + PAGE_SIZE);
  }, [filteredPending, pendingPage]);

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * PAGE_SIZE;
    return filteredHistory.slice(start, start + PAGE_SIZE);
  }, [filteredHistory, historyPage]);

  // --- Handlers for page changes ---
  const goToPendingPage = (page: number) => {
    if (page >= 1 && page <= pendingPageCount) setPendingPage(page);
  };
  const goToHistoryPage = (page: number) => {
    if (page >= 1 && page <= historyPageCount) setHistoryPage(page);
  };

  // --- Render table function (to reduce duplication) ---
  const renderTable = (
    data: StudyMaterial[],
    isPending: boolean,
    page: number,
    setPage: (p: number) => void,
    pageCount: number,
    totalItems: number,
  ) => (
    <CardFrame className="w-full">
      <div className="overflow-x-auto">
        <Table className="min-w-160 w-full">
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[30%] min-w-35">
                Content Details
              </TableHead>
              <TableHead className="w-[15%] min-w-25 hidden sm:table-cell">
                Author
              </TableHead>
              <TableHead className="w-[15%] min-w-25 hidden md:table-cell">
                Submitted
              </TableHead>
              <TableHead className="w-[12%] min-w-22.5">Status</TableHead>
              <TableHead className="w-[25%] min-w-40 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-64 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    {isPending ? (
                      <>
                        <Check className="h-8 w-8 opacity-50" />
                        <p>All caught up! No pending requests.</p>
                      </>
                    ) : (
                      <p>No history available.</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((req) => (
                <TableRow key={req._id} className="border-b hover:bg-muted/20">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-md bg-muted shrink-0">
                        {getTypeIcon(req.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{req.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {req.subject}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 hidden sm:table-cell">
                    <span className="truncate block max-w-30">
                      {req.author}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(req.status)}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingRequest(req)}
                        title="View Content"
                        aria-label={`View ${req.title}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction(req._id, "approve")}
                          >
                            <Check className="h-4 w-4 mr-1.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(req._id, "reject")}
                          >
                            <X className="h-4 w-4 mr-1.5" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {!loading && data.length > 0 && (
        <CardFrameFooter className="p-2 border-t">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <p className="text-sm text-muted-foreground">Viewing</p>
              <Select
                items={Array.from({ length: pageCount }, (_, i) => {
                  const start = i * PAGE_SIZE + 1;
                  const end = Math.min((i + 1) * PAGE_SIZE, totalItems);
                  const pageNum = i + 1;
                  return { label: `${start}-${end}`, value: pageNum };
                })}
                onValueChange={(value) => setPage(value as number)}
                value={page}
              >
                <SelectTrigger
                  aria-label="Select result range"
                  className="w-fit min-w-15"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {Array.from({ length: pageCount }, (_, i) => {
                    const start = i * PAGE_SIZE + 1;
                    const end = Math.min((i + 1) * PAGE_SIZE, totalItems);
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
                <strong className="font-medium text-foreground">
                  {totalItems}
                </strong>{" "}
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
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
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
                        disabled={page === pageCount}
                        onClick={() => setPage(page + 1)}
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
      )}
    </CardFrame>
  );

  // --- Main JSX ---
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Content Approvals
          </h1>
          <p className="text-muted-foreground text-sm">
            Verify and manage student study material submissions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">Review History</TabsTrigger>
          </TabsList>
          <InputGroup className="w-full sm:w-72">
            <InputGroupAddon>
              <Search
                aria-hidden="true"
                className="h-4 w-4 text-muted-foreground"
              />
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                // Reset pagination on search
                setPendingPage(1);
                setHistoryPage(1);
              }}
            />
          </InputGroup>
        </div>

        <TabsContent value="pending" className="mt-0">
          {renderTable(
            paginatedPending,
            true,
            pendingPage,
            goToPendingPage,
            pendingPageCount,
            filteredPending.length,
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          {renderTable(
            paginatedHistory,
            false,
            historyPage,
            goToHistoryPage,
            historyPageCount,
            filteredHistory.length,
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog (unchanged) */}
      <Dialog
        open={!!viewingRequest}
        onOpenChange={(open) => !open && setViewingRequest(null)}
      >
        <DialogContent className="max-h-[90vh] w-[90vw] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-muted">
                {viewingRequest && getTypeIcon(viewingRequest.type)}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold">
                  {viewingRequest?.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {viewingRequest?.subject} | {viewingRequest?.author}
                </p>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-[60vh] bg-muted/20 flex items-center justify-center">
            {loadingViewingFile ? (
              <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Loading file...
              </div>
            ) : viewingRequest?.type?.toLowerCase() === "video" ? (
              <iframe
                src={viewingRequest?.url || viewingFileUrl}
                className="w-full h-[60vh]"
                title={viewingRequest?.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : ["pdf", "markdown"].includes(
                viewingRequest?.type?.toLowerCase() || "",
              ) ? (
              <iframe
                src={viewingRequest?.url || viewingFileUrl}
                className="w-full h-[80vh]"
                title={viewingRequest?.title}
              />
            ) : (
              <div className="text-center p-10">
                <p className="text-muted-foreground">Preview Not Available</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {viewingRequest?.originalFilename ||
                    "Open the uploaded file to verify it."}
                </p>
                {(viewingRequest?.url || viewingFileUrl) && (
                  <Button variant="outline" className="mt-4">
                    <a
                      href={viewingRequest?.url || viewingFileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" /> Open Link
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
