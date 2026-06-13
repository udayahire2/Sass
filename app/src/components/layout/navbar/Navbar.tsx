"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { gsap } from "gsap";
import Menu from "@/svgs/menu";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { NAV_LINKS } from "@/config/nav-config";
import { useTheme } from "@/components/theme-provider";
import { type User as AuthUser, useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";

function getDashboardPath(user: AuthUser | null) {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "faculty") return "/dashboard/faculty";
  if (user?.role === "student") return "/dashboard/student";
  return "/";
}

/* -------------------------------------------------------------------------- */
/*  GSAP-powered dropdown (unchanged)                                         */
/* -------------------------------------------------------------------------- */
function GsapDropdown({
  trigger,
  children,
  panelClassName,
  wrapperClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  panelClassName?: string;
  wrapperClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (isInitialMount.current) {
      isInitialMount.current = false;
      gsap.set(panel, { autoAlpha: 0, scale: 0.96, y: -8 });
      return;
    }

    gsap.killTweensOf(panel);

    if (open) {
      gsap.fromTo(
        panel,
        { autoAlpha: 0, scale: 0.96, y: -6 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out",
        },
      );
    } else {
      gsap.to(panel, {
        autoAlpha: 0,
        scale: 0.97,
        y: -4,
        duration: 0.2,
        ease: "power2.inOut",
        onStart: () => {
          if (panel) panel.style.pointerEvents = "none";
        },
        onComplete: () => {
          if (panel) panel.style.pointerEvents = "";
        },
      });
    }
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {trigger({ open, toggle })}
      <div
        className={cn(
          "absolute top-full z-50 mt-2",
          open
            ? "visible pointer-events-auto"
            : "invisible pointer-events-none select-none",
          wrapperClassName || "right-0",
        )}
      >
        <div
          ref={panelRef}
          className={cn(
            "min-w-48 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1f1f1f] p-1 shadow-xl shadow-black/5 dark:shadow-black/30",
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
/*  Search bar – compact variant for dynamic island                           */
/* -------------------------------------------------------------------------- */
function NavbarSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle global keyboard shortcut
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

  // Handle click on the input – triggers the same shortcut behavior
  const handleInputClick = () => {
    navigate("/search");
  };

  // Optional: also handle focus via keyboard Tab (same effect)
  const handleInputFocus = () => {
    navigate("/search");
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="hidden md:block">
      <InputGroup className="w-32 lg:w-36">
        <InputGroupInput
          placeholder="Search…"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)} // kept but won't be used because input is readOnly
          readOnly
          onClick={handleInputClick}
          onFocus={handleInputFocus}
          className="cursor-pointer"
        />
        <InputGroupAddon align="inline-end" className="pr-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Navigation – regrouped links into “Study” & “Support” dropdowns   */
/*  (adjusted styling to fit within pill)                                     */
/* -------------------------------------------------------------------------- */
function DesktopNavLinks() {
  const location = useLocation();
  const { user } = useLocalAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const studyLinks = NAV_LINKS.filter((link) =>
    ["/study-stock", "/resources", "/syllabus"].includes(link.path),
  );
  const supportLinks =
    user && user.role !== "admin"
      ? [
          { path: "/feedback", label: "Feedback" },
          { path: "/how-to-use", label: "How to use" },
        ]
      : [];

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {/* Home link */}
      <Link
        to="/"
        className={cn(
          "rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150",
          isActive("/")
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
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
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 outline-none cursor-pointer",
              studyLinks.some((l) => isActive(l.path)) || open
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
                <h4 className="text-sm font-bold text-foreground tracking-tight leading-snug">
                  Master Your Courses
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your all-in-one academic companion with curated resources,
                  syllabus guides, and exam prep materials to help you excel.
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-3xs transition-transform duration-200 group-hover:scale-[1.02]">
                    <Library className="h-4.5 w-4.5" />
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

      {/* Support Dropdown */}
      {supportLinks.length > 0 && (
        <GsapDropdown
          wrapperClassName="left-1/2 -translate-x-1/2 mt-2"
          panelClassName="w-[300px] p-1 bg-white dark:bg-[#1f1f1f]"
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-150 outline-none cursor-pointer",
                supportLinks.some((l) => isActive(l.path)) || open
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
/*  Theme toggle (compact for pill)                                           */
/* -------------------------------------------------------------------------- */
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8 rounded-full bg-transparent hover:bg-muted/50"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  User menu (compact avatar)                                                */
/* -------------------------------------------------------------------------- */
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
                    <p className="truncate text-sm font-medium leading-tight">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <Link
                  to={
                    user.role === "admin"
                      ? "/admin/dashboard"
                      : user.role === "faculty"
                        ? "/dashboard/faculty"
                        : "/dashboard/student"
                  }
                  onClick={close}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <User className="h-4 w-4" />
                  {user.role === "student" || !user.role
                    ? "View Profile"
                    : "Dashboard"}
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
                  onClick={() => {
                    close();
                    logout();
                  }}
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

/* -------------------------------------------------------------------------- */
/*  Mobile menu – unchanged, but the trigger button is adapted to pill style */
/* -------------------------------------------------------------------------- */



function PopoverMobileMenu() {
  const location = useLocation();
  const { user, logout, getInitials } = useLocalAuth();
  const { theme, setTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const closeDropdownRef = useRef<() => void>(() => {});
  useEffect(() => {
    closeDropdownRef.current();
  }, [location.pathname]);

  // Prevent scroll from propagating to the body
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleWheel = (e: WheelEvent) => {
      // Stop propagation to prevent body scroll
      e.stopPropagation();
      // Optionally, if you want to prevent default only when content is scrollable,
      // but we'll let the browser handle natural scroll inside the div.
      // However, stopping propagation is enough to avoid body scroll.
    };

    // Use capture phase to catch events before they bubble
    scrollElement.addEventListener('wheel', handleWheel, { passive: false, capture: true });
    scrollElement.addEventListener('touchmove', handleWheel, { passive: false, capture: true });

    return () => {
      scrollElement.removeEventListener('wheel', handleWheel, { capture: true });
      scrollElement.removeEventListener('touchmove', handleWheel, { capture: true });
    };
  }, []);

  return (
    <GsapDropdown
      wrapperClassName="right-0 mt-2"
      panelClassName="w-72 p-0 bg-white dark:bg-[#1f1f1f] rounded-xl shadow-xl z-50 overflow-hidden"
      trigger={({ open, toggle }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "h-8 w-8 rounded-full bg-transparent hover:bg-muted/50 md:hidden border border-transparent cursor-pointer",
            open && "bg-muted text-foreground border-border/40",
          )}
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      )}
    >
      {(close) => {
        closeDropdownRef.current = close;
        return (
          <div
            ref={scrollRef}
            className="max-h-[70vh] overflow-y-auto overscroll-contain"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="space-y-1.5 p-2">
              {/* Home */}
              <Link
                to="/"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

              {/* Study section */}
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Study Hub
              </div>

              {/* Library */}
              <Link
                to="/study-stock"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/study-stock")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Library className="h-4 w-4 text-blue-500" />
                Digital Library
              </Link>

              {/* Syllabus */}
              <Link
                to="/syllabus"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive("/syllabus")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Compass className="h-4 w-4 text-emerald-500" />
                Course Syllabus
              </Link>

              {/* Study Material heading */}
              <div className="pl-3 py-1 text-[10px] font-semibold text-muted-foreground/75 uppercase tracking-wider">
                Materials
              </div>

              {/* Browse All */}
              <Link
                to="/resources"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg pl-6 pr-3 py-2 text-sm transition-colors",
                  isActive("/resources") && !location.pathname.includes("/study-material/")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <FolderOpen className="h-4 w-4 text-amber-500" />
                Browse All
              </Link>

              {/* Question Bank */}
              <Link
                to="/study-material/imp-questions"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg pl-6 pr-3 py-2 text-sm transition-colors",
                  isActive("/study-material/imp-questions")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Sparkles className="h-4 w-4 text-purple-500" />
                Question Bank
              </Link>

              {/* Past Papers */}
              <Link
                to="/study-material/sample-papers"
                onClick={close}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg pl-6 pr-3 py-2 text-sm transition-colors",
                  isActive("/study-material/sample-papers")
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <FileText className="h-4 w-4 text-rose-500" />
                Past Papers
              </Link>

              {/* Support section */}
              {supportLinks.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Support
                  </div>
                  <Link
                    to="/feedback"
                    onClick={close}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/feedback")
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <MessageSquare className="h-4 w-4 text-pink-500" />
                    Give Feedback
                  </Link>
                  <Link
                    to="/how-to-use"
                    onClick={close}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive("/how-to-use")
                        ? "bg-muted text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    )}
                  >
                    <HelpCircle className="h-4 w-4 text-cyan-500" />
                    How to Use
                  </Link>
                </>
              )}

              <div className="my-2 border-t border-border/40" />

              {/* User section */}
              {user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-2 bg-muted/30 rounded-lg">
                    {user.avatar ? (
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <DefaultAvatar name={user.name} size={28} />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{user.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to={
                      user.role === "admin"
                        ? "/admin/dashboard"
                        : user.role === "faculty"
                          ? "/dashboard/faculty"
                          : "/dashboard/student"
                    }
                    onClick={close}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    {user.role === "student" || !user.role ? "View Profile" : "Dashboard"}
                  </Link>
                  <Link
                    to="/notes"
                    onClick={close}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  >
                    <FileText className="h-4 w-4" />
                    My Notes
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-1">
                  <Link
                    to="/login"
                    onClick={close}
                    className="flex items-center justify-center rounded-lg border border-border/40 px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={close}
                    className="flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm transition-all"
                  >
                    Get started
                  </Link>
                </div>
              )}

              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-500" />
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        );
      }}
    </GsapDropdown>
  );
}
/* -------------------------------------------------------------------------- */
/*  Main Navbar – DYNAMIC ISLAND STYLE                                        */
/*  - Sticky floating pill at the top                                          */
/*  - Adaptive width, glassmorphism, centered                                 */
/* -------------------------------------------------------------------------- */
export function Navbar() {
  const { user } = useLocalAuth();
  const dashboardPath = getDashboardPath(user);

  return (
    <div className="sticky top-0 z-50 flex justify-center pointer-events-none">
      {/* The dynamic island pill - now at top-0 with medium rounded corners */}
      <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-border/80 bg-background px-4 py-1.5 backdrop-blur-md transition-all duration-300 hover:bg-background/90 w-fit max-w-[95vw] md:max-w-[90vw] lg:max-w-5xl mt-2">
        {/* Logo – links to dashboard */}
        <Link
          to={dashboardPath}
          className="shrink-0"
          aria-label="Go to dashboard"
        >
          <Logo />
        </Link>

        {/* Desktop navigation links – hidden on mobile */}
        <DesktopNavLinks />

        {/* Spacer to push right-aligned items */}
        <div className="flex-1" />

        {/* Search bar – hidden on mobile */}
        <NavbarSearch />

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User menu (if logged in) or sign in buttons */}
        {user ? (
          <UserMenuDesktop />
        ) : (
          <div className="hidden items-center gap-2 md:flex">
            <Button
              size="sm"
              variant="ghost"
            >
              <Link to="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        )}

        {/* Mobile menu trigger – only visible on small screens */}
        <PopoverMobileMenu />
      </div>
    </div>
  );
}
