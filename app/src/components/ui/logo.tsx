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

    const container = containerRef.current;
    const textEl = textRef.current;
    const iconEl = iconRef.current;

    // Initial state: fully collapsed, no ghost gap or layout displacement
    gsap.set(textEl, {
      maxWidth: 0,
      opacity: 0,
      x: -6,
      marginLeft: 0,
      overflow: "hidden",
    });

    const handleMouseEnter = () => {
      const targetWidth = textEl.scrollWidth || 100;
      gsap.to(textEl, {
        maxWidth: targetWidth,
        opacity: 1,
        x: 0,
        marginLeft: 10, // clean 10px (gap-2.5) spacing
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
      if (iconEl) {
        gsap.to(iconEl, {
          scale: 1.05,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(textEl, {
        maxWidth: 0,
        opacity: 0,
        x: -6,
        marginLeft: 0,
        duration: 0.28,
        ease: "power2.inOut",
        overwrite: "auto",
      });
      if (iconEl) {
        gsap.to(iconEl, {
          scale: 1,
          duration: 0.28,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      }
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
      className={cn("inline-flex items-center cursor-pointer select-none", className)}
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
          className="flex flex-col justify-center -space-y-1 will-change-[max-width,opacity,margin] overflow-hidden whitespace-nowrap"
          style={{ maxWidth: 0, opacity: 0, marginLeft: 0 }}
        >
          <span className="text-[18px] font-extrabold leading-none tracking-tight text-foreground sm:text-xl whitespace-nowrap">
            NMU
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] whitespace-nowrap">
            StudyHub
          </span>
        </div>
      )}
    </div>
  );
}
