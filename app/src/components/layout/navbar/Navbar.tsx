"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, LogOut, User, BookOpen } from "lucide-react";
import Menu from "@/svgs/menu";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NAV_LINKS } from "@/config/nav-config";
import { useTheme } from "@/components/theme-provider";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { cn } from "@/lib/utils";

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

  // ✅ Ctrl + K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/search"); // 🔥 redirect page
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
          onChange={(e) => setQuery(e.target.value)} // ✅ FIX
        />
        <InputGroupAddon align="inline-end">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}

// Desktop Navigation Links Component
function DesktopNavLinks() {
  const location = useLocation();
  const { user } = useLocalAuth();

  const links = [
    ...NAV_LINKS,
    ...(user?.role === "faculty"
      ? [{ path: "/dashboard/faculty", label: "Dashboard" }]
      : []),
    ...(user?.role === "admin"
      ? [{ path: "/admin/dashboard", label: "Admin" }]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className="flex items-center gap-1">
      {links.map((link) => {
        const active = isActive(link.path);

        return (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Theme Toggle Component
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

// User Menu Component (Desktop) — Vercel-style avatar dropdown
function UserMenuDesktop() {
  const { user, logout, getInitials } = useLocalAuth();

  if (!user) {
    return (
      <div className="hidden items-center gap-2 md:flex">
        <Link to="/login">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
        </Link>
        <Link to="/signup">
          <Button size="sm">Get started</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-foreground/90 to-foreground/70 text-background ring-1 ring-border/50 transition-all duration-200 hover:ring-2 hover:ring-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            aria-label="User menu"
          >
            {user.avatar ? (
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-transparent text-[11px] font-semibold text-background">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-[11px] font-semibold leading-none">
                {getInitials(user.name)}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-64 rounded-xl border-border/50 bg-popover/95 p-0 shadow-xl shadow-black/10 backdrop-blur-xl"
        >
          {/* User Info Header */}
          <div className="border-b border-border/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-foreground/90 to-foreground/70 text-background">
                {user.avatar ? (
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-transparent text-xs font-semibold text-background">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-xs font-semibold">
                    {getInitials(user.name)}
                  </span>
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

          {/* Menu Items */}
          <div className="p-1.5">
            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm">
              <Link to="/profile" className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>View Profile</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm">
              <Link to="/resources" className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Study Materials</span>
              </Link>
            </DropdownMenuItem>
          </div>

          <DropdownMenuSeparator className="mx-2 bg-border/40" />

          {/* Logout */}
          <div className="p-1.5">
            <DropdownMenuItem
              onClick={logout}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Popover Mobile Menu Component
function PopoverMobileMenu() {
  const location = useLocation();
  const { user, logout, getInitials } = useLocalAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const links = [
    ...NAV_LINKS,
    ...(user?.role === "faculty"
      ? [{ path: "/dashboard/faculty", label: "Dashboard" }]
      : []),
    ...(user?.role === "admin"
      ? [{ path: "/admin/dashboard", label: "Admin" }]
      : []),
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-md  bg-transparent hover:bg-muted/50 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-md border-border/40 p-2"
      >
        {/* Navigation Links */}
        {links.map((link) => {
          const active = isActive(link.path);

          return (
            <DropdownMenuItem
              key={link.path}
              asChild
              className={cn("rounded-md cursor-pointer", active && "bg-muted")}
            >
              <Link
                to={link.path}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm",
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {link.label}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator className="my-2" />

        {/* User Section */}
        {user ? (
          <>
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              asChild
              className="rounded-md cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <Link
                to="/profile"
                className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              asChild
              className="rounded-md cursor-pointer"
              onClick={() => navigate("/resources")}
            >
              <Link
                to="/resources"
                className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Study Materials
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={logout}
              className="rounded-md cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild className="rounded-md cursor-pointer">
              <Link
                to="/login"
                className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground"
              >
                Sign in
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="rounded-md cursor-pointer">
              <Link
                to="/signup"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium"
              >
                Get started
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator className="my-2" />

        {/* Theme Toggle */}
        <DropdownMenuItem
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-md cursor-pointer"
        >
          {theme === "dark" ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Light mode
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Dark mode
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Main Navbar Component
export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95   backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo & Desktop Nav */}
        <div className="flex min-w-0 items-center gap-6 lg:gap-8">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden lg:block">
            <DesktopNavLinks />
          </div>
        </div>

        {/* Right Section: Search, Theme, User */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden md:block">
            <NavbarSearch />
          </div>
          <ThemeToggle />
          <UserMenuDesktop />
          <PopoverMobileMenu />
        </div>
      </div>
    </header>
  );
}
