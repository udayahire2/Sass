import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { Check, X, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, getErrorMessage } from "@/services/api";

const FACULTY_PAGE_SIZE = 50;

interface Faculty {
    _id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    collegeName: string;
    subjects: string[];
    isApproved: boolean;
    avatar?: string;
}

export default function FacultyManager() {
    const [pendingFaculty, setPendingFaculty] = useState<Faculty[]>([]);
    const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pendingPage, setPendingPage] = useState(1);
    const [allPage, setAllPage] = useState(1);
    const [pendingTotal, setPendingTotal] = useState(0);
    const [allTotal, setAllTotal] = useState(0);

    const fetchFaculty = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const pendingParams = new URLSearchParams({
                page: String(pendingPage),
                pageSize: String(FACULTY_PAGE_SIZE),
            });
            const allParams = new URLSearchParams({
                page: String(allPage),
                pageSize: String(FACULTY_PAGE_SIZE),
            });
            const [pendingRes, allRes] = await Promise.all([
                fetch(buildApiUrl(`/admin/faculty/pending?${pendingParams.toString()}`), {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(buildApiUrl(`/admin/faculty/all?${allParams.toString()}`), {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const pendingData = await pendingRes.json();
            const allData = await allRes.json();

            if (!pendingRes.ok || pendingData.success === false) {
                throw new Error(getErrorMessage(pendingData, "Failed to load pending faculty"));
            }

            if (!allRes.ok || allData.success === false) {
                throw new Error(getErrorMessage(allData, "Failed to load faculty"));
            }

            if (pendingData.success) setPendingFaculty(pendingData.data);
            if (allData.success) setAllFaculty(allData.data);
            setPendingTotal(pendingData.pagination?.total ?? pendingData.data.length);
            setAllTotal(allData.pagination?.total ?? allData.data.length);
        } catch (err) {
            console.error("Error fetching faculty:", err);
            setError("Failed to load faculty data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [allPage, pendingPage]);

    useEffect(() => {
        fetchFaculty();
    }, [fetchFaculty]);

    const handleAction = useCallback(async (id: string, action: "approve" | "reject") => {
        const previousPending = pendingFaculty;
        const previousAll = allFaculty;
        const previousPendingTotal = pendingTotal;
        const previousAllTotal = allTotal;
        const target = pendingFaculty.find((faculty) => faculty._id === id)
            ?? allFaculty.find((faculty) => faculty._id === id);

        if (!target) {
            return;
        }

        const nextFaculty = { ...target, isApproved: action === "approve" };

        setPendingFaculty((current) => current.filter((faculty) => faculty._id !== id));
        setPendingTotal((current) => Math.max(0, current - (previousPending.some((faculty) => faculty._id === id) ? 1 : 0)));
        setAllFaculty((current) => {
            const exists = current.some((faculty) => faculty._id === id);
            if (exists) {
                return current.map((faculty) => (faculty._id === id ? nextFaculty : faculty));
            }
            return [nextFaculty, ...current];
        });
        setAllTotal((current) => {
            const exists = previousAll.some((faculty) => faculty._id === id);
            return exists ? current : current + 1;
        });

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(buildApiUrl(`/admin/faculty/${id}/${action}`), {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                throw new Error(getErrorMessage(data, "Action failed"));
            }

            if (data.data) {
                setAllFaculty((current) =>
                    current.map((faculty) => (faculty._id === id ? data.data : faculty))
                );
            }

            toast.success(
                action === "approve"
                    ? "Faculty approved successfully"
                    : "Faculty access revoked successfully"
            );
        } catch (err) {
            console.error(err);
            setPendingFaculty(previousPending);
            setAllFaculty(previousAll);
            setPendingTotal(previousPendingTotal);
            setAllTotal(previousAllTotal);
            toast.error(err instanceof Error ? err.message : "Error performing action");
        }
    }, [allFaculty, allTotal, pendingFaculty, pendingTotal]);

    if (error) {
        return (
            <div className="p-8 text-center space-y-4">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Loading faculty data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Review registration requests and manage faculty members.
                </p>
            </div>

            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="pending" className="gap-2">
                        Pending
                        {pendingFaculty.length > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {pendingFaculty.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="all">All Faculty</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-0">
                    {pendingFaculty.length === 0 ? (
                        <EmptyState message="No pending requests" />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {pendingFaculty.map((faculty) => (
                                <FacultyCard
                                    key={faculty._id}
                                    faculty={faculty}
                                    onAction={handleAction}
                                    showActions={true}
                                />
                            ))}
                            <PaginationControls
                                label="pending faculty"
                                page={pendingPage}
                                pageSize={FACULTY_PAGE_SIZE}
                                total={pendingTotal}
                                onPageChange={setPendingPage}
                            />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="all" className="mt-0">
                    {allFaculty.length === 0 ? (
                        <EmptyState message="No faculty members found" />
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {allFaculty.map((faculty) => (
                                <FacultyCard
                                    key={faculty._id}
                                    faculty={faculty}
                                    onAction={handleAction}
                                    showActions={false}
                                />
                            ))}
                            <PaginationControls
                                label="faculty"
                                page={allPage}
                                pageSize={FACULTY_PAGE_SIZE}
                                total={allTotal}
                                onPageChange={setAllPage}
                            />
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="border rounded-lg p-12 text-center">
            <User className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <h3 className="mt-3 text-lg font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">
                All faculty applications have been processed.
            </p>
        </div>
    );
}

const FacultyCard = React.memo(function FacultyCardComponent({
    faculty,
    onAction,
    showActions,
}: {
    faculty: Faculty;
    onAction: (id: string, action: "approve" | "reject") => void;
    showActions: boolean;
}) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-6 space-y-4">
                {/* Header: name + status */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                        {faculty.avatar ? (
                            <Avatar className="h-10 w-10 shrink-0">
                                <AvatarImage src={faculty.avatar} />
                                <AvatarFallback>{faculty.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                        ) : (
                            <DefaultAvatar name={faculty.name} size={40} className="shrink-0" />
                        )}
                        <div className="min-w-0">
                            <h3 className="font-semibold text-lg truncate">{faculty.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{faculty.email}</p>
                        </div>
                    </div>
                    <Badge variant={faculty.isApproved ? "default" : "secondary"} className="shrink-0">
                        {faculty.isApproved ? "Approved" : "Pending"}
                    </Badge>
                </div>

                {/* Details grid */}
                <div className="space-y-2 text-sm">
                    <DetailRow label="Designation" value={faculty.designation} />
                    <DetailRow label="Department" value={faculty.department} />
                    <DetailRow label="College" value={faculty.collegeName} />
                    <div className="pt-1">
                        <span className="text-muted-foreground block mb-1">Subjects</span>
                        <div className="flex flex-wrap gap-1">
                            {faculty.subjects.map((sub, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {sub}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                {showActions && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onAction(faculty._id, "approve")}
                            className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onAction(faculty._id, "reject")}
                            className="border-red-500/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                )}

                {!showActions && !faculty.isApproved && (
                    <Button
                        variant="outline"
                        onClick={() => onAction(faculty._id, "approve")}
                        className="w-full border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                    >
                        <Check className="mr-2 h-4 w-4" />
                        Approve Now
                    </Button>
                )}

                {!showActions && faculty.isApproved && (
                    <Button
                        variant="outline"
                        onClick={() => onAction(faculty._id, "reject")}
                        className="w-full border-red-500/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Revoke Access
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}, (prev, next) => (
    prev.faculty === next.faculty
    && prev.onAction === next.onAction
    && prev.showActions === next.showActions
));

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function PaginationControls({
    label,
    page,
    pageSize,
    total,
    onPageChange,
}: {
    label: string;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
}) {
    const pageCount = Math.max(1, Math.ceil(total / pageSize));

    if (total <= pageSize) {
        return null;
    }

    return (
        <div className="col-span-full flex flex-col gap-3 rounded-lg border p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>
                Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} {label}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span className="px-2">
                    Page {page} of {pageCount}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(pageCount, page + 1))}
                    disabled={page === pageCount}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
