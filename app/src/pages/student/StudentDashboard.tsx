import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, FileText, Upload, PlusCircle, Library, TrendingUp } from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUserMaterials, fetchBookmarkedMaterials } from "@/services/study-service";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a skeleton component

// Helper: Skeleton loader for stats cards
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-20 rounded-md" />
              <Skeleton className="h-20 rounded-md" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-16 rounded-md" />
              <Skeleton className="h-16 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useLocalAuth();
  const [uploadsCount, setUploadsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [materials, bookmarks] = await Promise.all([
          fetchUserMaterials(),
          fetchBookmarkedMaterials(),
        ]);
        
        setUploadsCount(materials.length);
        setBookmarksCount(bookmarks.length);
      } catch (error) {
        console.error("Failed to load student dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    {
      title: "My Uploads",
      value: uploadsCount,
      detail: "Study materials shared",
      icon: FileText,
      emptyMessage: "You haven't uploaded any notes yet.",
      emptyAction: { label: "Upload first note", link: "/dashboard/student/add-content" },
    },
    {
      title: "Bookmarks",
      value: bookmarksCount,
      detail: "Saved for quick access",
      icon: Bookmark,
      emptyMessage: "No bookmarks yet. Browse resources and save your favourites.",
      emptyAction: { label: "Browse resources", link: "/resources" },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome row */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
              <p className="text-muted-foreground">
                Here's a quick overview of your academic workspace. Keep sharing and learning.
              </p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3 transition-colors hover:bg-muted/30">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Branch</p>
                <p className="mt-1 text-base font-medium">
                  {user?.branch ? `${user.branch} Engg.` : "Not specified"}
                </p>
              </div>
              <div className="rounded-md border p-3 transition-colors hover:bg-muted/30">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Year</p>
                <p className="mt-1 text-base font-medium">{user?.year || "Not specified"}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" className="gap-2">
                <Upload className="h-4 w-4" />
                <Link to="/dashboard/student/add-content">Upload Notes</Link>
              </Button>
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                <Link to="/resources">Browse Resources</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Access your study tools</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[220px]">
              <div className="space-y-3 pr-4">
                <Link
                  to="/dashboard/student/profile"
                  className="flex items-center justify-between rounded-md border p-3 transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium">Edit Profile</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Update your details</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/dashboard/student/bookmarks"
                  className="flex items-center justify-between rounded-md border p-3 transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium">My Bookmarks</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">View saved materials</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Stats cards with empty states */}
      <div className="grid gap-4 md:grid-cols-2">
        {statCards.map((stat) => (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {stat.title}
                  </CardDescription>
                  <CardTitle className="mt-1 text-3xl font-semibold">{stat.value}</CardTitle>
                </div>
                <div className="rounded-md border p-2 bg-background">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stat.value === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-md bg-muted/20 p-3 text-sm">
                  <p className="text-muted-foreground">{stat.emptyMessage}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={stat.emptyAction.link} className="gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      {stat.emptyAction.label}
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{stat.detail}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optional: Recent activity placeholder (can be extended later) */}
      <Card className="border-dashed bg-muted/5">
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>Your latest uploads and bookmarks will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 py-8 text-center text-muted-foreground">
            <TrendingUp className="h-5 w-5" />
            <p className="text-sm">Start sharing notes to see your activity feed</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}