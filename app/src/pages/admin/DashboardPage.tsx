import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  TrendingUp,
  Users,
  BookOpen,
  PlusCircle,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardPanel,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  DashboardActionList,
  DashboardPageHeader,
  DashboardStatCard,
} from "@/components/dashboard/dashboard-ui";

import {
  fetchApprovedMaterials,
  fetchPendingMaterials,
  updateMaterialStatus,
  type StudyMaterial,
} from "@/services/study-service";
import { buildApiUrl, parseApiData } from "@/services/api";
import { useDebounce } from "@/hooks/use-debounce";

import { ThemeCard } from "./components/ThemeCard";
import  MetricRow  from "./components/MetricRow";
import { MaterialTable } from "./components/MaterialTable";

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
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const { theme, setTheme } = useTheme();
  const themeMode = theme === "dark" || theme === "light" ? theme : "light";
  const handleThemeChange = useCallback(
    (value: "dark" | "light") => setTheme(value),
    [setTheme],
  );

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
      if (!debouncedSearch.trim()) return materials;
      const query = debouncedSearch.toLowerCase();
      return materials.filter(
        (material) =>
          material.title.toLowerCase().includes(query) ||
          material.author.toLowerCase().includes(query) ||
          material.subject.toLowerCase().includes(query),
      );
    },
    [debouncedSearch],
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
  }, [debouncedSearch]);

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
      value: new Intl.NumberFormat("en-US").format(stats?.totalUsers ?? 0),
      detail: `+${stats?.newUsers ?? 0} this week`,
      icon: Users,
    },
    {
      title: "Published Resources",
      value: new Intl.NumberFormat("en-US").format(stats?.totalResources ?? 0),
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
      value: new Intl.NumberFormat("en-US").format(pendingCount),
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
              <PlusCircle className="mr-2 h-4 w-4" />
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
        <Card className="flex flex-row items-center justify-between p-4 border">
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
        <Card className="flex flex-row items-center justify-between p-4 border">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Approved
            </p>
            <p className="text-lg font-semibold mt-1">{approvedCount}</p>
          </div>
          <Badge variant="success">Published</Badge>
        </Card>
        <Card className="flex flex-row items-center justify-between p-4 border">
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
        
        <Card className=" overflow-hidden">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Content Approvals
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Review and moderate submissions
                </CardDescription>
              </div>
              <form
                className="relative w-full sm:w-64"
                onSubmit={(e) => e.preventDefault()}
              >
                <InputGroup>
                  <InputGroupInput
                    aria-label="Search"
                    placeholder="Search materials…"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <InputGroupAddon>
                    <button type="submit" aria-label="Submit search">
                      <Search aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </InputGroupAddon>
                </InputGroup>
              </form>
            </div>
          </CardHeader>

          <CardPanel className="p-0">
            <Tabs defaultValue="pending" className="w-full">
              <div className="border-b px-5 pt-2">
                <TabsList variant="default" className="gap-2">
                  <TabsTab value="pending" className="relative">
                    Pending
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 text-[10px] font-medium"
                    >
                      {pendingCount}
                    </Badge>
                  </TabsTab>
                  <TabsTab value="approved" className="relative">
                    Approved
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1.5 py-0 text-[10px] font-medium"
                    >
                      {approvedCount}
                    </Badge>
                  </TabsTab>
                </TabsList>
              </div>

              <TabsPanel value="pending" className="p-0">
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

              <TabsPanel value="approved" className="p-0">
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
          <Card className="border">
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

          <Card className="border">
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
                className="space-y-1"
              />
            </CardPanel>
          </Card>

          <ThemeCard
            currentTheme={themeMode}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>
    </div>
  );
}
