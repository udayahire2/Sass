import { useEffect, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
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
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background px-4 sm:gap-6 sm:px-6 lg:px-8">
            <SidebarTrigger className="h-8 w-8 -ml-2 text-muted-foreground" />

            <div className="min-w-0 flex-1 flex items-center">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">Student</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-foreground">
                      {currentPage}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/search")}
                className="gap-2"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search
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
