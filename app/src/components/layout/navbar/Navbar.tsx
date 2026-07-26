"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Search
} from "lucide-react";
import { gsap } from "gsap";
import Menu from "@/svgs/menu";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Kbd,KbdGroup } from "@/components/ui/kbd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { NAV_LINKS } from "@/config/nav-config";
import { useTheme } from "@/components/theme-provider";
import { type User as AuthUser, useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";
import { Drawer, DrawerTrigger, DrawerPopup, DrawerHeader, DrawerPanel } from "@/components/ui/drawer";
import Folder from "@/components/svgs/folder";

function getDashboardPath(user: AuthUser | null) {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "faculty") return "/dashboard/faculty";
  if (user?.role === "student") return "/dashboard/student";
  return "/";
}

/* -------------------------------------------------------------------------- */
/*  GSAP-powered dropdown (replaces Radix DropdownMenuContent)                */
/* -------------------------------------------------------------------------- */
function GsapDropdown({
  trigger,
  children,
  panelClassName,
  wrapperClassName,
  lockScroll = false,
}: {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
  }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  panelClassName?: string;
  wrapperClassName?: string;
  lockScroll?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const location = useLocation();

  const close = () => setOpen(false);

  const toggle = () => {
    setOpen((prev) => !prev);
  };

  // Auto close on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Lock page scroll (use only for mobile menu)
  useEffect(() => {
    if (!lockScroll || !open) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [open, lockScroll]);

  // Animation
  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;

      gsap.set(panel, {
        autoAlpha: 0,
        scale: 0.96,
        y: -8,
        force3D: true,
      });

      return;
    }

    gsap.killTweensOf(panel);

    if (open) {
      panel.style.pointerEvents = "auto";

      gsap.fromTo(
        panel,
        {
          autoAlpha: 0,
          scale: 0.96,
          y: -8,
        },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.25,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(panel, {
        autoAlpha: 0,
        scale: 0.97,
        y: -4,
        duration: 0.18,
        ease: "power2.out",
        onComplete: () => {
          panel.style.pointerEvents = "none";
        },
      });
    }
  }, [open]);

  // Outside click + ESC
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      {trigger({
        open,
        toggle,
      })}

      <div
        className={cn(
          "absolute top-full z-50 mt-1",
          open
            ? "visible"
            : "invisible pointer-events-none",
          wrapperClassName ?? "right-0",
        )}
      >
        <div
          ref={panelRef}
          className={cn(
            "min-w-48 overflow-hidden overscroll-contain rounded-xl border border-neutral-200 bg-white shadow-xl shadow-black/5 dark:border-neutral-800 dark:bg-[#1f1f1f] dark:shadow-black/30",
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search bar (unchanged)                                                    */
/* -------------------------------------------------------------------------- */
function NavbarSearch() {
  const navigate = useNavigate();

  // Global keyboard shortcut: Ctrl+K / Cmd+K
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
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Navigation – regrouped links into “Study” & “Support” dropdowns   */
/* ----------------------------------------------------------
---------------- */
function DesktopNavLinks() {
  const location = useLocation();
  const { user } = useLocalAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const studyLinks = NAV_LINKS.filter((link) =>
    ["/study-stock", "/resources", "/syllabus"].includes(link.path),
  );
  const supportLinks = user && user.role !== "admin"
    ? [
      { path: "/feedback", label: "Feedback" },
      { path: "/how-to-use", label: "How to use" },
    ]
    : [];

  return (
    <nav className="flex items-center gap-1">
      {/* Home link */}
      <Link
        to="/"
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 border border-transparent",
          isActive("/")
            ? "bg-neutral-100 dark:bg-white/6 border-neutral-200 dark:border-neutral-800 text-foreground"
            : "text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-white/3 hover:text-foreground",
        )}
        aria-current={isActive("/") ? "page" : undefined}
      >
        Home
      </Link>

      {/* Study Dropdown - Notion-Themed Mega Menu Grid */}
      <GsapDropdown
        wrapperClassName="left-0 -translate-x-[60px] mt-2"
        panelClassName="w-[580px] p-0 grid grid-cols-3 bg-white dark:bg-[#1f1f1f]"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 outline-none border border-transparent cursor-pointer",
              studyLinks.some((l) => isActive(l.path)) || open
                ? "bg-neutral-100 dark:bg-white/6 border-neutral-200 dark:border-neutral-800 text-foreground"
                : "text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-white/3 hover:text-foreground",
            )}
          >
            Study
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 opacity-60 transition-transform duration-200 ease-out",
                open && "rotate-180 text-foreground opacity-100",
              )}
            />
          </button>
        )}
      >
        {(close) => (
          <>
            {/* Left promo banner card */}
            <div className="col-span-1 bg-neutral-50 dark:bg-neutral-900/40 p-5 flex flex-col justify-between border-r border-neutral-200 dark:border-neutral-800">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-md bg-neutral-200/50 dark:bg-neutral-800 px-2 py-0.5 text-[9px] font-bold text-neutral-600 dark:text-neutral-300 tracking-wide uppercase">
                  Knowledge Base
                </span>
                <h4 className="text-sm font-bold text-foreground tracking-tight leading-snug">Master Your Courses</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your all-in-one academic companion with curated resources, syllabus guides, and exam prep materials to help you excel.
                </p>
              </div>
              <Link
                to="/resources"
                onClick={close}
                className="group/btn inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-foreground dark:text-neutral-400 dark:hover:text-foreground transition-colors mt-4"
              >
                Explore repository
                <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>

            {/* Right side navigation items grid */}
            <div className="col-span-2 p-3 flex flex-col gap-2 bg-white dark:bg-[#1f1f1f]">
              <div className="grid grid-cols-2 gap-1.5">
                {/* Library */}
                <Link
                  to="/study-stock"
                  onClick={close}
                  className="group flex gap-2.5 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
                >
                  <div >
                    <Folder />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                        Digital Library
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground">
                      Access textbooks, lecture notes, and study guides.
                    </p>
                  </div>
                </Link>

                {/* Syllabus */}
                <Link
                  to="/syllabus"
                  onClick={close}
                  className="group flex gap-2.5 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                    <Compass className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                        Course Syllabus
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                    </div>  
                    <p className="text-[10px] leading-normal text-muted-foreground">
                      Explore course structures, modules, and grading criteria.
                    </p>
                  </div>
                </Link>

                {/* Question Bank */}
                <Link
                  to="/study-material/imp-questions"
                  onClick={close}
                  className="group flex gap-2.5 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                        Question Bank
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground">
                      Practice with curated, high-yield exam questions.
                    </p>
                  </div>
                </Link>

                {/* Past Papers */}
                <Link
                  to="/study-material/sample-papers"
                  onClick={close}
                  className="group flex gap-2.5 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors truncate">
                        Past Papers
                      </span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                    </div>
                    <p className="text-[10px] leading-normal text-muted-foreground">
                      Test your knowledge with previous years' papers.
                    </p>
                  </div>
                </Link>
              </div>

              {/* View All Material row */}
              <Link
                to="/resources"
                onClick={close}
                className="group mt-1 flex items-center justify-between rounded-lg bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-200/60 dark:border-neutral-800/60 p-2.5 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-3xs">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 text-left">
                    <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors">
                      Browse All Resources
                    </span>
                    <p className="text-[10px] text-muted-foreground leading-none">
                      Explore our full collection of academic assets.
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
              </Link>
            </div>
          </>
        )}
      </GsapDropdown>

      {/* Support Dropdown - Notion-Themed Compact List */}
      {supportLinks.length > 0 && (
        <GsapDropdown
          wrapperClassName="left-1/2 -translate-x-1/2 mt-2"
          panelClassName="w-[300px] p-1 bg-white dark:bg-[#1f1f1f]"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 outline-none border border-transparent cursor-pointer",
                supportLinks.some((l) => isActive(l.path)) || open
                  ? "bg-neutral-100 dark:bg-white/[0.06] border-neutral-200 dark:border-neutral-800 text-foreground"
                  : "text-muted-foreground hover:bg-neutral-100/50 dark:hover:bg-white/[0.03] hover:text-foreground",
              )}
            >
              Resources
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 opacity-60 transition-transform duration-200 ease-out",
                  open && "rotate-180 text-foreground opacity-100",
                )}
              />
            </button>
          )}
        >
          {(close) => (
            <div className="flex flex-col gap-0.5">
              {/* Give Feedback */}
              <Link
                to="/feedback"
                onClick={close}
                className="group flex gap-3 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-pink-500/10 bg-pink-500/5 text-pink-500 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors">
                      Give Feedback
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                  </div>
                  <p className="text-[10px] leading-normal text-muted-foreground">
                    Suggest ideas or report any platform issues.
                  </p>
                </div>
              </Link>

              {/* How to Use */}
              <Link
                to="/how-to-use"
                onClick={close}
                className="group flex gap-3 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-all duration-150"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/10 bg-cyan-500/5 text-cyan-500 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-foreground group-hover:text-foreground transition-colors">
                      How to Use
                    </span>
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-neutral-500 transition-all duration-150 shrink-0" />
                  </div>
                  <p className="text-[10px] leading-normal text-muted-foreground">
                    Quick platform walkthrough and FAQ guides.
                  </p>
                </div>
              </Link>
            </div>
          )}
        </GsapDropdown>
      )}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Theme toggle, user menu, mobile menu (adapted to use GsapDropdown)        */
/* -------------------------------------------------------------------------- */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-md bg-transparent hover:bg-muted/50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-foreground" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </Button>
  );
}

function UserMenuDesktop() {
  const { user, logout, getInitials } = useLocalAuth();

  return (
    <div className="hidden items-center md:flex">
      <GsapDropdown
        trigger={({ toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-foreground/90 to-foreground/70 text-background ring-1 ring-border/50 transition-all duration-200 hover:ring-2 hover:ring-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            aria-label="User menu"
          >
            {user?.avatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-transparent text-[11px] font-semibold text-background">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ) : user ? (
              <DefaultAvatar name={user.name} size={32} />
            ) : (
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-transparent text-background">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            )}
          </button>
        )}
        panelClassName="w-64 p-0 bg-white dark:bg-[#1f1f1f]"
      >
        {(close) =>
          user ? (
            <>
              <div className="border-b border-border/40 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-foreground/90 to-foreground/70 text-background">
                    {user.avatar ? (
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-transparent text-xs font-semibold text-background">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <DefaultAvatar name={user.name} size={36} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-tight">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  to={user.role === "admin" ? "/admin/dashboard" : user.role === "faculty" ? "/dashboard/faculty" : "/dashboard/student"}
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <User className="h-4 w-4" />
                  {user.role === "student" || !user.role ? "View Profile" : "Dashboard"}
                </Link>
                <Link
                  to="/notes"
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <FileText className="h-4 w-4" />
                  My Notes
                </Link>
              </div>
              <div className="border-t border-border/40 mx-2" />
              <div className="p-1.5">
                <button
                  onClick={() => { close(); logout(); }}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2.5 h-4 w-4" />
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="p-1.5">
              <Link
                to="/login"
                onClick={close}
                className="flex items-center rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <User className="mr-2.5 h-4 w-4" />
                Log in
              </Link>
            </div>
          )
        }
      </GsapDropdown>
    </div>
  );
}

function PopoverMobileMenu() {
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
          { path: "/feedback", label: "Feedback" },
          { path: "/how-to-use", label: "How to use" },
        ]
      : [];

  const close = () => setOpen(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} position="right">
      <DrawerTrigger render={
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-md bg-transparent hover:bg-muted/50 lg:hidden border border-transparent cursor-pointer",
            open && "bg-muted text-foreground border-border/40",
          )}
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      } />
      <DrawerPopup showCloseButton className="w-[300px] sm:w-[360px] bg-background border-l border-border/40">
        <DrawerHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
        </DrawerHeader>
        <DrawerPanel className="p-4 flex flex-col gap-6">
          {/* Mobile Search button */}
          <Link
            to="/search"
            onClick={close}
            className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-muted/20 px-3.5 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span>Search courses & materials...</span>
          </Link>

          {/* Nav Categories */}
          <div className="space-y-4">
            {/* General */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                General
              </div>
              <Link
                to="/"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <Home className="h-4.5 w-4.5" />
                Home
              </Link>
            </div>

            {/* Study Hub */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Study Hub
              </div>
              <Link
                to="/study-stock"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/study-stock")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-blue-500/10 bg-blue-500/5 text-blue-500">
                  <Library className="h-4 w-4" />
                </div>
                Digital Library
              </Link>
              <Link
                to="/syllabus"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/syllabus")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-500">
                  <Compass className="h-4 w-4" />
                </div>
                Course Syllabus
              </Link>
            </div>

            {/* Materials */}
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Materials
              </div>
              <Link
                to="/resources"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/resources") && !location.pathname.includes("/study-material/")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/10 bg-amber-500/5 text-amber-500">
                  <FolderOpen className="h-4 w-4" />
                </div>
                Browse All Resources
              </Link>
              <Link
                to="/study-material/imp-questions"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/study-material/imp-questions")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-purple-500/10 bg-purple-500/5 text-purple-500">
                  <Sparkles className="h-4 w-4" />
                </div>
                Question Bank
              </Link>
              <Link
                to="/study-material/sample-papers"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                  isActive("/study-material/sample-papers")
                    ? "bg-muted text-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                )}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-500/10 bg-rose-500/5 text-rose-500">
                  <FileText className="h-4 w-4" />
                </div>
                Past Papers
              </Link>
            </div>

            {/* Support */}
            {supportLinks.length > 0 && (
              <div className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Support
                </div>
                <Link
                  to="/feedback"
                  onClick={close}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    isActive("/feedback")
                      ? "bg-muted text-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-pink-500/10 bg-pink-500/5 text-pink-500">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  Give Feedback
                </Link>
                <Link
                  to="/how-to-use"
                  onClick={close}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all",
                    isActive("/how-to-use")
                      ? "bg-muted text-foreground shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/10 bg-cyan-500/5 text-cyan-500">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  How to Use
                </Link>
              </div>
            )}
          </div>

          <div className="my-1 border-t border-border/40" />

          {/* Theme & User actions */}
          <div className="space-y-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer transition-all"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-muted/30">
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {user ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-xl bg-muted/30 border border-border/40 p-3">
                  {user.avatar ? (
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <DefaultAvatar name={user.name} size={36} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold leading-none">{user.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground mt-1">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "faculty"
                          ? "/dashboard/faculty"
                          : "/dashboard/student"
                    }
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
                  >
                    <User className="h-3.5 w-3.5" />
                    Profile
                  </Link>

                  <Link
                    to="/notes"
                    onClick={close}
                    className="flex items-center justify-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    My Notes
                  </Link>
                </div>

                <button
                  onClick={() => {
                    close();
                    logout();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-xs font-semibold text-destructive transition-all hover:bg-destructive/20"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={close}
                  className="flex items-center justify-center rounded-xl border border-border/40 px-3 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={close}
                  className="flex items-center justify-center rounded-xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Navbar (unchanged structure)                                         */
/* -------------------------------------------------------------------------- */
export function Navbar() {
  const { user } = useLocalAuth();
  const dashboardPath = getDashboardPath(user);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Link to={dashboardPath} className="shrink-0" aria-label="Go to dashboard">
            <Logo />
          </Link>

          <div className="hidden lg:block">
            <DesktopNavLinks />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <NavbarSearch />
          </div>

          <ThemeToggle />

          {user ? (
            <UserMenuDesktop />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button
                size="sm"
                variant="ghost"
              >
                <Link to="/login">Login</Link>
              </Button>

              <Button
                size="sm"
              >
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          )}

          <PopoverMobileMenu />
        </div>
      </div>
    </header>
  );
}
