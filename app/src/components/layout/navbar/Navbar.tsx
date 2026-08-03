"use client";

import React, { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  User,
  LogOut,
  FileText,
  ChevronDown,
  Library,
  Compass,
  Sparkles,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { useTheme } from "@/components/theme-provider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// --- Sound Hook (unchanged) ---
const AUDIO_FILE_PATH = "/mixkit-camera-shutter-click-1133.wav";
const useSound = (url: string) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audioObj = new Audio(url);
    setAudio(audioObj);
  }, [url]);
  const play = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => console.log("Audio play failed", e));
    }
  };
  return play;
};

// --- Theme Trigger (simplified classes) ---
const ThemeTrigger = ({ progress }: { progress?: any }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const playSound = useSound(AUDIO_FILE_PATH);
  const scrollRotation = useTransform(progress || 0, [0, 1], [0, 45]);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="icon-btn"
        aria-label="Theme toggle placeholder"
      />
    );
  }

  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { playSound(); setTheme(isDark ? "light" : "dark"); }}
      className="icon-btn group"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative flex h-full w-full items-center justify-center">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
          aria-hidden="true"
        >
          <motion.circle
            cx="12"
            cy="12"
            initial={false}
            animate={{ r: isDark ? 9 : 5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
          <motion.g
            initial={false}
            animate={{
              opacity: isDark ? 0 : 1,
              rotate: isDark ? 90 : 0,
              scale: isDark ? 0.5 : 1,
            }}
            style={{ originX: "12px", originY: "12px", rotate: scrollRotation }}
            transition={{ duration: 0.2 }}
          >
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.g>
        </svg>
        <motion.div
          className="absolute top-[30%] right-[30%] h-1.5 w-1.5 rounded-md bg-background"
          initial={false}
          animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 0.4 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      </div>
    </Button>
  );
};

// --- Search Button (simplified) ---
function NavbarSearch() {
  const navigate = useNavigate();
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
      variant="ghost"
      size="icon"
      onClick={() => navigate("/search")}
      className="icon-btn hidden md:flex"
      aria-label="Search"
    >
      <Search className="h-4 w-4 text-foreground" />
    </Button>
  );
}

// --- Cinematic Dropdown (simplified classes) ---

export function CinematicDropdown({
  label,
  items,
  footerLink,
  isActive,
}: {
  label: string;
  items: any[];
  footerLink?: any;
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  let timeout: ReturnType<typeof setTimeout>;

  const handleEnter = () => {
    clearTimeout(timeout);
    setIsOpen(true);
  };
  const handleLeave = () => {
    timeout = setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={cn(
          "group flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          isActive || isOpen
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {label}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-300",
            isOpen && "rotate-180",
            /* SVG color explicitly set here rather than inheriting */
            isActive || isOpen
              ? "text-foreground"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-[60] -translate-x-1/2 pt-3"
          >
            <div className="min-w-[320px] overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col gap-1 p-2">
                {items.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background transition-transform group-hover:scale-105">
                      {/* Color and transition explicitly applied to the SVG */}
                      <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {footerLink && (
                <div className="border-t border-border/50 bg-muted/10 p-2">
                  <Link
                    to={footerLink.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background shadow-sm">
                        {/* Color explicitly applied to the SVG */}
                        <footerLink.icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </div>
                      <span className="text-xs font-medium text-foreground">
                        {footerLink.name}
                      </span>
                    </div>
                    {/* Color explicitly applied to the SVG */}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- User Avatar Dropdown (simplified) ---
function UserAvatarDropdown({ user, logout }: { user: any; logout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  let timeout: ReturnType<typeof setTimeout>;

  const handleEnter = () => { clearTimeout(timeout); setIsOpen(true); };
  const handleLeave = () => { timeout = setTimeout(() => setIsOpen(false), 150); };

  return (
    <div className="relative ml-2" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-muted/50 outline-none transition-transform hover:scale-105 active:scale-95">
        {user?.avatar ? (
          <Avatar className="h-full w-full">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : (
          <User className="h-4 w-4 text-foreground/70" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-full pt-3 z-[60]"
          >
            <div className="min-w-[220px] flex-col gap-1 rounded-2xl border border-border/50 bg-background/95 p-2 shadow-2xl backdrop-blur-xl">
              <div className="mb-1 border-b border-border/50 px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Link
                to={getDashboardPath(user)}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <User className="h-4 w-4" /> Profile
              </Link>
              <Link
                to="/notes"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <FileText className="h-4 w-4" /> My Notes
              </Link>
              <div className="my-1 h-px bg-border/50" />
              <button
                onClick={() => { setIsOpen(false); logout(); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Navigation Data (unchanged) ---
const navGroups = [
  { name: "Home", href: "/" },
  {
    name: "Study",
    dropdown: [
      { name: "Digital Library", href: "/study-stock", icon: Library, description: "Access textbooks & notes" },
      { name: "Course Syllabus", href: "/syllabus", icon: Compass, description: "Explore course structures" },
      { name: "Question Bank", href: "/study-material/imp-questions", icon: Sparkles, description: "High-yield exam questions" },
      { name: "Past Papers", href: "/study-material/sample-papers", icon: FileText, description: "Previous years' papers" },
    ],
    footerLink: { name: "Browse All Resources", href: "/resources", icon: FolderOpen },
  },
  {
    name: "Support",
    dropdown: [
      { name: "Give Feedback", href: "/feedback", icon: MessageSquare, description: "Suggest ideas or report issues" },
      { name: "How to Use", href: "/how-to-use", icon: HelpCircle, description: "Platform walkthrough & FAQ" },
    ],
  },
];

function getDashboardPath(user: any) {
  if (user?.role === "admin") return "/admin/dashboard";
  if (user?.role === "faculty") return "/dashboard/faculty";
  if (user?.role === "student") return "/dashboard/student";
  return "/";
}

// --- Main Navbar (cleaned) ---
export function Navbar() {
  const { scrollY } = useScroll();
  const { theme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const location = useLocation();
  const { user, logout } = useLocalAuth();
  const isDark = theme === "dark";

  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  const scrollRaw = useTransform(scrollY, [0, 200], [0, 1]);
  const scrollSpring = useSpring(scrollRaw, { stiffness: 280, damping: 32, mass: 1.2, restDelta: 0.001 });
  const progress = shouldReduceMotion ? scrollRaw : scrollSpring;

  const y = useTransform(progress, [0, 1], [-10, 0]);
  const gap = useTransform(progress, [0, 1], ["16px", "0px"]);
  const padding = useTransform(progress, [0.4, 1], ["0px", "6px"]);
  const bgOpacity = useTransform(progress, [0.4, 1], [0, 0.98]);
  const blurValue = useTransform(progress, [0.4, 1], [0, 12]);
  const borderOpacity = useTransform(progress, [0, 1], [0.1, isDark ? 0.4 : 0.2]);

  const containerBg = useMotionTemplate`oklch(from var(--background) l c h / ${bgOpacity})`;
  const containerBorder = useMotionTemplate`oklch(from var(--foreground) l c h / ${borderOpacity})`;

  const dashboardPath = getDashboardPath(user);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-around px-4 md:px-0">
      <motion.div
        style={{
          y,
          gap,
          padding,
          background: containerBg,
          backdropFilter: useMotionTemplate`blur(${blurValue}px)`,
         
        }}
        className="pointer-events-auto flex max-w-5xl items-center bg-background  transition-colors"
        role="banner"
      >
        {/* Logo */}
        <motion.div
          className=" relative flex h-10 cursor-pointer items-center overflow-hidden rounded-md  bg-transparent px-3 py-2 shrink-0"
          onHoverStart={() => setIsLogoHovered(true)}
          onHoverEnd={() => setIsLogoHovered(false)}
        >
          <Link to={dashboardPath} className="flex items-center gap-1 px-2">
            <motion.div
              animate={{ scale: isLogoHovered ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex shrink-0 items-center justify-center"
            >
              <Logo showText={false} className="h-7 w-7 text-foreground [&_img]:h-full [&_img]:w-full" />
            </motion.div>
            <AnimatePresence initial={false}>
              {isLogoHovered && (
                <motion.div
                  initial={{ width: 0, opacity: 0, x: -5 }}
                  animate={{ width: "auto", opacity: 1, x: 0 }}
                  exit={{ width: 0, opacity: 0, x: -5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div className="flex flex-col justify-center leading-none">
                    <span className="ml-1.5 text-xs font-semibold text-foreground">NMU</span>
                    <span className="ml-1.5 mt-0.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">StudyHub</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          className="hidden h-10 items-center rounded-md border border-border bg-background px-1.5 lg:flex shrink-0"
          role="navigation"
        >
          <nav className="flex items-center gap-1">
            {navGroups.map((item) =>
              item.dropdown ? (
                <CinematicDropdown
                  key={item.name}
                  label={item.name}
                  items={item.dropdown}
                  footerLink={item.footerLink}
                  isActive={location.pathname.includes(item.name.toLowerCase())}
                />
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition",
                    location.pathname === item.href
                      ? "bg-muted/50 text-foreground"
                      : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                  )}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>
        </motion.div>

        {/* Actions */}
        <motion.div className="flex h-10 items-center gap-1 rounded-md border border-border bg-background px-1.5 shrink-0">
          <NavbarSearch />
          <ThemeTrigger progress={progress} />

          {user ? (
            <div className="hidden md:flex items-center">
              <UserAvatarDropdown user={user} logout={logout} />
            </div>
          ) : (
            <>
            
            <Link to="/signup" className="ml-1 hidden md:flex">
              <Button size={"sm"}>
                Get Started
              </Button>
            </Link>
            </>
          )}

          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger >
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-8 w-8 shrink-0 rounded-md lg:hidden"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 8.5h16" />
                  <path d="M4 15.5h16" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="top"
              className="h-[100dvh] w-full overflow-y-auto border-none bg-background/95 pt-16 backdrop-blur-md"
              aria-describedby="menu-description"
            >
              <div className="sr-only"><SheetTitle>Menu</SheetTitle></div>
              <div className="flex flex-col items-center gap-6 px-6 pb-20" id="menu-description">
                <div className="flex w-full max-w-sm flex-col items-center gap-2">
                  {navGroups.map((group) => (
                    <div key={group.name} className="flex w-full flex-col items-center gap-2">
                      {group.dropdown ? (
                        <>
                          <div className="mb-2 mt-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {group.name}
                          </div>
                          {group.dropdown.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="w-full rounded-xl py-2 text-center text-xl font-medium transition-colors hover:bg-muted/50"
                            >
                              {item.name}
                            </Link>
                          ))}
                          {group.footerLink && (
                            <Link
                              to={group.footerLink.href}
                              className="w-full rounded-xl py-2 text-center text-lg font-medium text-blue-500 transition-colors hover:bg-blue-500/10"
                            >
                              {group.footerLink.name}
                            </Link>
                          )}
                        </>
                      ) : (
                        <Link
                          to={group.href}
                          className="w-full rounded-xl py-2 text-center text-xl font-medium transition-colors hover:bg-muted/50"
                        >
                          {group.name}
                        </Link>
                      )}
                    </div>
                  ))}
                  <div className="my-4 h-px w-12 bg-border" />
                  <Link
                    to="/search"
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-center text-xl font-medium transition-colors hover:bg-muted/50"
                  >
                    <Search className="h-5 w-5" /> Search
                  </Link>
                </div>

                {user ? (
                  <div className="mt-4 flex w-full max-w-sm flex-col gap-3">
                    <Link to={dashboardPath} className="w-full">
                      <Button className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                     
                      onClick={() => logout()}
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="mt-4 w-full max-w-sm">
                    <Button >
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      </motion.div>
    </div>
  );
}