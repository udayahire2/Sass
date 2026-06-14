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
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildApiUrl, parseApiData } from "@/services/api";
import {
  fetchUserMaterials,
  fetchApprovedMaterials,
  type StudyMaterial,
} from "@/services/study-service";
import {
  fetchFacultyStats,
  submitMaterialFeedback,
  type FacultyStats,
  type MaterialFeedback,
  fetchMaterialFeedback,
} from "@/services/faculty-service";
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
// Star Rating (minimal)
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
            "p-1 focus:outline-none transition-transform duration-150",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"
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
                : "fill-muted text-muted-foreground/25"
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// Status Badge (standard outline + theme colors)
// ----------------------------------------------------------------------

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
  const config = {
    approved:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
    rejected:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
    pending:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400",
  };
  return (
    <Badge variant="outline" className={config[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}


// ----------------------------------------------------------------------
// Feedback Form (clean)
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
// Feedback Panel (simple border)
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
        <div className="space-y-3 text-center animate-in fade-in duration-300">
          <Spinner className="mx-auto h-8 w-8" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
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

  const displayName = user.designation
    ? `${user.designation} ${user.name}`
    : user.name;

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/25 bg-primary/5 text-primary text-xs font-medium px-2.5 py-0.5 rounded-full">
                Faculty Workspace
              </Badge>
              {user.isApproved ? (
                <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/5 text-emerald-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approved & Active
                </Badge>
              ) : (
                <Badge variant="outline" className="border-amber-500/25 bg-amber-500/5 text-amber-500 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="mr-1 h-3.5 w-3.5" /> Pending Approval
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome back, {displayName}
            </h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              {[user.department, user.collegeName].filter(Boolean).join(" · ") || "Manage your academic resources and student feedback."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {user.isApproved ? (
              <Button asChild>
                <Link to="/dashboard/faculty/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Material
                </Link>
              </Button>
            ) : (
              <Button disabled className="opacity-60 cursor-not-allowed">
                <Upload className="mr-2 h-4 w-4" />
                Upload Material
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/dashboard/faculty/profile">
                View Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Warning notification banner if not approved */}
        {!user.isApproved && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <p className="font-semibold">Account Pending Admin Verification</p>
              <p className="text-muted-foreground/80">Your profile is currently under review by the administration. You will have full access to upload materials and give feedback once your account has been approved.</p>
            </div>
          </div>
        )}
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground tracking-tight">{stats.total_uploaded}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Materials shared</p>
              </div>
              <FileText className="h-5 w-5 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground tracking-tight">{stats.approved_count}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Active in library</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-500/90" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground tracking-tight">{stats.pending_count}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
              </div>
              <Clock3 className="h-5 w-5 text-amber-500/90" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground tracking-tight">{stats.rejected_count}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Requires attention</p>
              </div>
              <XCircle className="h-5 w-5 text-red-500/90" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Feedback Given</p>
                <h2 className="mt-2 text-3xl font-semibold text-foreground tracking-tight">{stats.feedback_given_count}</h2>
                <p className="mt-1 text-xs text-muted-foreground">Reviews submitted</p>
              </div>
              <MessageSquarePlus className="h-5 w-5 text-blue-500/90" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300 border-border/40">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">My Profile</p>
                <h2 className="mt-2 text-base font-semibold leading-tight text-foreground truncate max-w-[130px]" title={user.designation || "Faculty"}>
                  {user.designation || "Faculty"}
                </h2>
                <p className="text-[10px] text-muted-foreground truncate max-w-[130px]" title={user.department || "No Department"}>
                  {user.department || "No Department"}
                </p>
                {user.subjects && user.subjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.subjects.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0 rounded-full font-normal">
                        {s}
                      </Badge>
                    ))}
                    {user.subjects.length > 2 && (
                      <span className="text-[9px] text-muted-foreground self-center">
                        +{user.subjects.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <User className="h-5 w-5 text-muted-foreground/70" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* My Uploads Table */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">My Uploads</h2>
            <p className="text-sm text-muted-foreground">Your shared study materials and their approval status.</p>
          </div>
          {user.isApproved && (
            <Button size="sm" asChild>
              <Link to="/dashboard/faculty/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload New
              </Link>
            </Button>
          )}
        </div>

        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-0">
            {myUploads.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/45" />
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
              <ScrollArea className="h-[400px] w-full">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-70">Content</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myUploads.map((m) => (
                      <TableRow key={m._id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-border/50 p-2 bg-background">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{m.title}</p>
                              <Badge variant="outline" className="text-[10px] mt-0.5 py-0">
                                {m.type}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{m.subject}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(m.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={m.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Give Feedback Section */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Review & Feedback</h2>
          <p className="text-sm text-muted-foreground">
            Rate and review approved study materials. Your feedback helps maintain library quality.
          </p>
        </div>

        <Card className="border-border/40">
          <CardContent className="p-6">
            {approvedMaterials.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/45" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No approved materials available for review yet.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px] w-full pr-2">
                <div className="space-y-4">
                  {approvedMaterials.slice(0, 20).map((m) => (
                    <FeedbackPanel
                      key={m._id}
                      material={m}
                      userId={user.id ?? user._id ?? ""}
                    />
                  ))}
                  {approvedMaterials.length > 20 && (
                    <p className="pt-2 text-center text-xs text-muted-foreground">
                      Showing 20 of {approvedMaterials.length} approved materials.
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}