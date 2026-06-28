import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { cn } from "@/lib/utils";

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
            <ScrollArea className="flex-1" disableLenis>
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
            </ScrollArea>
          </SidebarContent>

          <SidebarFooter className="p-3 border-t border-border">
            <Menu>
              <MenuTrigger
                render={
                  <Button
                    variant="ghost"
                    className="w-full h-auto flex items-center justify-start gap-3 p-2 rounded-md hover:bg-secondary transition-colors focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  />
                }
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={user?.avatar} />
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
                <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0 opacity-50" />
              </MenuTrigger>

              <MenuPopup
                align="end"
                side="top"
                className="w-56 rounded-xl shadow-lg"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  My Account
                </div>
                <MenuSeparator />

                <MenuItem
                  render={
                    <Link
                      to="/dashboard/student/profile"
                      className="flex w-full cursor-pointer items-center text-sm py-1.5"
                    />
                  }
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Profile Settings
                </MenuItem>

                <MenuItem
                  onClick={logout}
                  className="rounded-md text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-sm py-1.5 mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
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
              {/* Coss UI standard InputGroup */}
              <div className="relative hidden w-full max-w-xs lg:block">
                <InputGroup className="h-8">
                  <InputGroupAddon>
                    <Search
                      aria-hidden="true"
                      className="h-4 w-4 text-muted-foreground"
                    />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search materials..."
                    type="search"
                    className="h-8 text-sm placeholder:text-muted-foreground"
                  />
                  <InputGroupAddon>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <NavbarThemeToggle />

              <Button size="icon" variant="ghost" className="h-8 w-8 relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <ScrollArea className="flex-1 bg-muted/30">
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
