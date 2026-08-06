import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { Search, Home } from "lucide-react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { NavbarThemeToggle } from "@/components/layout/navbar/navbar-theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudentSidebar, STUDENT_NAV_SECTIONS } from "./components/StudentSidebar";

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useLocalAuth();

  useEffect(() => {
    if (user && user.role !== "student") {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "faculty") navigate("/dashboard/faculty");
      else navigate("/");
    } else if (!user && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate, user]);

  const currentPage = useMemo(() => {
    return (
      STUDENT_NAV_SECTIONS
        .flatMap((section) => section.items)
        .find((item) => item.path === location.pathname)?.label ?? "Dashboard"
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <SidebarProvider>
        <StudentSidebar />

        <SidebarInset className="flex flex-col flex-1 h-screen w-full min-w-0 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:gap-6 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="h-8 w-8 -ml-2 text-muted-foreground hover:text-foreground transition-colors" />

              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <Link
                      to="/"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                      title="Go to Homepage"
                    >
                      <Home className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Home</span>
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-xs text-muted-foreground">Student</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-xs text-foreground">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Go to Homepage Pop Icon Button */}
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => navigate("/")}
                        className="relative h-9 w-9 rounded-lg border border-border/80 bg-background/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-200 active:scale-90 shadow-xs group"
                        aria-label="Go to Root Homepage"
                      />
                    }
                  >
                    <Home
                      className="h-4 w-4 transition-transform duration-200 group-hover:scale-115 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </TooltipTrigger>
                  <TooltipPopup side="bottom" className="font-medium text-xs">
                    Go to Homepage
                  </TooltipPopup>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/search")}
                className="gap-2 h-9"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Search</span>
                <KbdGroup className="-me-1">
                  <Kbd>Ctrl</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </Button>
              <NavbarThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <ScrollArea className="h-full">
            <main className="flex-1 overflow-y-auto bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-6xl animate-in fade-in duration-500">
                <Outlet />
              </div>
            </main>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
