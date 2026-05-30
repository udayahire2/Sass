import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code, FileText, GraduationCap, Sparkles, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingIconProps {
  className?: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
}

function FloatingIcon({ className, icon, gradient, glowColor }: FloatingIconProps) {
  return (
    <div
      className={cn(
        "floating-avatar absolute flex items-center justify-center rounded-2xl border border-neutral-200/40 dark:border-neutral-800/40 bg-white/70 dark:bg-neutral-950/60 backdrop-blur-md shadow-xl transition-all duration-300 hover:scale-115 hover:rotate-3 hover:shadow-2xl cursor-pointer group select-none z-10",
        className
      )}
      style={{
        boxShadow: `0 10px 30px -10px ${glowColor}, inset 0 1px 0 0 rgba(255,255,255,0.15)`,
      }}
    >
      <div className={cn("flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br p-3 text-white transition-transform duration-300 group-hover:scale-105 shadow-inner", gradient)}>
        {icon}
      </div>
    </div>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const leftAvatarsRef = useRef<HTMLDivElement>(null);
  const rightAvatarsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate left avatars
    const leftAvatars = leftAvatarsRef.current?.querySelectorAll(".floating-avatar");
    const rightAvatars = rightAvatarsRef.current?.querySelectorAll(".floating-avatar");

    if (leftAvatars) {
      leftAvatars.forEach((avatar, i) => {
        gsap.to(avatar, {
          y: -12,
          duration: 2 + i * 0.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });
    }

    if (rightAvatars) {
      rightAvatars.forEach((avatar, i) => {
        gsap.to(avatar, {
          y: -10,
          duration: 2.2 + i * 0.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.25,
        });
      });
    }

    return () => {
      // Kill all animations on unmount
      if (leftAvatars) {
        leftAvatars.forEach((avatar) => gsap.killTweensOf(avatar));
      }
      if (rightAvatars) {
        rightAvatars.forEach((avatar) => gsap.killTweensOf(avatar));
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20 lg:pt-20 lg:pb-20">
      
      {/* Left Floating Icons - Hidden on Mobile */}
      <div ref={leftAvatarsRef} className="absolute left-0 top-0 hidden h-full w-1/3 lg:block">
        <FloatingIcon 
          className="top-[20%] left-[15%] h-16 w-16"
          icon={<GraduationCap className="h-7 w-7" />}
        />
        <FloatingIcon 
          className="top-[50%] left-[5%] h-12 w-12"
          icon={<Code className="h-5 w-5" />}
          gradient="from-purple-500 to-pink-500"
          glowColor="rgba(168, 85, 247, 0.35)"
        />
        <FloatingIcon 
          className="bottom-[25%] left-[25%] h-14 w-14"
          icon={<BookOpen className="h-6 w-6" />}
          gradient="from-emerald-500 to-teal-600"
          glowColor="rgba(16, 185, 129, 0.35)"
        />
      </div>

      {/* Right Floating Icons - Hidden on Mobile */}
      <div ref={rightAvatarsRef} className="absolute right-0 top-0 hidden h-full w-1/3 lg:block">
        <FloatingIcon 
          className="top-[25%] right-[20%] h-14 w-14"
          icon={<Sparkles className="h-6 w-6" />}
          gradient="from-amber-500 to-orange-600"
          glowColor="rgba(245, 158, 11, 0.35)"
        />
        <FloatingIcon 
          className="top-[60%] right-[10%] h-16 w-16"
          icon={<FileText className="h-7 w-7" />}
          gradient="from-rose-500 to-red-600"
          glowColor="rgba(244, 63, 94, 0.35)"
        />
        <FloatingIcon 
          className="bottom-[15%] right-[25%] h-12 w-12"
          icon={<Trophy className="h-5 w-5" />}
          gradient="from-cyan-500 to-blue-600"
          glowColor="rgba(6, 182, 212, 0.35)"
        />
      </div>

      {/* Main Content Container */}
      <div className="container relative z-10 mx-auto my-0 max-w-3xl px-4 text-center">
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="py-2 px-3">
              NMU Study Hub
            </Badge>
          </div>

          <h1 className="text-3xl tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
            Find exam prep material{" "}
            <span className="bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              designed for <span className="font-bold font-mono">your</span> semester
            </span>
            .
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            100+ topics organized by branch and semester. Access notes, previous
            papers, and syllabus—all in one place.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/resources")}>
              Start browsing
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/how-to-use")}>
              How it works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}