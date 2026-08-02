import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import logoImage from "../../assets/brandlogo/logo.png"; // adjust path as needed

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  showText?: boolean;
}

export function Logo({ className, showText = true, ...props }: LogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!showText || !textRef.current || !containerRef.current) return;

    gsap.set(textRef.current, {
      opacity: 0,
      x: -8,
      visibility: "visible",
    });

    const container = containerRef.current;
    const textEl = textRef.current;
    const iconEl = iconRef.current;

    const handleMouseEnter = () => {
      gsap.to(textEl, {
        opacity: 1,
        x: 0,
        duration: 0.4,
        ease: "power2.out",
      });
      gsap.to(iconEl, {
        scale: 1.05,
        duration: 0.4,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(textEl, {
        opacity: 0,
        x: -8,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(iconEl, {
        scale: 1,
        duration: 0.3,
        ease: "power2.in",
      });
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      gsap.killTweensOf([textEl, iconEl]);
    };
  }, [showText]);

  return (
    <div
      ref={containerRef}
      className={cn("flex items-center gap-6", className)} // increased gap from gap-4 to gap-6
      {...props}
    >
      {/* Logo Icon */}
      <div
        ref={iconRef}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center"
      >
        {!imgError ? (
          <img
            src={logoImage}
            alt="NMU StudyHub logo"
            className="h-full w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            NS
          </div>
        )}
      </div>

      {/* Text Lockup */}
      {showText && (
        <div
          ref={textRef}
          className="flex flex-col justify-center -space-y-1 will-change-transform"
        >
          <span className="text-[18px] font-extrabold leading-none tracking-tight text-foreground sm:text-xl">
            NMU
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
            StudyHub
          </span>
        </div>
      )}
    </div>
  );
}