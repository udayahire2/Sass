"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, User, ChevronDown, FileText } from "lucide-react";
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
  if (user?.role === "student") return "/profile";
  return "/";
}

/* -------------------------------------------------------------------------- */
/*  GSAP-powered dropdown (replaces Radix DropdownMenuContent)                */
/* -------------------------------------------------------------------------- */
function GsapDropdown({
  trigger,
  children,
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  panelClassName?: string;
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
      // hide the panel initially without animation
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

  // Dismiss on outside click & Escape
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
        ref={panelRef}
        className={cn(
          "absolute top-full right-0 mt-1 z-50 min-w-48 overflow-hidden rounded-md border border-border/40 bg-background/95 p-1 shadow-lg backdrop-blur-xl",
          panelClassName,
        )}
      >
        {children(close)}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search bar (unchanged)                                                    */
/* -------------------------------------------------------------------------- */
function NavbarSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      navigate("/resources");
      return;
    }
    navigate(`/syllabus?search=${encodeURIComponent(normalizedQuery)}`);
  };

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
    <form onSubmit={handleSubmit}>
      <InputGroup>
        <InputGroupInput
          placeholder="Search…"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputGroupAddon align="inline-end">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Desktop Navigation – regrouped links into “Study” & “Support” dropdowns   */
/* -------------------------------------------------------------------------- */
function DesktopNavLinks() {
  const location = useLocation();
  const { user } = useLocalAuth();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Build two dropdown groups from NAV_LINKS
  const studyLinks = NAV_LINKS.filter((link) =>
    ["/study-stock", "/resources", "/syllabus"].includes(link.path),
  );
  // For resources, we also want to show its sub-items inside the same Study dropdown
  const resourcesLink = studyLinks.find((l) => l.path === "/resources");
  const supportLinks = user && user.role !== "admin"
    ? [
      { path: "/feedback", label: "Feedback" },
      { path: "/how-to-use", label: "How to use" },
    ]
    : [];

  return (
    <nav className="flex items-center gap-1">
      {/* Home link – always visible */}
      <Link
        to="/"
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isActive("/")
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        )}
        aria-current={isActive("/") ? "page" : undefined}
      >
        Home
      </Link>

      {/* Study dropdown */}
      <GsapDropdown
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
              studyLinks.some((l) => isActive(l.path)) || open
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            Study
            <ChevronDown
              className={cn(
                "h-3 w-3 opacity-60 transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        )}
      >
        {(close) => (
          <>
            {studyLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={close}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            {/* Sub‑items of Resources (if present) */}
            {resourcesLink?.dropdown?.map((sub) => {
              const active = isActive(sub.path);
              return (
                <Link
                  key={sub.path}
                  to={sub.path}
                  onClick={close}
                  className={cn(
                    "flex w-full items-center rounded-md px-6 py-2 text-sm", // indent sub-items
                    active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {sub.label}
                </Link>
              );
            })}
          </>
        )}
      </GsapDropdown>

      {/* Support dropdown (only for non‑admin users) */}
      {supportLinks.length > 0 && (
        <GsapDropdown
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors outline-none",
                supportLinks.some((l) => isActive(l.path)) || open
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              Support
              <ChevronDown
                className={cn(
                  "h-3 w-3 opacity-60 transition-transform duration-200",
                  open && "rotate-180",
                )}
              />
            </button>
          )}
        >
          {(close) =>
            supportLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={close}
                  className={cn(
                    "flex w-full items-center rounded-md px-3 py-2 text-sm",
                    active
                      ? "bg-muted text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50",
                  )}
                >
                  {link.label}
                </Link>
              );
            })
          }
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
        panelClassName="w-64 rounded-md p-0"
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
                  to={user.role === "admin" ? "/admin/dashboard" : user.role === "faculty" ? "/dashboard/faculty" : "/profile"}
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

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const studyLinks = NAV_LINKS.filter((link) =>
    ["/study-stock", "/resources", "/syllabus"].includes(link.path),
  );
  const resourcesLink = studyLinks.find((l) => l.path === "/resources");
  const supportLinks = user && user.role !== "admin"
    ? [
      { path: "/feedback", label: "Feedback" },
      { path: "/how-to-use", label: "How to use" },
    ]
    : [];

  const closeDropdownRef = useRef<() => void>(() => { });
  useEffect(() => {
    closeDropdownRef.current();
  }, [location.pathname]);

  return (
    <GsapDropdown
      panelClassName="w-64 rounded-md"
      trigger={({ open, toggle }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn(
            "h-9 w-9 rounded-md bg-transparent hover:bg-muted/50 lg:hidden",
            open && "bg-muted text-foreground",
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
          <div className="space-y-1">
            {/* Home */}
            <Link
              to="/"
              onClick={close}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-2 text-sm",
                isActive("/")
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              Home
            </Link>

            {/* Study section */}
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Study
            </div>
            {studyLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={close}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm",
                  isActive(link.path)
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {link.label}
              </Link>
            ))}
            {resourcesLink?.dropdown?.map((sub) => (
              <Link
                key={sub.path}
                to={sub.path}
                onClick={close}
                className={cn(
                  "flex w-full items-center rounded-md pl-6 pr-3 py-2 text-sm",
                  isActive(sub.path)
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/50",
                )}
              >
                {sub.label}
              </Link>
            ))}

            {/* Support section (only for non‑admin) */}
            {supportLinks.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Support
                </div>
                {supportLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={close}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-sm",
                      isActive(link.path)
                        ? "bg-muted text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}

            <div className="my-2 border-t border-border/40" />

            {/* User section (unchanged) */}
            {user ? (
              <>
                <div className="px-3 py-2 flex items-center gap-2">
                  {user.avatar ? (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <DefaultAvatar name={user.name} size={24} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link
                  to={user.role === "admin" ? "/admin/dashboard" : user.role === "faculty" ? "/dashboard/faculty" : "/profile"}
                  onClick={close}
                  className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <User className="mr-2 h-4 w-4" />
                  {user.role === "student" || !user.role ? "View Profile" : "Dashboard"}
                </Link>
                <Link
                  to="/notes"
                  onClick={close}
                  className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  My Notes
                </Link>
                <button
                  onClick={() => { close(); logout(); }}
                  className="flex w-full items-center rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={close}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium"
                >
                  Get started
                </Link>
              </>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted/50"
            >
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        );
      }}
    </GsapDropdown>
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
                <Link to="/login">Sign In</Link>
              </Button>

              <Button
                size="sm"
              >
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          <PopoverMobileMenu />
        </div>
      </div>
    </header>
  );
}
