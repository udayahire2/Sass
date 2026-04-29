import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { buildApiUrl, getErrorMessage } from "@/services/api";

interface FacultyUser {
    _id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    collegeName: string;
    subjects: string[];
}

const FacultyApprovals = () => {
    const [faculty, setFaculty] = useState<FacultyUser[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingFaculty = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl('/admin/faculty/pending'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setFaculty(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch pending faculty", error);
            toast.error("Failed to load pending approvals");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(buildApiUrl(`/admin/faculty/${id}/${action}`), {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setFaculty(prev => prev.filter(f => f._id !== id));
                toast.success(`Faculty ${action}d successfully`);
            } else {
                toast.error(getErrorMessage(data, `Failed to ${action} faculty`));
            }
        } catch (error) {
            console.error(`Failed to ${action} faculty`, error);
            toast.error(`Failed to ${action} faculty`);
        }
    };

    useEffect(() => {
        fetchPendingFaculty();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                    <p className="text-muted-foreground">Loading pending approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Faculty Approvals</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Review and verify faculty registration requests.
                </p>
            </div>

            {faculty.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium">No pending approvals</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            All faculty requests have been reviewed.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {faculty.map((user) => (
                        <Card key={user._id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-lg">{user.name}</h3>
                                            <Badge variant="outline" className="text-xs">
                                                {user.designation}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                                            <div>
                                                <span className="font-medium text-muted-foreground">Department:</span>{" "}
                                                {user.department}
                                            </div>
                                            <div>
                                                <span className="font-medium text-muted-foreground">College:</span>{" "}
                                                {user.collegeName}
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="font-medium text-muted-foreground">Subjects:</span>{" "}
                                                {user.subjects?.join(", ") || "—"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAction(user._id, "reject")}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAction(user._id, "approve")}
                                            className="bg-primary hover:bg-primary/90"
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultyApprovals;