import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  FileText,
  UploadCloud,
  ArrowRight,
  User,
} from "lucide-react";

import { useLocalAuth } from "@/hooks/use-local-auth";
import { fetchUserMaterials, fetchBookmarkedMaterials } from "@/services/study-service";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        console.error("Failed to load dashboard stats", error);
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
          <Spinner className="mx-auto h-8 w-8" />
          <p className="text-sm text-muted-foreground">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "Student";

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>

          <p className="text-muted-foreground">
            Manage your study materials, bookmarks, and academic resources.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button >
              <UploadCloud className="mr-2 h-4 w-4" />
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
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  My Uploads
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                  {uploadsCount}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Study materials shared
                </p>
              </div>

              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Bookmarks
                </p>

                <h2 className="mt-2 text-3xl font-semibold">
                  {bookmarksCount}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Saved materials
                </p>
              </div>

              <Bookmark className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Profile
                </p>

                <h2 className="mt-2 text-lg font-semibold">
                  {user?.branch || "Not Set"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {user?.year || "Year not specified"}
                </p>
              </div>

              <User className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Quick Actions
          </h2>

          <p className="text-sm text-muted-foreground">
            Frequently used shortcuts.
          </p>
        </div>

        <Card>
          <CardContent className="p-2">
            <Link
              to="/dashboard/student/add-content"
              className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="font-medium">
                Upload New Notes
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/dashboard/student/bookmarks"
              className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="font-medium">
                View Bookmarks
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/resources"
              className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="font-medium">
                Browse Resources
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to="/dashboard/student/profile"
              className="flex items-center justify-between rounded-md px-4 py-3 hover:bg-muted transition-colors"
            >
              <span className="font-medium">
                Edit Profile
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}