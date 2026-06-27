import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileQuestion,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  SearchIcon,
  Users,
} from "lucide-react";

import { useLocalAuth } from "@/hooks/use-local-auth";
import { NavbarThemeToggle } from "@/components/layout/navbar/navbar-theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const navSections = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
      { icon: ClipboardCheck, label: "Approvals", path: "/admin/approvals" },
      { icon: Users, label: "Students", path: "/admin/students" },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: BookOpen, label: "Subjects", path: "/admin/subjects" },
      { icon: BookOpen, label: "Syllabus", path: "/admin/syllabus" },
      { icon: BookOpen, label: "Resources", path: "/admin/resources" },
      {
        icon: FileQuestion,
        label: "IMP Questions",
        path: "/admin/imp-questions",
      },
      { icon: Files, label: "Sample Papers", path: "/admin/sample-papers" },
      { icon: Users, label: "Faculty", path: "/admin/faculty" },
      { icon: Users, label: "Feedback", path: "/admin/feedback" },
    ],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getInitials } = useLocalAuth();

  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    } else if (!user && !localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate, user]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const currentPage = useMemo(() => {
    return (
      navSections
        .flatMap((section) => section.items)
        .find((item) => item.path === location.pathname)?.label ?? "Dashboard"
    );
  }, [location.pathname]);

  const displayName = user?.name || "Admin User";
  const displayEmail = user?.email || "admin@studyhub.com";

  return (
    <div className="h-screen bg-background text-foreground">
      <div className="mx-auto flex h-screen w-full max-w-screen-2xl">
        {/* Mobile overlay */}
        <div
          aria-hidden="true"
          className={cn(
            "fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-70 border-r bg-background transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center justify-between px-4">
              <Link className="min-w-0" to="/admin/dashboard">
                <Logo />
              </Link>
              <Badge variant="outline">Admin</Badge>
            </div>

            <Separator />

            <ScrollArea className="flex-1 px-3 pb-3">
              <div className="space-y-5 py-3">
                {navSections.map((section) => (
                  <div key={section.label} className="space-y-2">
                    <div className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {section.label}
                    </div>

                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive =
                          location.pathname === item.path ||
                          (location.pathname === "/admin" &&
                            item.path === "/admin/dashboard");

                        return (
                          <Link key={item.path} to={item.path}>
                            <div
                              className={cn(
                                "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                              </div>

                              <ChevronRight
                                className={cn(
                                  "h-4 w-4 transition-opacity",
                                  isActive ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-3 w-full justify-start"
                  onClick={logout}
                  variant="outline"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 border-b bg-background">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                size="icon"
                variant="outline"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <span className="text-muted-foreground">Admin</span>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <InputGroup className="w-fit">
                <InputGroupInput
                  aria-label="Search"
                  placeholder="Search students, approvals, resources..."
                  type="search"
                />
                <InputGroupAddon>
                  <SearchIcon aria-hidden="true" />
                </InputGroupAddon>
              </InputGroup>
              <NavbarThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full border p-0 outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {displayEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <main className="px-4 py-6 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-6xl">
                <Outlet />
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}