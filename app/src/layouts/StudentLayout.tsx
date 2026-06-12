import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  ChevronRight,
  Edit2,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  UploadCloud,
  User,
  Files,
  X,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/ui/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { motion, AnimatePresence } from "framer-motion";

const navSections = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/student" },
      { icon: UploadCloud, label: "Upload Material", path: "/dashboard/student/add-content" },
      { icon: Files, label: "My Uploads", path: "/dashboard/student/uploads" },
    ],
  },
  {
    label: "Library",
    items: [
      { icon: Bookmark, label: "Bookmarks", path: "/dashboard/student/bookmarks" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getInitials } = useLocalAuth();

  useEffect(() => {
    // Redirect if not student
    if (user && user.role !== "student") {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "faculty") navigate("/dashboard/faculty");
      else navigate("/");
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

  const displayName = user?.name || "Student User";
  const displayEmail = user?.email || "student@studyhub.com";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <div className="mx-auto flex min-h-screen w-full overflow-hidden">
        
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl transition-transform duration-300 md:flex md:w-64 md:relative md:translate-x-0 lg:w-72",
            sidebarOpen ? "translate-x-0 flex" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <Link className="min-w-0 flex items-center gap-2 transition-opacity hover:opacity-80" to="/dashboard/student">
              <Logo />
            </Link>
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-transparent">
              Student
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -mr-2 h-8 w-8 text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Separator className="opacity-50" />

          <ScrollArea className="flex-1 px-4 py-6">
            <div className="space-y-8">
              {navSections.map((section) => (
                <div key={section.label} className="space-y-2.5">
                  <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;

                      return (
                        <Link key={item.path} to={item.path} className="block outline-none">
                          <div
                            className={cn(
                              "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="activeNavIndicator"
                                className="absolute inset-0 rounded-xl bg-primary/10 border border-primary/20"
                                initial={false}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                              />
                            )}
                            <div className="relative flex items-center gap-3 z-10">
                              <item.icon className={cn("h-4.5 w-4.5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight
                              className={cn(
                                "relative z-10 h-4 w-4 transition-all duration-200",
                                isActive ? "opacity-100 translate-x-0 text-primary" : "opacity-0 -translate-x-2 text-muted-foreground group-hover:opacity-100 group-hover:translate-x-0"
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

          <div className="p-4 mt-auto">
            <div className="rounded-2xl border border-border/50 bg-background/50 p-3 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-border/50 shadow-sm ring-2 ring-transparent transition-all hover:ring-primary/20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col h-screen">
          
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/80 px-4 backdrop-blur-xl sm:gap-6 sm:px-6 lg:px-8">
            <Button
              className="md:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              size="icon"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1 flex items-center">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <span className="text-muted-foreground font-medium text-sm">Student</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-muted-foreground/40" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-sm">{currentPage}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Search input */}
              <div className="relative hidden w-full max-w-[240px] lg:block">
               <InputGroup className="bg-muted/50 border-border/50 focus-within:bg-background transition-colors rounded-full">
                <InputGroupAddon className="pl-3">
                  <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search materials..."
                  type="search"
                  className="h-9 text-sm rounded-full border-none shadow-none focus-visible:ring-0 bg-transparent px-2"
                />
              </InputGroup>
              </div>

              <NavbarThemeToggle />

              <Button className="relative h-9 w-9 rounded-full border-border/50 bg-muted/30 hover:bg-muted" size="icon" variant="outline">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-0 h-9 w-9 ring-2 ring-transparent transition-all focus-visible:ring-primary/20 hover:ring-border">
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/50 shadow-xl" sideOffset={8}>
                  <DropdownMenuLabel className="p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground leading-none">{displayName}</p>
                      <p className="text-xs text-muted-foreground leading-none mt-1.5">
                        {displayEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <div className="p-1">
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link to="/dashboard/student/profile" className="flex items-center w-full">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-lg text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10 cursor-pointer mt-1"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main page content */}
          <ScrollArea className="flex-1 bg-muted/10">
            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="mx-auto w-full max-w-5xl"
              >
                <Outlet />
              </motion.div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
