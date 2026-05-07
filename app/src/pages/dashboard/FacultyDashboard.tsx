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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Star Rating ─────────────────────────────────────────────────────────────

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
                        readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
                    )}
                    onMouseEnter={() => !readOnly && setHovered(star)}
                    onMouseLeave={() => !readOnly && setHovered(0)}
                    onClick={() => !readOnly && onChange?.(star)}
                    aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                    <Star
                        className={cn(
                            px,
                            star <= active
                                ? "fill-amber-400 text-amber-400"
                                : "fill-muted text-muted-foreground/40",
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
    if (status === "approved")
        return (
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                Approved
            </Badge>
        );
    if (status === "rejected")
        return (
            <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
                Rejected
            </Badge>
        );
    return (
        <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
            Pending
        </Badge>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    icon: Icon,
    label,
    value,
    tone,
}: {
    icon: React.ElementType;
    label: string;
    value: number;
    tone: "default" | "success" | "warning" | "error" | "info";
}) {
    const iconColors: Record<string, string> = {
        default: "text-muted-foreground",
        success: "text-emerald-500",
        warning: "text-amber-500",
        error: "text-red-500",
        info: "text-blue-500",
    };
    return (
        <Card className="border-border/70">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                    <CardDescription className="text-xs uppercase tracking-wide">{label}</CardDescription>
                    <div className="rounded-lg border border-border/60 bg-secondary p-2">
                        <Icon className={cn("h-3.5 w-3.5", iconColors[tone])} />
                    </div>
                </div>
                <CardTitle className="text-3xl tabular-nums">{value}</CardTitle>
            </CardHeader>
        </Card>
    );
}

// ─── Inline Feedback Form ─────────────────────────────────────────────────────

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
        if (rating === 0) { toast.error("Please select a star rating."); return; }
        if (text.trim().length < 5) { toast.error("Feedback must be at least 5 characters."); return; }

        setSubmitting(true);
        const result = await submitMaterialFeedback(materialId, { feedback_text: text.trim(), rating });
        setSubmitting(false);

        if (result.success && result.data) {
            toast.success(result.message);
            onSuccess(result.data);
        } else {
            toast.error(result.message || "Failed to submit feedback.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Your rating</p>
                <StarRating value={rating} onChange={setRating} />
            </div>
            <Textarea
                placeholder="Write your review of this material — quality, accuracy, usefulness..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="resize-none text-sm"
            />
            <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5" />}
                    {existingFeedback ? "Update Feedback" : "Submit Feedback"}
                </Button>
            </div>
        </form>
    );
}

// ─── Feedback Panel for a material ───────────────────────────────────────────

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
        <div className="rounded-xl border border-border/60 bg-background/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-sm">{material.title}</p>
                        {myFeedback && (
                            <Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Reviewed
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {material.subject} · {material.author}
                    </p>
                    {myFeedback && (
                        <StarRating value={myFeedback.rating} readOnly size="sm" />
                    )}
                </div>
                <Button
                    variant={open ? "secondary" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={handleToggle}
                >
                    <MessageSquarePlus className="mr-2 h-3.5 w-3.5" />
                    {myFeedback ? "Edit Feedback" : "Give Feedback"}
                </Button>
            </div>

            {open && (
                <div className="mt-4 space-y-4">
                    <Separator />
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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
                if (!token) { navigate("/login"); return; }

                // Load user from localStorage immediately (no flicker)
                const raw = localStorage.getItem("user");
                if (raw) {
                    try { setUser(JSON.parse(raw) as FacultyUser); } catch { /* ignore */ }
                }

                // Fetch fresh profile + all data in parallel
                const [profileRes, statsData, uploads, approved] = await Promise.all([
                    fetch(buildApiUrl("/auth/me"), { headers: { Authorization: `Bearer ${token}` } }),
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
                // Show only materials NOT uploaded by this faculty for the feedback section
                const storedUser = JSON.parse(localStorage.getItem("user") ?? "{}") as FacultyUser;
                setApprovedMaterials(approved.filter((m) => m.author !== storedUser.name));
            } catch (err) {
                console.error("Faculty dashboard error", err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="space-y-3 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
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
        <div className="space-y-8 px-4 py-6 sm:px-6 lg:px-8">

            {/* ── Section A: Welcome + Status ──────────────────────────────── */}
            <section>
                <Card className="border-border/70 overflow-hidden">
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

                        <div>
                            <CardTitle className="text-3xl font-bold tracking-tight">
                                {user.designation ? `${user.designation} ` : ""}{user.name}
                            </CardTitle>
                            <CardDescription className="mt-1 text-base">
                                {[user.department, user.collegeName].filter(Boolean).join(" · ")}
                            </CardDescription>
                        </div>

                        {!user.isApproved && (
                            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                <p className="text-sm text-amber-800 dark:text-amber-300">
                                    Your account is pending admin approval. Material uploads are restricted until approved.
                                </p>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild disabled={!user.isApproved}>
                                <Link to="/add-study-content">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Material
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/profile">
                                    View Profile
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                        {user.subjects && user.subjects.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2">
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
            </section>

            {/* ── Section B: Quick Stats ────────────────────────────────────── */}
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                    Your Contributions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard icon={FileText} label="Total Uploads" value={stats.total_uploaded} tone="default" />
                    <StatCard icon={CheckCircle2} label="Approved" value={stats.approved_count} tone="success" />
                    <StatCard icon={Clock3} label="Pending" value={stats.pending_count} tone="warning" />
                    <StatCard icon={XCircle} label="Rejected" value={stats.rejected_count} tone="error" />
                    <StatCard icon={MessageSquarePlus} label="Feedback Given" value={stats.feedback_given_count} tone="info" />
                </div>
            </section>

            {/* ── Section C: My Uploads ─────────────────────────────────────── */}
            <section>
                <Card className="border-border/70">
                    <CardHeader>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <CardTitle>My Uploads</CardTitle>
                                <CardDescription>Your study materials and their current approval status.</CardDescription>
                            </div>
                            <Button asChild size="sm" disabled={!user.isApproved}>
                                <Link to="/add-study-content">
                                    <Upload className="mr-2 h-3.5 w-3.5" />
                                    Upload New
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {myUploads.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 px-6 py-12 text-center">
                                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    No uploads yet.{" "}
                                    {user.isApproved && (
                                        <Link to="/add-study-content" className="font-medium text-foreground underline underline-offset-2">
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
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-4 py-3"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="rounded-lg border border-border/60 bg-secondary p-2 shrink-0">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{m.title}</p>
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
            </section>

            {/* ── Section D: Give Feedback ──────────────────────────────────── */}
            <section>
                <Card className="border-border/70">
                    <CardHeader>
                        <CardTitle>Review & Feedback</CardTitle>
                        <CardDescription>
                            Rate and review approved study materials contributed by students and other faculty.
                            Your feedback helps maintain content quality.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {approvedMaterials.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-border/70 px-6 py-12 text-center">
                                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                <p className="mt-3 text-sm text-muted-foreground">
                                    No approved materials available for review yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {approvedMaterials.slice(0, 20).map((m) => (
                                    <FeedbackPanel
                                        key={m._id}
                                        material={m}
                                        userId={user.id ?? user._id ?? ""}
                                    />
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
            </section>
        </div>
    );
}