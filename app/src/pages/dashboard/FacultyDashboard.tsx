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
import { buildApiUrl, getAuthHeaders, parseApiData } from "@/services/api";
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
                        const userData = parseApiData<FacultyUser>(payload, null);
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
                    <p className="text-sm text-muted-foreground">
                        Loading faculty dashboard...
                    </p>
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
        <div className="space-y-6">
            {/* Warning Banner for Non-Approved Faculty */}
            {!user.isApproved && (
                <Alert variant="warning" className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/50">
                    <AlertTitle className="text-yellow-800 dark:text-yellow-200">
                        Account Pending Approval
                    </AlertTitle>
                    <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                        Your faculty account is currently under review by the administration.
                        You will not be able to upload study materials until your account is approved.
                    </AlertDescription>
                </Alert>
            )}

            {/* Welcome Card */}
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_92%,var(--color-blue-50))_0%,var(--card)_55%,color-mix(in_srgb,var(--card)_90%,var(--color-stone-100))_100%)]">
                    <CardHeader className="space-y-4 pb-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full px-2.5" variant="outline">
                                Faculty dashboard
                            </Badge>
                            <Badge
                                className={cn(
                                    "rounded-full px-2.5",
                                    user.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                )}
                                variant="secondary"
                            >
                                {user.isApproved ? "Approved" : "Pending Approval"}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-3xl leading-tight sm:text-4xl">
                                Welcome back, {user.designation} {user.name}
                            </CardTitle>
                            <CardDescription className="max-w-2xl text-sm leading-6">
                                {user.department} • {user.collegeName}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
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

                {/* Quick Stats */}
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-lg">Upload Summary</CardTitle>
                        <CardDescription>
                            Overview of your study material submissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <MetricRow
                            icon={FileText}
                            label="Total uploads"
                            tone="info"
                            value={String(materials.length)}
                        />
                        <MetricRow
                            icon={CheckCircle2}
                            label="Approved"
                            tone="success"
                            value={String(approvedCount)}
                        />
                        <MetricRow
                            icon={Clock3}
                            label="Pending review"
                            tone="warning"
                            value={String(pendingCount)}
                        />
                        <MetricRow
                            icon={XCircle}
                            label="Rejected"
                            tone="error"
                            value={String(rejectedCount)}
                        />
                    </CardContent>
                </Card>
            </section>

            {/* Stats Grid */}
            <section className="grid gap-4 md:grid-cols-3">
                <Card className="border-border/70">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardDescription>Total uploads</CardDescription>
                                <CardTitle className="mt-2 text-3xl">{materials.length}</CardTitle>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">Study materials uploaded</p>
                    </CardContent>
                </Card>
                <Card className="border-border/70">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardDescription>Approved</CardDescription>
                                <CardTitle className="mt-2 text-3xl">{approvedCount}</CardTitle>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">Published resources</p>
                    </CardContent>
                </Card>
                <Card className="border-border/70">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardDescription>Department</CardDescription>
                                <CardTitle className="mt-2 text-2xl">{user.department}</CardTitle>
                            </div>
                            <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground">{user.collegeName}</p>
                    </CardContent>
                </Card>
            </section>

            {/* My Uploads Section */}
            <section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>My Uploads</CardTitle>
                        <CardDescription>
                            Study materials you have uploaded and their approval status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {materialsLoading ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : materials.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border/70 px-6 py-12 text-center">
                                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    No study materials uploaded yet.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link to="/add-study-content">
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Your First Material
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-2xl border border-border/70">
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[700px]">
                                        <TableHeader className="bg-secondary/60">
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
                                                            <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
                                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium">{material.title}</p>
                                                                <p className="mt-1 text-xs text-muted-foreground">
                                                                    {material.author}
                                                                </p>
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
            </section>

            {/* Quick Actions */}
            <section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>
                            Jump straight into common faculty tasks.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <QuickLink
                            description="Upload new study materials for student access."
                            to="/add-study-content"
                        >
                            Upload Study Material
                        </QuickLink>
                        <QuickLink
                            description="View and edit your faculty profile information."
                            to="/profile"
                        >
                            Update Profile
                        </QuickLink>
                        <QuickLink
                            description="Browse all study materials available on the platform."
                            to="/resources"
                        >
                            Browse Resources
                        </QuickLink>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
    if (status === "approved") {
        return (
            <Badge className="rounded-full px-2" variant="success">
                Approved
            </Badge>
        );
    }

    if (status === "rejected") {
        return (
            <Badge className="rounded-full px-2" variant="error">
                Rejected
            </Badge>
        );
    }

    return (
        <Badge className="rounded-full px-2" variant="warning">
            Pending
        </Badge>
    );
}

function MetricRow({
    icon: Icon,
    label,
    tone,
    value,
}: {
    icon: typeof FileText;
    label: string;
    tone: "info" | "success" | "warning" | "error";
    value: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border/70 bg-secondary p-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">Live data</p>
                </div>
            </div>
            <Badge className="rounded-full px-2" variant={tone}>
                {value}
            </Badge>
        </div>
    );
}

function QuickLink({
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
            className="block rounded-2xl border border-border/70 bg-background/80 px-4 py-3 transition-colors hover:bg-secondary/70"
            to={to}
        >
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">{children}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
        </Link>
    );
}
