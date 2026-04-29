import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, getErrorMessage } from "@/services/api";

interface Faculty {
    _id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    collegeName: string;
    subjects: string[];
    isApproved: boolean;
}

export default function FacultyManager() {
    const [pendingFaculty, setPendingFaculty] = useState<Faculty[]>([]);
    const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFaculty = async () => {
        try {
            const token = localStorage.getItem("token");
            const [pendingRes, allRes] = await Promise.all([
                fetch(buildApiUrl("/admin/faculty/pending"), {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(buildApiUrl("/admin/faculty/all"), {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const pendingData = await pendingRes.json();
            const allData = await allRes.json();

            if (pendingData.success) setPendingFaculty(pendingData.data);
            if (allData.success) setAllFaculty(allData.data);
        } catch (err) {
            console.error("Error fetching faculty:", err);
            setError("Failed to load faculty data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFaculty();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(buildApiUrl(`/admin/faculty/${id}/${action}`), {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Faculty ${action}d successfully`);
                fetchFaculty(); // refresh lists
            } else {
                toast.error(getErrorMessage(data, "Action failed"));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error performing action");
        }
    };

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

function FacultyCard({
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
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-lg">{faculty.name}</h3>
                        <p className="text-sm text-muted-foreground">{faculty.email}</p>
                    </div>
                    <Badge variant={faculty.isApproved ? "default" : "secondary"}>
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
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between py-1 border-b border-border/40">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}