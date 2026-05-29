import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, FileText, Upload } from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchUserMaterials, fetchBookmarkedMaterials } from "@/services/study-service";
import { Spinner } from "@/components/ui/spinner";

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
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <Spinner className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "My Uploads",
      value: uploadsCount.toString(),
      detail: "Study materials shared",
      icon: FileText,
    },
    {
      title: "Bookmarks",
      value: bookmarksCount.toString(),
      detail: "Saved for quick access",
      icon: Bookmark,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome row */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}!</h2>
              <p className="text-muted-foreground">
                Here's a quick overview of your academic workspace. Keep sharing and learning.
              </p>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Branch</p>
                <p className="mt-1 text-base font-medium">{user?.branch ? `${user.branch} Engg.` : "Not specified"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Year</p>
                <p className="mt-1 text-base font-medium">{user?.year || "Not specified"}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" >
                  <Upload className="mr-2 h-4 w-4" />
                <Link to="/dashboard/student/add-content">
                  Upload Notes
                </Link>
              </Button>
              <Button variant="ghost" >
                  <ArrowRight className="ml-2 h-4 w-4" />
                <Link to="/resources">
                  Browse Resources
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Access your study tools</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/dashboard/student/profile"
              className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">Edit Profile</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Update your details</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/dashboard/student/bookmarks"
              className="flex items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">My Bookmarks</p>
                <p className="mt-0.5 text-xs text-muted-foreground">View saved materials</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {stat.title}
                  </CardDescription>
                  <CardTitle className="mt-1 text-3xl font-semibold">{stat.value}</CardTitle>
                </div>
                <div className="rounded-md border p-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}