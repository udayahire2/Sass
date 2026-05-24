import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      
      {/* Left Floating Avatars - Hidden on Mobile */}
      <div ref={leftAvatarsRef} className="absolute left-0 top-0 hidden h-full w-1/3 lg:block">
        <Avatar className="floating-avatar absolute top-[20%] left-[15%] h-16 w-16 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            M
          </AvatarFallback>
        </Avatar>
        <Avatar className="floating-avatar absolute top-[50%] left-[5%] h-12 w-12 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            A
          </AvatarFallback>
        </Avatar>
        <Avatar className="floating-avatar absolute bottom-[25%] left-[25%] h-14 w-14 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            C
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Right Floating Avatars - Hidden on Mobile */}
      <div ref={rightAvatarsRef} className="absolute right-0 top-0 hidden h-full w-1/3 lg:block">
        <Avatar className="floating-avatar absolute top-[25%] right-[20%] h-14 w-14 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            N
          </AvatarFallback>
        </Avatar>
        <Avatar className="floating-avatar absolute top-[60%] right-[10%] h-16 w-16 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            B
          </AvatarFallback>
        </Avatar>
        <Avatar className="floating-avatar absolute bottom-[15%] right-[25%] h-12 w-12 border border-border/50">
          <AvatarImage 
            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop" 
            alt="Student avatar" 
          />
          <AvatarFallback className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            D
          </AvatarFallback>
        </Avatar>
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