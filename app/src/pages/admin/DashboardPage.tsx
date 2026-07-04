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
  BookOpen,
  GraduationCap,
  Sparkles,
  Eye,
  PlusCircle,
  ChevronRight,
} from "lucide-react";
import { useTheme, type Theme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardPanel,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  DashboardPageHeader,
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
        if (!token) return;

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
      if (!searchQuery.trim()) return materials;
      const query = searchQuery.toLowerCase();
      return materials.filter(
        (material) =>
          material.title.toLowerCase().includes(query) ||
          material.author.toLowerCase().includes(query) ||
          material.subject.toLowerCase().includes(query),
      );
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
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
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
      detail: `+${stats?.newResources ?? 0} new`,
      icon: BookOpen,
    },
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
      detail: `From ${totalReviewed} reviews`,
      icon: CheckCircle2,
    },
    {
      title: "Pending Queue",
      value: formatValue(pendingCount),
      detail: pendingCount === 0 ? "All clear" : "Awaiting review",
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardPageHeader
        title="Dashboard"
        description="Welcome back, Admin. Here’s an overview of your content."
        actions={
          <>
            <Button variant="outline" size="sm">
              <PlusCircle />
              New
            </Button>
            <Button size="sm">Review Submissions</Button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            label={stat.title}
            value={stat.value}
            description={stat.detail}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-row items-center justify-between p-4 border shadow-none">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Pending Reviews
            </p>
            <p className="text-lg font-semibold mt-1">{pendingCount}</p>
          </div>
          <Badge variant={pendingCount > 0 ? "warning" : "secondary"}>
            {pendingCount > 0 ? "Needs review" : "All clear"}
          </Badge>
        </Card>
        <Card className="flex flex-row items-center justify-between p-4 border shadow-none">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Approved
            </p>
            <p className="text-lg font-semibold mt-1">{approvedCount}</p>
          </div>
          <Badge variant="success">Published</Badge>
        </Card>
        <Card className="flex flex-row items-center justify-between p-4 border shadow-none">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Approval Rate
            </p>
            <p className="text-lg font-semibold mt-1">{approvalRate}%</p>
          </div>
          <Badge variant={approvalRate >= 70 ? "success" : "warning"}>
            {approvalRate >= 70 ? "Good" : "Needs improvement"}
          </Badge>
        </Card>
      </div>    

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Table */}
        <Card className="border shadow-none overflow-hidden">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Content Approvals</CardTitle>
                <CardDescription className="text-xs">
                  Review and moderate submissions.
                </CardDescription>
              </div>
              {/* Search – full width on mobile, fixed width on larger screens */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-transparent pl-8 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </CardHeader>

          <CardPanel className="p-0">
            <Tabs defaultValue="pending" className="w-full">
              <div className="border-b px-4">
                <TabsList
                  variant={"default"}
                >
                  <TabsTab value="pending">
                    Pending
                    <Badge variant="secondary" size="sm" className="ml-1.5">
                      {pendingCount}
                    </Badge>
                  </TabsTab>
                  <TabsTab value="approved">
                    Approved
                    <Badge variant="secondary" size="sm" className="ml-1.5">
                      {approvedCount}
                    </Badge>
                  </TabsTab>
                </TabsList>
              </div>

              <TabsPanel value="pending" className="mt-0">
                <MaterialTable
                  materials={pagedPending}
                  showActions
                  onApprove={handleApproveMaterial}
                  onReject={handleRejectMaterial}
                  onPageChange={setPendingPage}
                  page={pendingPage}
                  pageSize={DASHBOARD_PAGE_SIZE}
                  total={filteredPending.length}
                  emptyMessage="No pending submissions."
                  emptyIcon={Clock3}
                />
              </TabsPanel>

              <TabsPanel value="approved" className="mt-0">
                <MaterialTable
                  materials={pagedApproved}
                  showActions={false}
                  onPageChange={setApprovedPage}
                  page={approvedPage}
                  pageSize={DASHBOARD_PAGE_SIZE}
                  total={filteredApproved.length}
                  emptyMessage="No approved content."
                  emptyIcon={CheckCircle2}
                />
              </TabsPanel>
            </Tabs>
          </CardPanel>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border shadow-none">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-medium">
                Queue Status
              </CardTitle>
              <CardDescription className="text-xs">
                Live metrics
              </CardDescription>
            </CardHeader>
            <CardPanel className="px-4 pb-4 space-y-3">
              <MetricRow
                icon={TrendingUp}
                label="Approval Rate"
                value={`${approvalRate}%`}
              />
              <MetricRow
                icon={BookOpen}
                label="New Resources"
                value={String(stats?.newResources ?? 0)}
              />
              <MetricRow
                icon={Clock3}
                label="Pending Items"
                value={String(pendingCount)}
              />
            </CardPanel>
          </Card>

          <Card className="border shadow-none">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardPanel className="px-2 pb-2">
              <DashboardActionList
                framed={false}
                actions={[
                  {
                    label: "Manage Approvals",
                    description: "Review pending submissions",
                    to: "/admin/approvals",
                    icon: CheckCircle2,
                  },
                  {
                    label: "Manage Students",
                    description: "View and edit user accounts",
                    to: "/admin/students",
                    icon: Users,
                  },
                ]}
                className="space-y-1" // adds proper gap between actions
              />
            </CardPanel>
          </Card>

          <ThemeCard currentTheme={theme} onThemeChange={setTheme} />
        </div>
      </div>
    </div>
  );
}

// ===== Theme Card =====
function ThemeCard({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: "dark" | "light" | "system";
  onThemeChange: (theme: "dark" | "light" | "system") => void;
}) {
  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <Card className="border shadow-none">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-medium">Appearance</CardTitle>
      </CardHeader>
      <CardPanel className="px-4 pb-4 space-y-1">
        {options.map(({ value, icon: Icon, label }) => (
          <Button
            key={value}
            variant="ghost"
            onClick={() => onThemeChange(value)}
            className={cn(
              "w-full justify-start",
              currentTheme === value
                ? "bg-muted/60 font-semibold"
                : "font-normal",
            )}
          >
            <Icon />
            {label}
            {currentTheme === value && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </Button>
        ))}
      </CardPanel>
    </Card>
  );
}

// ===== Metric Row =====
function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

// ===== Material Table =====
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
        title={emptyMessage}
        description="Check back later or adjust your search filter."
        icon={EmptyIcon}
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <ScrollArea
        className="h-[400px] [&_[data-slot=table-container]]:overflow-visible"
        scrollbarGutter
      >
        <Table className="table-fixed w-full min-w-[850px]">
          <TableHeader className="bg-muted/30">
            <TableRow className="border-b">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[30%] min-w-[200px]">
                Content
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[120px]">
                Author
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[120px]">
                Subject
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[100px]">
                Submitted
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground w-[10%] min-w-[100px]">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-[15%] min-w-[180px]">
                {showActions ? "Actions" : ""}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((material) => (
              <MaterialRow
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

      {total > pageSize && (
        <Pagination className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>
            {`${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
          </span>
          <PaginationContent className="flex items-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                render={<button />}
                onClick={() => onPageChange?.(Math.max(1, page - 1))}
                disabled={page === 1}
                className={cn(
                  "h-7 px-2 text-xs",
                  page === 1 && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-2 tabular-nums text-xs">
                {page} / {pageCount}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                render={<button />}
                onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
                disabled={page === pageCount}
                className={cn(
                  "h-7 px-2 text-xs",
                  page === pageCount && "pointer-events-none opacity-50",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

// ===== Material Row =====
const MaterialRow = memo(function MaterialRow({
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
    <TableRow className="border-b hover:bg-muted/20">
      <TableCell className="py-2.5 truncate max-w-[200px]">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{material.title}</span>
          <span className="ml-1 text-xs text-muted-foreground capitalize shrink-0">
            ({material.type})
          </span>
        </div>
      </TableCell>
      <TableCell className="py-2.5 text-sm truncate max-w-[120px]">
        {material.author}
      </TableCell>
      <TableCell className="py-2.5 text-sm truncate max-w-[120px]">
        {material.subject}
      </TableCell>
      <TableCell className="py-2.5 text-sm text-muted-foreground">
        {new Date(material.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </TableCell>
      <TableCell className="py-2.5">
        <DashboardStatusBadge status={material.status} />
      </TableCell>
      <TableCell className="py-2.5 text-right w-[15%] min-w-[180px]">
        {showActions && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onReject?.(material._id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <XCircle />
              Reject
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => onApprove?.(material._id)}
              className="text-primary hover:bg-primary/10"
            >
              <CheckCircle2 />
              Approve
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
});

// ===== Monitor Icon =====
function Monitor(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
