"use client";

import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  FileText,
  Compass,
  Sparkles,
  Library,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  FolderOpen,
  Home,
  Search,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { Badge } from "@/components/ui/badge";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
} from "@/components/ui/tooltip";
import { useTheme } from "@/components/theme-provider";
import { type User as AuthUser, useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerPanel,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
} from "@/components/ui/menu";

// SVG imports
import Folder from "@/components/svgs/folder";
import UserSVG from "@/components/svgs/user";
import NotesSVG from "@/components/svgs/notes";
import ClipboardSVG from "@/components/svgs/clipboard";
import QuestionPaperSVG from "@/components/svgs/question-paper";
import { ChatBubbleSVG } from "@/components/svgs/bubble-question";
import { OpenBookSVG } from "@/components/svgs/open-book";

function getDashboardPath(user: AuthUser | null) {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "faculty") return "/dashboard/faculty";
  if (user?.role === "student") return "/dashboard/student";
  return "/";
}

/* -------------------------------------------------------------------------- */
/*  Search Trigger Component with OS-Aware Shortcut                           */
/* -------------------------------------------------------------------------- */
function NavbarSearch() {
  const navigate = useNavigate();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.userAgent));
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate("/search")}
      className="group h-8 gap-2 rounded-full border-border/60 bg-muted/30 px-3 text-xs font-normal text-muted-foreground shadow-2xs transition-all duration-200 hover:border-border hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
      aria-label="Open search dialog (Press Ctrl+K or Cmd+K)"
    >
      <Search className="h-3.5 w-3.5 text-muted-foreground/70 transition-colors group-hover:text-foreground" aria-hidden="true" />
      <span className="hidden sm:inline">Search resources...</span>
      <span className="inline sm:hidden">Search...</span>
      <KbdGroup className="-me-1 ms-1 opacity-80 group-hover:opacity-100">
        <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Navigation Links with Coss Menu Primitives                       */
/* -------------------------------------------------------------------------- */
function DesktopNavLinks() {
  const location = useLocation();
  const { user } = useLocalAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const studyLinks = [
    "/study-stock",
    "/resources",
    "/syllabus",
    "/study-material/imp-questions",
    "/study-material/sample-papers",
  ];

  const isStudyActive = useMemo(
    () => studyLinks.some((l) => isActive(l)),
    [location.pathname]
  );

  const supportLinks =
    user && user.role !== "admin"
      ? [
          { path: "/feedback", label: "Feedback" },
          { path: "/how-to-use", label: "How to use" },
        ]
      : [];

  const isSupportActive = useMemo(
    () => supportLinks.some((l) => isActive(l.path)),
    [location.pathname, user]
  );

  return (
    <nav className="flex items-center gap-1.5" aria-label="Main Navigation">
      {/* Home Link */}
      <Link
        to="/"
        className={cn(
          "inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-all duration-200",
          isActive("/")
            ? "border border-border/50 bg-accent/90 font-semibold text-foreground shadow-2xs"
            : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
        )}
      >
        Home
      </Link>

      {/* Study Dropdown Menu */}
      <Menu>
        <MenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent/40 hover:text-foreground",
                isStudyActive && "border border-border/50 bg-accent/90 font-semibold text-foreground shadow-2xs"
              )}
            >
              <span>Study</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Button>
          }
        />
        <MenuPopup align="start" sideOffset={8} className="w-[530px] rounded-xl border border-border/50 bg-popover/95 p-2 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/25">
          <MenuGroup>
            <MenuGroupLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Study Hub & Materials
            </MenuGroupLabel>

            <div className="grid grid-cols-2 gap-1 p-1">
              <MenuItem
                render={
                  <Link
                    to="/study-stock"
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/70"
                  />
                }
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <OpenBookSVG />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <span className="truncate">Digital Library</span>
                    <Badge variant="info" size="sm" className="h-4 px-1.5 text-[9px] font-semibold">
                      Popular
                    </Badge>
                  </div>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    Textbooks, notes & study guides
                  </p>
                </div>
              </MenuItem>

              <MenuItem
                render={
                  <Link
                    to="/syllabus"
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/70"
                  />
                }
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <ClipboardSVG />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">Course Syllabus</div>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    Module structures & grading criteria
                  </p>
                </div>
              </MenuItem>

              <MenuItem
                render={
                  <Link
                    to="/study-material/imp-questions"
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/70"
                  />
                }
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <ChatBubbleSVG />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">Question Bank</div>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    High-yield practice questions
                  </p>
                </div>
              </MenuItem>

              <MenuItem
                render={
                  <Link
                    to="/study-material/sample-papers"
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-all duration-150 hover:bg-accent/70"
                  />
                }
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                  <QuestionPaperSVG />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">Past Exam Papers</div>
                  <p className="line-clamp-1 text-[11px] text-muted-foreground">
                    Previous years solved archives
                  </p>
                </div>
              </MenuItem>
            </div>
          </MenuGroup>

          <MenuSeparator className="my-1.5 border-border/40" />

          <MenuItem
            render={
              <Link
                to="/resources"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 hover:bg-accent/80"
              />
            }
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-amber-500" />
              <span className="font-semibold text-foreground">Explore All Resources</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" size="sm" className="h-4 px-1.5 text-[9px] font-medium">
                Catalog
              </Badge>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </MenuItem>
        </MenuPopup>
      </Menu>

      {/* Support / Resources Menu */}
      {supportLinks.length > 0 && (
        <Menu>
          <MenuTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground transition-all duration-200 hover:bg-accent/40 hover:text-foreground",
                  isSupportActive && "border border-border/50 bg-accent/90 font-semibold text-foreground shadow-2xs"
                )}
              >
                <span>Resources</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            }
          />
          <MenuPopup align="start" sideOffset={8} className="w-60 rounded-xl border border-border/50 bg-popover/95 p-1.5 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/25">
            <MenuGroup>
              <MenuGroupLabel className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                Help & Community
              </MenuGroupLabel>

              <MenuItem
                render={
                  <Link
                    to="/feedback"
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-accent/70"
                  />
                }
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-pink-500/10 text-pink-500 dark:bg-pink-500/20">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">Give Feedback</div>
                  <p className="text-[10px] text-muted-foreground truncate">Submit suggestions & ideas</p>
                </div>
              </MenuItem>

              <MenuItem
                render={
                  <Link
                    to="/how-to-use"
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-accent/70"
                  />
                }
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20">
                  <HelpCircle className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground">How to Use</div>
                  <p className="text-[10px] text-muted-foreground truncate">Platform guides & FAQ</p>
                </div>
              </MenuItem>
            </MenuGroup>
          </MenuPopup>
        </Menu>
      )}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Theme Toggle Component                                                    */
/* -------------------------------------------------------------------------- */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 rounded-lg text-muted-foreground transition-all duration-200 hover:bg-accent/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform duration-300 dark:text-slate-200 hover:-rotate-12" />
            )}
          </Button>
        }
      />
      <TooltipPopup side="bottom" sideOffset={6} className="rounded-md border border-border/40 bg-popover px-2.5 py-1 text-[11px] font-medium shadow-md">
        {theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
      </TooltipPopup>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop User Menu                                                          */
/* -------------------------------------------------------------------------- */
function UserMenu() {
  const { user, logout, getInitials } = useLocalAuth();

  return (
    <div className="flex items-center">
      <Menu>
        <MenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative h-8 w-8 rounded-full p-0 ring-1 ring-border/60 transition-all duration-200 hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="User account menu"
            >
              {user?.avatar ? (
                <Avatar className="h-7.5 w-7.5">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              ) : user ? (
                <DefaultAvatar name={user.name} size={30} />
              ) : (
                <Avatar className="h-7.5 w-7.5">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </Button>
          }
        />
        <MenuPopup align="end" sideOffset={8} className="w-64 rounded-xl border border-border/50 bg-popover/95 p-1.5 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/25">
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/40 px-3 py-2.5">
                <div className="relative shrink-0">
                  {user.avatar ? (
                    <Avatar className="h-9 w-9 border border-border/50">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <DefaultAvatar name={user.name} size={36} />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                    <Badge variant="outline" size="sm" className="h-4 px-1.5 capitalize text-[9px] font-medium">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <MenuSeparator className="my-1.5 border-border/40" />

              <MenuGroup>
                <MenuItem
                  render={
                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : user.role === "faculty"
                          ? "/dashboard/faculty"
                          : "/dashboard/student"
                      }
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/70"
                    />
                  }
                >
                  <UserSVG className="h-4 w-4 opacity-80" />
                  <span>{user.role === "student" || !user.role ? "View Profile" : "Dashboard"}</span>
                </MenuItem>

                <MenuItem
                  render={
                    <Link
                      to="/notes"
                      className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent/70"
                    />
                  }
                >
                  <NotesSVG className="h-4 w-4 opacity-80" />
                  <span>My Saved Notes</span>
                </MenuItem>
              </MenuGroup>

              <MenuSeparator className="my-1.5 border-border/40" />

              <MenuItem
                variant="destructive"
                onClick={logout}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </MenuItem>
            </>
          ) : (
            <MenuGroup>
              <MenuItem
                render={
                  <Link
                    to="/login"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent/70"
                  />
                }
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Log in</span>
              </MenuItem>
              <MenuItem
                render={
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-accent/70"
                  />
                }
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Create Account</span>
              </MenuItem>
            </MenuGroup>
          )}
        </MenuPopup>
      </Menu>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Mobile Menu Coss Drawer (Full Screen / Full Height Top Drawer)            */
/* -------------------------------------------------------------------------- */
function MobileMenuDrawer() {
  const location = useLocation();
  const { user, logout, getInitials } = useLocalAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const supportLinks =
    user && user.role !== "admin"
      ? [
          { path: "/feedback", label: "Give Feedback", icon: MessageSquare, color: "text-pink-500" },
          { path: "/how-to-use", label: "How to Use", icon: HelpCircle, color: "text-cyan-500" },
        ]
      : [];

  const close = () => setOpen(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} position="top">
      <DrawerTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-8 w-8 rounded-lg text-muted-foreground transition-all hover:bg-accent/60 hover:text-foreground lg:hidden",
              open && "bg-accent text-foreground"
            )}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <MenuIcon className="h-4.5 w-4.5" />}
          </Button>
        }
      />
      <DrawerPopup className="fixed inset-0 z-[100] h-screen h-dvh w-full max-h-none border-none rounded-none bg-background p-0 overflow-hidden flex flex-col">
        {/* Header - Horizontal Flex Row */}
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 shrink-0">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          <Logo />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon-xs" onClick={close} aria-label="Close drawer">
                  <X className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>

        {/* Full Height Scrollable Panel */}
        <DrawerPanel className="flex-1 flex flex-col justify-between gap-4 p-4 sm:p-6 overflow-y-auto min-h-0">
          <div className="space-y-4">
            {/* Quick Search */}
            <Link
              to="/search"
              onClick={close}
              className="flex items-center justify-between rounded-lg bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground/80" />
                <span>Search resources & papers...</span>
              </div>
              <KbdGroup>
                <Kbd>⌘K</Kbd>
              </KbdGroup>
            </Link>

            {/* Clean Navigation Links */}
            <div className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Navigation
              </div>

              <Link
                to="/"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Home className="h-4 w-4 text-primary" />
                <span>Home</span>
              </Link>

              <Link
                to="/study-stock"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/study-stock")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Library className="h-4 w-4 text-blue-500" />
                <span>Digital Library</span>
              </Link>

              <Link
                to="/syllabus"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/syllabus")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>Course Syllabus</span>
              </Link>

              <Link
                to="/study-material/imp-questions"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/study-material/imp-questions")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span>Question Bank</span>
              </Link>

              <Link
                to="/study-material/sample-papers"
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/study-material/sample-papers")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <FileText className="h-4 w-4 text-rose-500" />
                <span>Past Papers</span>
              </Link>

              <Link
                to="/resources"
                onClick={close}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive("/resources")
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                  <span>All Learning Resources</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </div>

            {/* Support Section */}
            {supportLinks.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-border/30">
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Support
                </div>
                {supportLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={close}
                      className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
                    >
                      <Icon className={cn("h-4 w-4", item.color)} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* User / Auth Bar at bottom of screen */}
          <div className="pt-3 border-t border-border/40 shrink-0">
            {user ? (
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3.5 py-3 border border-border/30">
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar ? (
                    <Avatar className="h-8 w-8 border border-border/40">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <DefaultAvatar name={user.name} size={32} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{user.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="xs"
                    asChild
                    onClick={close}
                  >
                    <Link
                      to={
                        user.role === "admin"
                          ? "/admin/dashboard"
                          : user.role === "faculty"
                          ? "/dashboard/faculty"
                          : "/dashboard/student"
                      }
                    >
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="destructive-outline"
                    size="xs"
                    onClick={() => {
                      close();
                      logout();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-10" asChild>
                  <Link to="/login" onClick={close}>
                    Log in
                  </Link>
                </Button>
                <Button size="sm" className="h-10 font-semibold" asChild>
                  <Link to="/signup" onClick={close}>
                    Sign up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Sticky Navbar Component                                              */
/* -------------------------------------------------------------------------- */
export function Navbar() {
  const { user } = useLocalAuth();
  const dashboardPath = getDashboardPath(user);

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-12 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left section: Top Drawer Trigger (mobile) + Brand Logo + Desktop Nav */}
          <div className="flex min-w-0 items-center gap-3 lg:gap-5">
            <MobileMenuDrawer />
            <Link
              to={dashboardPath}
              className="shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none"
              aria-label="Go to dashboard"
            >
              <Logo />
            </Link>
            <div className="hidden lg:block">
              <DesktopNavLinks />
            </div>
          </div>

          {/* Right section: Search bar + Theme Toggle + User Menu / Auth buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden md:block">
              <NavbarSearch />
            </div>
            <ThemeToggle />

            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-1.5">
                <UserMenu />
                <div className="hidden items-center gap-1.5 md:flex">
                  <Button size="sm" variant="ghost" className="h-8 text-xs" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="h-8 text-xs font-semibold" asChild>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}