import { useEffect, useMemo } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Edit2,
  LayoutDashboard,
  LogOut,
  Search,
  UploadCloud,
  User,
  Files,
  ChevronUp,
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
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { Logo } from "@/components/ui/logo";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";

const navSections = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
      {
        icon: UploadCloud,
        label: "Upload Material",
        path: "/dashboard/student/add-content",
      },
      { icon: Files, label: "My Uploads", path: "/dashboard/student/uploads" },
    ],
  },
  {
    label: "Library",
    items: [
      {
        icon: Bookmark,
        label: "Bookmarks",
        path: "/dashboard/student/bookmarks",
      },
      { icon: Edit2, label: "Notes", path: "/notes" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: User, label: "Profile", path: "/dashboard/student/profile" },
    ],
  },
];

export default function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getInitials } = useLocalAuth();

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
      navSections
        .flatMap((section) => section.items)
        .find((item) => item.path === location.pathname)?.label ?? "Dashboard"
    );
  }, [location.pathname]);

  const displayName = user?.name || "Student User";
  const displayEmail = user?.email || "student@studyhub.com";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="h-14 flex flex-row items-center justify-between px-4 border-b border-border bg-background">
            <Link
              className="min-w-0 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
              to="/dashboard/student"
            >
              <Logo />
            </Link>
            <Badge
              variant="secondary"
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              Student
            </Badge>
          </SidebarHeader>

          <SidebarContent>
            <div className="space-y-4 py-4">
              {navSections.map((section) => (
                <SidebarGroup key={section.label}>
                  <SidebarGroupLabel className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={isActive}
                              render={<Link to={item.path} />}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </div>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border">
            <Menu>
              <MenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-full flex items-center justify-start gap-3 p-2 rounded-md hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  />
                }
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.avatar} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start overflow-hidden text-left flex-1">
                  <span className="truncate text-sm font-medium leading-none mb-1.5">
                    {displayName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground leading-none">
                    {displayEmail}
                  </span>
                </div>
                <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-50" aria-hidden="true" />
              </MenuTrigger>

              <MenuPopup className="w-56 rounded-xl shadow-lg">
                <MenuItem render={<Link to="/dashboard/student/profile" />}>
                  <User className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  Profile Settings
                </MenuItem>
                <MenuSeparator />
                <MenuItem onClick={logout} closeOnClick>
                  <LogOut className="mr-2 h-4 w-4" aria-hidden="true" /> Sign out
                </MenuItem>
              </MenuPopup>
            </Menu>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

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
          <ScrollArea className="h-full ">
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
