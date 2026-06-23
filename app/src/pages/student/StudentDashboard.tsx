import { useEffect, useState } from "react";
import {
  Bookmark,
  FileText,
  UploadCloud,
  ArrowRight,
  User,
} from "lucide-react";

import { useLocalAuth } from "@/hooks/use-local-auth";
import { fetchUserMaterials, fetchBookmarkedMaterials } from "@/services/study-service";

import { Spinner } from "@/components/ui/spinner";
import {
  DashboardActionList,
  DashboardLinkButton,
  DashboardPageHeader,
  DashboardStatCard,
} from "@/components/dashboard/dashboard-ui";

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
    <div className="flex flex-col gap-8 pb-10">
      <DashboardPageHeader
        actions={
          <>
            <DashboardLinkButton
              icon={UploadCloud}
              to="/dashboard/student/add-content"
            >
              Upload Notes
            </DashboardLinkButton>
            <DashboardLinkButton
              icon={ArrowRight}
              iconPosition="end"
              to="/resources"
              variant="outline"
            >
              Browse Resources
            </DashboardLinkButton>
          </>
        }
        description="Manage your study materials, bookmarks, and academic resources."
        title={<>Welcome back, {firstName}</>}
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardStatCard
          description="Study materials shared"
          icon={FileText}
          label="My Uploads"
          value={uploadsCount}
        />
        <DashboardStatCard
          description="Saved materials"
          icon={Bookmark}
          label="Bookmarks"
          value={bookmarksCount}
        />
        <DashboardStatCard
          description={user?.year || "Year not specified"}
          icon={User}
          label="Profile"
          value={user?.branch || "Not set"}
        />
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Frequently used shortcuts.
          </p>
        </div>
        <DashboardActionList
          actions={[
            {
              icon: UploadCloud,
              label: "Upload New Notes",
              to: "/dashboard/student/add-content",
            },
            {
              icon: Bookmark,
              label: "View Bookmarks",
              to: "/dashboard/student/bookmarks",
            },
            { icon: FileText, label: "Browse Resources", to: "/resources" },
            {
              icon: User,
              label: "Edit Profile",
              to: "/dashboard/student/profile",
            },
          ]}
        />
      </section>
    </div>
  );
}
