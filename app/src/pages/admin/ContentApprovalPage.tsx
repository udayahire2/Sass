"use client";

import { useState, useEffect } from "react";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import { buildAssetUrl } from "@/services/api";

export default function ContentApprovalPage() {
    const [pendingRequests, setPendingRequests] = useState<StudyMaterial[]>([]);
    const [historyRequests, setHistoryRequests] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewingRequest, setViewingRequest] = useState<StudyMaterial | null>(null);

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
        } catch {
            toast.error("Failed to load requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

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
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400">
                        Approved
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="outline" className="border-red-500 text-red-600 dark:text-red-400">
                        Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
                        Pending
                    </Badge>
                );
        }
    };

    const searchTerm = search.trim().toLowerCase();
    const matchesSearch = (r: StudyMaterial) =>
        !searchTerm ||
        [r.title, r.author, r.subject]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(searchTerm));

    const filteredPending = pendingRequests.filter(matchesSearch);
    const filteredHistory = historyRequests.filter(matchesSearch);
    const viewingType = viewingRequest?.type.toLowerCase() || "";
    const viewingUrl = viewingRequest?.url || (viewingRequest?.filePath ? buildAssetUrl(viewingRequest.filePath) : "");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Content Approvals</h1>
                    <p className="text-muted-foreground text-sm">
                        Verify and manage student study material submissions.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
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
                            <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                            type="search"
                            placeholder="Search requests..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                </div>

                <TabsContent value="pending" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Submissions</CardTitle>
                            <CardDescription>Review and take action on new content uploads.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                            <Table className="min-w-[880px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Content Details</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredPending.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Check className="h-8 w-8 opacity-50" />
                                                    <p>All caught up! No pending requests.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPending.map((req) => (
                                            <TableRow key={req._id}>
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-md bg-muted">
                                                            {getTypeIcon(req.type)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium">{req.title}</p>
                                                            <p className="text-xs text-muted-foreground">{req.subject}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{req.author}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(req.createdAt).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(req.status)}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setViewingRequest(req)}
                                                            title="View Content"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                                            onClick={() => handleAction(req._id, "approve")}
                                                        >
                                                            <Check className="h-4 w-4 mr-1.5" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                            onClick={() => handleAction(req._id, "reject")}
                                                        >
                                                            <X className="h-4 w-4 mr-1.5" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>Review History</CardTitle>
                            <CardDescription>Recently approved and rejected content.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                            <Table className="min-w-[720px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Content Details</TableHead>
                                        <TableHead>Author</TableHead>
                                        <TableHead>Status</TableHead>
                                                <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-64 text-center">
                                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredHistory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-64 text-center text-muted-foreground">
                                                No history available.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredHistory.map((req) => (
                                            <TableRow key={req._id}>
                                                <TableCell className="pl-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-md bg-muted">
                                                            {getTypeIcon(req.type)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium">{req.title}</p>
                                                            <p className="text-xs text-muted-foreground">{req.subject}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{req.author}</TableCell>
                                                <TableCell>{getStatusBadge(req.status)}</TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setViewingRequest(req)}
                                                        title="View Content"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Preview Dialog */}
            <Dialog open={!!viewingRequest} onOpenChange={(open) => !open && setViewingRequest(null)}>
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
                        {viewingType === "video" ? (
                            <iframe
                                src={viewingUrl}
                                className="w-full h-[60vh]"
                                title={viewingRequest?.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : ["pdf", "markdown"].includes(viewingType) ? (
                            <iframe
                                src={viewingUrl}
                                className="w-full h-[80vh]"
                                title={viewingRequest?.title}
                            />
                        ) : (
                            <div className="text-center p-10">
                                <p className="text-muted-foreground">Preview Not Available</p>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {viewingRequest?.originalFilename || "Open the uploaded file to verify it."}
                                </p>
                                {viewingUrl && (
                                    <Button variant="outline" className="mt-4" asChild>
                                        <a
                                            href={viewingUrl}
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
