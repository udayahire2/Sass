"use client";

import * as React from "react";
import Link from "next/link";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
];

export type MinimalRoundedHeaderProps = {
  variant?: "desktop" | "compact";
  className?: string;
  homeHref?: string;
  signInHref?: string;
  getStartedHref?: string;
  onMenuClick?: () => void;
};

export function MinimalRoundedHeader({
  className,
  homeHref = "/",
  signInHref = "/login",
  getStartedHref = "/signup",
  onMenuClick,
}: MinimalRoundedHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    onMenuClick?.();
  };

  return (
    <header className={cn("relative z-50 w-full px-3 pt-4 md:px-6", className)}>
      <div className="mx-auto max-w-6xl rounded-full border border-border/80 bg-background/80 px-2.5 py-2 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={homeHref}
            aria-label="UDX home"
            className="group flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-accent/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/80 bg-muted/60 shadow-inner shadow-white/40">
              <svg
                className="h-4 w-4 text-foreground shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" className="fill-primary/10 stroke-primary" strokeWidth="1.5" />
                <path d="M7 8H17M7 12H17M7 16H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="hidden sm:flex flex-col items-start leading-none">
              <span className="text-[11px] font-bold tracking-[0.18em] text-foreground uppercase">UDX</span>
              <span className="mt-0.5 text-[8px] font-medium tracking-[0.22em] text-muted-foreground uppercase">UI Kit</span>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 rounded-full border border-border/70 bg-muted/30 p-1 md:flex">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                render={<Link href={item.href} className="rounded-full px-2.5" />}
                className={cn(
                  "rounded-full px-3 text-sm font-medium",
                  item.label === "Home" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              render={<Link href={getStartedHref} className="rounded-[inherit]" />}
              className="hidden sm:inline-flex"
            >
              Get Started
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={signInHref} className="rounded-[inherit]" />}
              className="hidden sm:inline-flex"
            >
              Login
            </Button>

            <Button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              variant="ghost"
              size="icon-sm"
              className="rounded-full border border-border/70 bg-muted/30 hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-[17px] w-[17px] stroke-[1.8]" />
              ) : (
                <Moon className="h-[17px] w-[17px] stroke-[1.8]" />
              )}
            </Button>

            <Button
              type="button"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              variant="ghost"
              size="icon-sm"
              className="rounded-full border border-border/70 bg-muted/30 hover:bg-accent md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-[17px] w-[17px]" /> : <Menu className="h-[17px] w-[17px]" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mx-auto mt-3 max-w-6xl rounded-[28px] border border-border/80 bg-background/90 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                render={<Link href={item.href} className="w-full justify-start" />}
                className="justify-start rounded-xl px-3 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </Button>
            ))}
          </nav>

          <Separator className="my-3" />

          <div className="flex flex-col gap-2">
            <Button render={<Link href={getStartedHref} className="w-full" />} className="w-full">Get Started</Button>
            <Button variant="outline" render={<Link href={signInHref} className="w-full" />} className="w-full">Login</Button>
          </div>
        </div>
      )}
    </header>
  );
}

export default MinimalRoundedHeader;
