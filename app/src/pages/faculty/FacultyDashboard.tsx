import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    Loader2,
    MessageSquarePlus,
    Send,
    Star,
    Upload,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { buildApiUrl, parseApiData } from "@/services/api";
import { fetchUserMaterials, fetchApprovedMaterials, type StudyMaterial } from "@/services/study-service";
import { fetchFacultyStats, submitMaterialFeedback, type FacultyStats, type MaterialFeedback } from "@/services/faculty-service";
import { fetchMaterialFeedback } from "@/services/faculty-service";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------

interface FacultyUser {
    id: string;
    _id?: string;
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

// ----------------------------------------------------------------------
// Star Rating (unchanged, but kept minimal)
// ----------------------------------------------------------------------

function StarRating({
    value,
    onChange,
    readOnly = false,
    size = "md",
}: {
    value: number;
    onChange?: (v: number) => void;
    readOnly?: boolean;
    size?: "sm" | "md";
}) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;
    const px = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readOnly}
                    className={cn(
                        "transition-colors",
                        readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    onClick={() => !readOnly && onChange?.(star)}
                >
                    <Star
                        className={cn(
                            px,
                            star <= active
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted-foreground/40"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

// ----------------------------------------------------------------------
// Status Badge (simplified)
// ----------------------------------------------------------------------

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
    const config = {
        approved: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
        rejected: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
        pending: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
    };
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
        <Badge variant="outline" className={config[status]}>
            {label}
        </Badge>
    );
}

// ----------------------------------------------------------------------
// Stat Card – flattened, no coloured icons, just a clean card
// ----------------------------------------------------------------------

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
}) {
    return (
        <Card className="border">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardDescription className="text-xs uppercase tracking-wide">
                        {label}
                    </CardDescription>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                    {value}
                </CardTitle>
            </CardHeader>
        </Card>
    );
}

// ----------------------------------------------------------------------
// Feedback Form (inline)
// ----------------------------------------------------------------------

function FeedbackForm({
    materialId,
    existingFeedback,
    onSuccess,
}: {
    materialId: string;
    existingFeedback: MaterialFeedback | null;
    onSuccess: (feedback: MaterialFeedback) => void;
}) {
    const [rating, setRating] = useState(existingFeedback?.rating ?? 0);
    const [text, setText] = useState(existingFeedback?.feedbackText ?? "");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        if (text.trim().length < 5) {
            toast.error("Feedback must be at least 5 characters.");
            return;
        }
        setSubmitting(true);
        const result = await submitMaterialFeedback(materialId, {
            feedback_text: text.trim(),
            rating,
        });
        setSubmitting(false);
        if (result.success && result.data) {
            toast.success(result.message);
            onSuccess(result.data);
        } else {
            toast.error(result.message || "Failed to submit feedback.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Your rating</p>
                <StarRating value={rating} onChange={setRating} />
            </div>
            <Textarea
                placeholder="Write your review – quality, accuracy, usefulness..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="resize-none text-sm"
            />
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? (
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-3.5 w-3.5" />
                    )}
                    {existingFeedback ? "Update Feedback" : "Submit Feedback"}
                </Button>
            </div>
        </form>
    );
}

// ----------------------------------------------------------------------
// Feedback Panel – simplified border, no glassmorphism
// ----------------------------------------------------------------------

function FeedbackPanel({
    material,
    userId,
}: {
    material: StudyMaterial;
    userId: string;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myFeedback, setMyFeedback] = useState<MaterialFeedback | null>(null);
    const didLoad = useRef(false);

    const loadFeedback = async () => {
        setLoading(true);
        const list = await fetchMaterialFeedback(material._id);
        const mine = list.find((f) => f.reviewerUserId === userId) ?? null;
        setMyFeedback(mine);
        setLoading(false);
    };

    const handleToggle = async () => {
        if (!open && !didLoad.current) {
            didLoad.current = true;
            await loadFeedback();
        }
        setOpen((v) => !v);
    };

    const handleSuccess = (saved: MaterialFeedback) => {
        setMyFeedback(saved);
    };

    return (
        <div className="rounded-md border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">{material.title}</p>
                        {myFeedback && (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Reviewed
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {material.subject} · {material.author}
                    </p>
                    {myFeedback && <StarRating value={myFeedback.rating} readOnly size="sm" />}
                </div>
                <Button
                    variant={open ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleToggle}
                >
                    <MessageSquarePlus className="mr-2 h-3.5 w-3.5" />
                    {myFeedback ? "Edit Feedback" : "Give Feedback"}
                </Button>
            </div>
            {open && (
                <div className="mt-4">
                    <Separator className="my-2" />
                    {loading ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <FeedbackForm
                            materialId={material._id}
                            existingFeedback={myFeedback}
                            onSuccess={handleSuccess}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// Main Dashboard Component
// ----------------------------------------------------------------------

export default function FacultyDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<FacultyUser | null>(null);
    const [stats, setStats] = useState<FacultyStats>({
        total_uploaded: 0,
        approved_count: 0,
        pending_count: 0,
        rejected_count: 0,
        feedback_given_count: 0,
    });
    const [myUploads, setMyUploads] = useState<StudyMaterial[]>([]);
    const [approvedMaterials, setApprovedMaterials] = useState<StudyMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const rawUser = localStorage.getItem("user");
                if (rawUser) {
                    try {
                        setUser(JSON.parse(rawUser) as FacultyUser);
                    } catch {
                        /* ignore */
                    }
                }

                const [profileRes, statsData, uploads, approved] = await Promise.all([
                    fetch(buildApiUrl("/auth/me"), {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetchFacultyStats(),
                    fetchUserMaterials(),
                    fetchApprovedMaterials(),
                ]);

                if (profileRes.ok) {
                    const payload = await profileRes.json();
                    const userData = parseApiData<FacultyUser | null>(payload, null);
                    if (userData) {
                        setUser(userData);
                        localStorage.setItem("user", JSON.stringify(userData));
                    }
                }

                setStats(statsData);
                setMyUploads(uploads);
                const storedUser = JSON.parse(localStorage.getItem("user") ?? "{}") as FacultyUser;
                setApprovedMaterials(approved.filter((m) => m.author !== storedUser.name));
            } catch (err) {
                console.error("Faculty dashboard error", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="space-y-3 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading dashboard…</p>
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

    return (
        <div className="space-y-8">
            {/* Welcome Card */}
            <Card>
                <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">Faculty Dashboard</Badge>
                        {user.isApproved ? (
                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Active
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                                <AlertTriangle className="mr-1 h-3 w-3" /> Pending Approval
                            </Badge>
                        )}
                    </div>
                    <CardTitle className="text-2xl font-semibold tracking-tight">
                        {user.designation ? `${user.designation} ` : ""}
                        {user.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {[user.department, user.collegeName].filter(Boolean).join(" · ")}
                    </CardDescription>
                    {!user.isApproved && (
                        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>Your account is pending admin approval. Uploads are restricted until approved.</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Button asChild disabled={!user.isApproved} variant="default">
                            <Link to="/dashboard/faculty/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Material
                            </Link>
                        </Button>
                        <Button asChild variant="outline" >
                            <Link to="/dashboard/faculty/profile">
                                View Profile
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    {user.subjects && user.subjects.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-muted-foreground">Subjects:</span>
                            {user.subjects.map((s) => (
                                <Badge key={s} variant="secondary" className="rounded-full text-xs">
                                    {s}
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                <StatCard icon={FileText} label="Total Uploads" value={stats.total_uploaded} />
                <StatCard icon={CheckCircle2} label="Approved" value={stats.approved_count} />
                <StatCard icon={Clock3} label="Pending" value={stats.pending_count} />
                <StatCard icon={XCircle} label="Rejected" value={stats.rejected_count} />
                <StatCard icon={MessageSquarePlus} label="Feedback Given" value={stats.feedback_given_count} />
            </div>

            {/* My Uploads */}
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <CardTitle>My Uploads</CardTitle>
                            <CardDescription>Your study materials and their approval status.</CardDescription>
                        </div>
                        <Button asChild size="sm" disabled={!user.isApproved}>
                            <Link to="/dashboard/faculty/upload">
                                <Upload className="mr-2 h-3.5 w-3.5" />
                                Upload New
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {myUploads.length === 0 ? (
                        <div className="rounded-md border border-dashed p-12 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                No uploads yet.{" "}
                                {user.isApproved && (
                                    <Link
                                        to="/dashboard/faculty/upload"
                                        className="font-medium text-foreground underline underline-offset-2"
                                    >
                                        Upload your first material
                                    </Link>
                                )}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {myUploads.map((m) => (
                                <div
                                    key={m._id}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="rounded-md border p-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{m.title}</p>
                                            <p className="text-xs text-muted-foreground">{m.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <span className="hidden text-xs text-muted-foreground sm:inline">
                                            {new Date(m.createdAt).toLocaleDateString()}
                                        </span>
                                        <StatusBadge status={m.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Give Feedback */}
            <Card>
                <CardHeader>
                    <CardTitle>Review & Feedback</CardTitle>
                    <CardDescription>
                        Rate and review approved study materials. Your feedback helps maintain quality.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {approvedMaterials.length === 0 ? (
                        <div className="rounded-md border border-dashed p-12 text-center">
                            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                            <p className="mt-3 text-sm text-muted-foreground">
                                No approved materials available for review yet.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {approvedMaterials.slice(0, 20).map((m) => (
                                <FeedbackPanel key={m._id} material={m} userId={user.id ?? user._id ?? ""} />
                            ))}
                            {approvedMaterials.length > 20 && (
                                <p className="pt-1 text-center text-xs text-muted-foreground">
                                    Showing 20 of {approvedMaterials.length} approved materials.
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}