import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, FileText, UploadCloud, ChevronRight, Activity, TrendingUp, User } from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUserMaterials, fetchBookmarkedMaterials } from "@/services/study-service";
import { Spinner } from "@/components/ui/spinner";
import { gsap } from "gsap";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useLocalAuth();
  const [uploadsCount, setUploadsCount] = useState(0);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!loading && containerRef.current) {
      const q = gsap.utils.selector(containerRef.current);
      gsap.fromTo(
        q(".animate-in"),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out", clearProps: "all" }
      );
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="space-y-4 text-center">
          <Spinner className="mx-auto h-8 w-8 text-primary/60" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Initializing workspace...</p>
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
      trend: "+2 this week",
      trendUp: true,
      colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Bookmarks",
      value: bookmarksCount.toString(),
      detail: "Saved for quick access",
      icon: Bookmark,
      trend: "Ready to review",
      trendUp: false,
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6 pb-12" ref={containerRef}>
      
      {/* Welcome Hero Card */}
      <div className="animate-in grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden border-border/40 shadow-sm bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_80%,var(--color-primary)_10%)_0%,var(--card)_60%,color-mix(in_srgb,var(--card)_90%,var(--color-stone-100))_100%)] relative">
          {/* Abstract background shapes */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-32 left-10 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          
          <CardContent className="relative space-y-8 p-8 h-full flex flex-col justify-center">
            <div className="space-y-3">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-border/50 text-muted-foreground mb-2">
                <Activity className="h-3 w-3 mr-1.5 text-primary" /> Student Workspace
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Welcome back, <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">{user?.name?.split(" ")[0]}!</span>
              </h2>
              <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
                Here's a quick overview of your academic workspace. Keep sharing and learning to climb the leaderboard.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <Button className="h-10 px-5 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5" asChild>
                <Link to="/dashboard/student/add-content">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Notes
                </Link>
              </Button>
              <Button variant="secondary" className="h-10 px-5 bg-secondary/80 backdrop-blur hover:bg-secondary transition-all" asChild>
                <Link to="/resources">
                  Browse Resources
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Snapshot */}
        <Card className="animate-in border-border/50 shadow-sm flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> Profile Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Enrolled Branch</p>
              <p className="text-sm font-semibold text-foreground">{user?.branch ? `${user.branch} Engineering` : "Not specified"}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/20 p-4 transition-colors hover:bg-muted/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1">Academic Year</p>
              <p className="text-sm font-semibold text-foreground">{user?.year || "Not specified"}</p>
            </div>
            
            <div className="pt-2 mt-auto">
              <Link
                to="/dashboard/student/profile"
                className="group flex w-full items-center justify-between rounded-lg border border-transparent p-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/50 hover:text-foreground"
              >
                Edit Full Profile
                <ChevronRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat, i) => (
          <Card key={stat.title} className={cn("animate-in border-border/50 shadow-sm overflow-hidden relative group")}>
            {/* Subtle hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none dark:from-white/5" />
            
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardDescription>
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", stat.colorClass)}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                {stat.trendUp ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> : <Activity className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className={stat.trendUp ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>{stat.trend}</span>
                <span className="text-muted-foreground/60 px-1">•</span>
                <span>{stat.detail}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Quick Actions Card */}
        <Card className="animate-in border-border/50 shadow-sm bg-secondary/10 lg:col-span-1 md:col-span-2">
          <CardHeader className="pb-3 border-b border-border/30">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[120px]">
              <div className="flex flex-col p-2">
                <Link
                  to="/dashboard/student/bookmarks"
                  className="group flex items-center justify-between rounded-md p-3 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-3">
                    <Bookmark className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
                    <div>
                      <p className="text-sm font-medium text-foreground">View Bookmarks</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Jump to saved materials</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}