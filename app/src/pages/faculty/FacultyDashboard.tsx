import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  DashboardEmptyState,
  DashboardLinkButton,
  DashboardPageHeader,
  DashboardStatCard,
  DashboardStatusBadge,
} from "@/components/dashboard/dashboard-ui";

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
  return <DashboardStatusBadge status={status} />;
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
              <Badge variant="success">
                <CheckCircle2 aria-hidden="true" />
                Reviewed
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
    <div className="flex flex-col gap-8 pb-10">
      <section className="flex flex-col gap-4">
        <DashboardPageHeader
          actions={
            <>
              {user.isApproved ? (
                <DashboardLinkButton
                  icon={Upload}
                  to="/dashboard/faculty/upload"
                >
                  Upload Material
                </DashboardLinkButton>
              ) : (
                <Button disabled>
                  <Upload aria-hidden="true" />
                  Upload Material
                </Button>
              )}
              <DashboardLinkButton
                icon={ArrowRight}
                iconPosition="end"
                to="/dashboard/faculty/profile"
                variant="outline"
              >
                View Profile
              </DashboardLinkButton>
            </>
          }
          badge={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Faculty Workspace</Badge>
              {user.isApproved ? (
                <Badge variant="success">
                  <CheckCircle2 aria-hidden="true" />
                  Approved & Active
                </Badge>
              ) : (
                <Badge variant="warning">
                  <AlertTriangle aria-hidden="true" />
                  Pending Approval
                </Badge>
              )}
            </div>
          }
          description={
            [user.department, user.collegeName].filter(Boolean).join(" · ") ||
            "Manage your academic resources and student feedback."
          }
          title={<>Welcome back, {displayName}</>}
        />

        {!user.isApproved && (
          <div className="flex items-start gap-3 rounded-lg border bg-warning/8 p-4 text-sm text-warning-foreground">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Account Pending Admin Verification</p>
              <p className="text-muted-foreground">
                Your profile is under review. Upload and feedback access will
                become available after approval.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <DashboardStatCard description="Materials shared" icon={FileText} label="Total Uploads" value={stats.total_uploaded} />
        <DashboardStatCard description="Active in library" icon={CheckCircle2} label="Approved" value={stats.approved_count} />
        <DashboardStatCard description="Awaiting review" icon={Clock3} label="Pending" value={stats.pending_count} />
        <DashboardStatCard description="Requires attention" icon={XCircle} label="Rejected" value={stats.rejected_count} />
        <DashboardStatCard description="Reviews submitted" icon={MessageSquarePlus} label="Feedback Given" value={stats.feedback_given_count} />
        <DashboardStatCard description={user.department || "No department"} icon={User} label="My Profile" value={user.designation || "Faculty"} />
      </section>

      {/* My Uploads Table */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">My Uploads</h2>
            <p className="text-sm text-muted-foreground">Your shared study materials and their approval status.</p>
          </div>
          {user.isApproved && (
            <DashboardLinkButton
              icon={Upload}
              to="/dashboard/faculty/upload"
            >
              Upload New
            </DashboardLinkButton>
          )}
        </div>

        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-0">
            {myUploads.length === 0 ? (
              <DashboardEmptyState
                action={
                  user.isApproved ? (
                    <DashboardLinkButton
                      icon={Upload}
                      to="/dashboard/faculty/upload"
                    >
                      Upload Material
                    </DashboardLinkButton>
                  ) : undefined
                }
                description="Share your first study material to start building your library."
                icon={BookOpen}
                title="No uploads yet"
              />
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
              <DashboardEmptyState
                description="Approved study materials will appear here when they are ready for review."
                icon={BookOpen}
                title="Nothing to review"
              />
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
