import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    Upload,
    User,
    XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { fetchUserMaterials, type StudyMaterial } from "@/services/study-service";
import { buildApiUrl, parseApiData } from "@/services/api";
import { cn } from "@/lib/utils";

interface FacultyUser {
    _id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    collegeName: string;
    isApproved: boolean;
    isVerified: boolean;
    subjects?: string[];
    role: string;
}

export default function FacultyDashboard() {
    const [user, setUser] = useState<FacultyUser | null>(null);
    const [materials, setMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [materialsLoading, setMaterialsLoading] = useState(false);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Fetch faculty profile
                const profileResponse = await fetch(buildApiUrl("/auth/faculty/profile"), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (profileResponse.ok) {
                    const payload = await profileResponse.json();
                    if (payload.success !== false) {
                        const userData = parseApiData<FacultyUser | null>(payload, null);
                        setUser(userData);
                    }
                }

                // Fetch user's study materials
                setMaterialsLoading(true);
                const userMaterials = await fetchUserMaterials();
                setMaterials(userMaterials);
            } catch (error) {
                console.error("Failed to load faculty dashboard", error);
            } finally {
                setLoading(false);
                setMaterialsLoading(false);
            }
        };
        void loadDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="space-y-3 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading faculty dashboard...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <p className="text-muted-foreground">Please log in to continue.</p>
            </div>
        );
    }

    const approvedCount = materials.filter((m) => m.status === "approved").length;
    const pendingCount = materials.filter((m) => m.status === "pending").length;
    const rejectedCount = materials.filter((m) => m.status === "rejected").length;

    return (
        <div className="space-y-8">
            {/* Pending approval warning */}
            {!user.isApproved && (
                <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30">
                    <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                        Account Pending Approval
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        Your faculty account is currently under review. You cannot upload materials until approved.
                    </AlertDescription>
                </Alert>
            )}

            {/* Welcome + Stats row */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Welcome card */}
                <Card>
                    <CardHeader className="pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Faculty dashboard</Badge>
                            <Badge
                                className={cn(
                                    user.isApproved
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                                        : "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
                                )}
                                variant="outline"
                            >
                                {user.isApproved ? "Approved" : "Pending Approval"}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl tracking-tight">
                                Welcome back, {user.designation} {user.name}
                            </CardTitle>
                            <CardDescription>
                                {user.department} • {user.collegeName}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link to="/add-study-content">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Study Material
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/profile">View Profile</Link>
                            </Button>
                        </div>
                        {user.subjects && user.subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                <span className="text-sm text-muted-foreground">Subjects:</span>
                                {user.subjects.map((subject) => (
                                    <Badge key={subject} variant="secondary" className="rounded-full">
                                        {subject}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick stats card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upload Summary</CardTitle>
                        <CardDescription>Overview of your submissions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MetricRow icon={FileText} label="Total uploads" value={String(materials.length)} />
                        <MetricRow icon={CheckCircle2} label="Approved" value={String(approvedCount)} />
                        <MetricRow icon={Clock3} label="Pending review" value={String(pendingCount)} />
                        <MetricRow icon={XCircle} label="Rejected" value={String(rejectedCount)} />
                    </CardContent>
                </Card>
            </div>

            {/* Stats grid (alternative view) */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardDescription>Total uploads</CardDescription>
                                <CardTitle className="mt-1 text-3xl">{materials.length}</CardTitle>
                            </div>
                            <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Study materials uploaded</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardDescription>Approved</CardDescription>
                                <CardTitle className="mt-1 text-3xl">{approvedCount}</CardTitle>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Published resources</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardDescription>Department</CardDescription>
                                <CardTitle className="mt-1 text-xl">{user.department}</CardTitle>
                            </div>
                            <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{user.collegeName}</p>
                    </CardContent>
                </Card>
            </div>

            {/* My Uploads */}
            <Card>
                <CardHeader>
                    <CardTitle>My Uploads</CardTitle>
                    <CardDescription>Your study materials and their approval status.</CardDescription>
                </CardHeader>
                <CardContent>
                    {materialsLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="rounded-lg border border-dashed p-12 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">No study materials uploaded yet.</p>
                            <Button asChild className="mt-4">
                                <Link to="/add-study-content">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Your First Material
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow>
                                            <TableHead className="w-[320px]">Content</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {materials.map((material) => (
                                            <TableRow key={material._id}>
                                                <TableCell>
                                                    <div className="flex items-start gap-3">
                                                        <div className="rounded-md border p-2">
                                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{material.title}</p>
                                                            <p className="text-xs text-muted-foreground">{material.author}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{material.subject}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="rounded-full">
                                                        {material.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(material.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={material.status} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <CardDescription>Jump straight into common tasks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <QuickAction to="/add-study-content" description="Upload new study materials for student access.">
                        Upload Study Material
                    </QuickAction>
                    <QuickAction to="/profile" description="View and edit your faculty profile information.">
                        Update Profile
                    </QuickAction>
                    <QuickAction to="/resources" description="Browse all study materials available on the platform.">
                        Browse Resources
                    </QuickAction>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper components

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
    if (status === "approved") {
        return (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                Approved
            </Badge>
        );
    }
    if (status === "rejected") {
        return (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                Rejected
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
            Pending
        </Badge>
    );
}

function MetricRow({
    icon: Icon,
    label,
    value,
}: {
    icon: any;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <Badge variant="secondary">{value}</Badge>
        </div>
    );
}

function QuickAction({
    children,
    description,
    to,
}: {
    children: string;
    description: string;
    to: string;
}) {
    return (
        <Link
            to={to}
            className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
            <div>
                <p className="text-sm font-medium">{children}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Upload className="h-4 w-4 text-muted-foreground" />
        </Link>
    );
}