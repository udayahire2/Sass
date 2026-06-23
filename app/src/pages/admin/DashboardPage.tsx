import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Moon,
  Search,
  Sun,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchApprovedMaterials,
  fetchPendingMaterials,
  updateMaterialStatus,
  type StudyMaterial,
} from "@/services/study-service";
import { buildApiUrl, parseApiData } from "@/services/api";
import { cn } from "@/lib/utils";
import {
  DashboardActionList,
  DashboardEmptyState,
  DashboardLinkButton,
  DashboardStatCard,
  DashboardStatusBadge,
} from "@/components/dashboard/dashboard-ui";

const DASHBOARD_PAGE_SIZE = 50;

interface AdminStats {
  totalUsers: number;
  newUsers: number;
  totalResources: number;
  newResources: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingMaterials, setPendingMaterials] = useState<StudyMaterial[]>([]);
  const [approvedMaterials, setApprovedMaterials] = useState<StudyMaterial[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const { theme, setTheme } = useTheme();

  const loadMaterials = useCallback(async () => {
    const pending = await fetchPendingMaterials();
    const approved = await fetchApprovedMaterials();
    setPendingMaterials(pending);
    setApprovedMaterials(approved);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          return;
        }

        const statsRequest = fetch(buildApiUrl("/admin/stats"), {
          headers: { Authorization: `Bearer ${token}` },
        }).then(async (res) => {
          const data = await res.json();
          if (res.ok && data.success) {
            setStats(parseApiData(data, null));
          }
        });

        await Promise.all([statsRequest, loadMaterials()]);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [loadMaterials]);

  const handleStatusUpdate = useCallback(
    async (id: string, status: "approved" | "rejected") => {
      const previousPending = pendingMaterials;
      const previousApproved = approvedMaterials;
      const target = pendingMaterials.find((material) => material._id === id);

      if (target) {
        setPendingMaterials((current) =>
          current.filter((material) => material._id !== id),
        );
        if (status === "approved") {
          setApprovedMaterials((current) => [
            { ...target, status },
            ...current,
          ]);
        }
      }

      const result = await updateMaterialStatus(id, status);
      if (result) {
        if (status === "approved") {
          setApprovedMaterials((current) =>
            current.map((material) =>
              material._id === id ? result : material,
            ),
          );
        }
        return;
      }

      setPendingMaterials(previousPending);
      setApprovedMaterials(previousApproved);
    },
    [approvedMaterials, pendingMaterials],
  );

  const handleApproveMaterial = useCallback(
    (id: string) => handleStatusUpdate(id, "approved"),
    [handleStatusUpdate],
  );

  const handleRejectMaterial = useCallback(
    (id: string) => handleStatusUpdate(id, "rejected"),
    [handleStatusUpdate],
  );

  const filterMaterials = useCallback(
    (materials: StudyMaterial[]) => {
      if (!searchQuery.trim()) {
        return materials;
      }

      const query = searchQuery.toLowerCase();
      return materials.filter((material) => {
        return (
          material.title.toLowerCase().includes(query) ||
          material.author.toLowerCase().includes(query) ||
          material.subject.toLowerCase().includes(query)
        );
      });
    },
    [searchQuery],
  );

  const pendingCount = pendingMaterials.length;
  const approvedCount = approvedMaterials.length;
  const totalReviewed = pendingCount + approvedCount;
  const approvalRate = totalReviewed
    ? Math.round((approvedCount / totalReviewed) * 100)
    : 0;
  const filteredPending = useMemo(
    () => filterMaterials(pendingMaterials),
    [filterMaterials, pendingMaterials],
  );
  const filteredApproved = useMemo(
    () => filterMaterials(approvedMaterials),
    [approvedMaterials, filterMaterials],
  );
  const pagedPending = useMemo(() => {
    const start = (pendingPage - 1) * DASHBOARD_PAGE_SIZE;
    return filteredPending.slice(start, start + DASHBOARD_PAGE_SIZE);
  }, [filteredPending, pendingPage]);
  const pagedApproved = useMemo(() => {
    const start = (approvedPage - 1) * DASHBOARD_PAGE_SIZE;
    return filteredApproved.slice(start, start + DASHBOARD_PAGE_SIZE);
  }, [approvedPage, filteredApproved]);

  useEffect(() => {
    setPendingPage(1);
    setApprovedPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Loading the admin workspace...
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: formatValue(stats?.totalUsers ?? 0),
      detail: `+${stats?.newUsers ?? 0} this week`,
      icon: Users,
    },
    {
      title: "Published Resources",
      value: formatValue(stats?.totalResources ?? 0),
      detail: `+${stats?.newResources ?? 0} recent`,
      icon: FileText,
    },
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
      detail: `From ${totalReviewed} total reviewed`,
      icon: CheckCircle2,
    },
    {
      title: "Pending Queue",
      value: formatValue(pendingCount),
      detail: pendingCount === 0 ? "All caught up" : "Awaiting your review",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_92%,var(--color-amber-50))_0%,var(--card)_55%,color-mix(in_srgb,var(--card)_90%,var(--color-stone-100))_100%)]">
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <QuickFact
                label="Pending"
                value={String(pendingCount)}
                tone="warning"
              />
              <QuickFact
                label="Approved"
                value={String(approvedCount)}
                tone="success"
              />
              <QuickFact
                label="Status"
                value={pendingCount > 0 ? "Action Required" : "Up to Date"}
                tone="info"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DashboardLinkButton
                icon={ArrowRight}
                iconPosition="end"
                to="/admin/approvals"
                variant="ghost"
              >
                Review submissions
              </DashboardLinkButton>
              <DashboardLinkButton
                icon={ArrowRight}
                iconPosition="end"
                to="/admin/students"
                variant="ghost"
              >
                Manage students
              </DashboardLinkButton>
            </div>
          </CardContent>
        </Card>

        <ThemeCard currentTheme={theme} onThemeChange={setTheme} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            description={stat.detail}
            icon={stat.icon}
            key={stat.title}
            label={stat.title}
            value={stat.value}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-border/70">
          <CardHeader className="gap-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <CardTitle>Content Approvals</CardTitle>
                <CardDescription>
                  Manage and moderate study material submissions.
                </CardDescription>
              </div>
              <InputGroup className="w-full md:max-w-xs">
                <InputGroupAddon>
                  <Search
                    aria-hidden="true"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </InputGroupAddon>
                <InputGroupInput
                  type="search"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search content..."
                  value={searchQuery}
                />
              </InputGroup>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs className="space-y-4" defaultValue="pending">
              <TabsList className="w-full justify-start rounded-xl bg-secondary/80 p-1 sm:w-auto">
                <TabsTrigger className="rounded-lg" value="pending">
                  Pending
                  <Badge className="ml-2 rounded-full px-2" variant="warning">
                    {pendingCount}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger className="rounded-lg" value="approved">
                  Approved
                  <Badge className="ml-2 rounded-full px-2" variant="success">
                    {approvedCount}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <MaterialTable
                  emptyIcon={Clock3}
                  emptyMessage="No pending submissions."
                  materials={pagedPending}
                  onApprove={handleApproveMaterial}
                  onReject={handleRejectMaterial}
                  onPageChange={setPendingPage}
                  page={pendingPage}
                  pageSize={DASHBOARD_PAGE_SIZE}
                  showActions
                  total={filteredPending.length}
                />
              </TabsContent>

              <TabsContent value="approved">
                <MaterialTable
                  emptyIcon={CheckCircle2}
                  emptyMessage="No approved content found."
                  materials={pagedApproved}
                  onPageChange={setApprovedPage}
                  page={approvedPage}
                  pageSize={DASHBOARD_PAGE_SIZE}
                  showActions={false}
                  total={filteredApproved.length}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Queue Status</CardTitle>
              <CardDescription>
                Current metrics for pending content reviews.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MetricRow
                icon={TrendingUp}
                label="Approval Rate"
                tone="success"
                value={`${approvalRate}%`}
              />
              <MetricRow
                icon={BarChart3}
                label="New Resources"
                tone="info"
                value={String(stats?.newResources ?? 0)}
              />
              <MetricRow
                icon={Clock3}
                label="Pending Items"
                tone="warning"
                value={String(pendingCount)}
              />
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>
                Access primary administration tools.
              </CardDescription>
            </CardHeader>
            <DashboardActionList
              actions={[
                {
                  description: "Approve or reject pending study materials.",
                  icon: CheckCircle2,
                  label: "Manage Approvals",
                  to: "/admin/approvals",
                },
                {
                  description: "Manage student accounts and access.",
                  icon: Users,
                  label: "Manage Students",
                  to: "/admin/students",
                },
              ]}
              framed={false}
            />
          </Card>
        </div>
      </section>
    </div>
  );
}

function ThemeCard({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: "dark" | "light" | "system";
  onThemeChange: (theme: "dark" | "light" | "system") => void;
}) {
  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="text-lg">Appearance</CardTitle>
        <CardDescription>Customize the dashboard theme.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ThemeOption
          active={currentTheme === "light"}
          description="Standard light appearance"
          icon={Sun}
          label="Light Mode"
          onClick={() => onThemeChange("light")}
        />
        <ThemeOption
          active={currentTheme === "dark"}
          description="Reduced glare appearance"
          icon={Moon}
          label="Dark Mode"
          onClick={() => onThemeChange("dark")}
        />
      </CardContent>
    </Card>
  );
}

function ThemeOption({
  active,
  description,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: typeof Sun;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
        active
          ? "border-border bg-secondary text-foreground"
          : "border-border/70 bg-background hover:bg-secondary/60",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="rounded-xl border border-border/70 bg-background p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {active ? (
        <Badge className="rounded-full px-2" variant="secondary">
          Active
        </Badge>
      ) : null}
    </button>
  );
}

function QuickFact({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "info" | "success" | "warning";
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-lg font-semibold">{value}</span>
        <Badge className="rounded-full px-2" variant={tone}>
          Live
        </Badge>
      </div>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  tone: "info" | "success" | "warning";
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
          <p className="text-xs text-muted-foreground">Live metric</p>
        </div>
      </div>
      <Badge className="rounded-full px-2" variant={tone}>
        {value}
      </Badge>
    </div>
  );
}

function MaterialTable({
  materials,
  showActions,
  onApprove,
  onReject,
  onPageChange,
  emptyMessage,
  emptyIcon: EmptyIcon,
  page,
  pageSize,
  total,
}: {
  materials: StudyMaterial[];
  showActions: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onPageChange?: (page: number) => void;
  emptyMessage: string;
  emptyIcon: typeof Clock3;
  page: number;
  pageSize: number;
  total: number;
}) {
  if (materials.length === 0) {
    return (
      <DashboardEmptyState
        className="rounded-lg border border-dashed"
        description={emptyMessage}
        icon={EmptyIcon}
        title="No content found"
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="rounded-2xl border border-border/70 overflow-hidden">
      <ScrollArea className="h-[500px] w-full">
        <Table className="min-w-[840px]">
          <TableHeader className="bg-secondary/60 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[320px]">Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              {showActions ? (
                <TableHead className="text-right">Actions</TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <MaterialTableRow
                key={material._id}
                material={material}
                onApprove={onApprove}
                onReject={onReject}
                showActions={showActions}
              />
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {total > pageSize ? (
        <div className="flex flex-col gap-3 border-t border-border/70 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(Math.max(1, page - 1))}
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
              onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
              disabled={page === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const MaterialTableRow = memo(function MaterialTableRow({
  material,
  onApprove,
  onReject,
  showActions,
}: {
  material: StudyMaterial;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions: boolean;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-border/70 bg-secondary p-2.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{material.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {material.type}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>{material.author}</TableCell>
      <TableCell>{material.subject}</TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(material.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <StatusBadge status={material.status} />
      </TableCell>
      {showActions ? (
        <TableCell className="text-right">
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              className="rounded-xl"
              onClick={() => onReject?.(material._id)}
              size="sm"
              variant="outline"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => onApprove?.(material._id)}
              size="sm"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </Button>
          </div>
        </TableCell>
      ) : null}
    </TableRow>
  );
});

function StatusBadge({ status }: { status: StudyMaterial["status"] }) {
  return <DashboardStatusBadge status={status} />;
}

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
