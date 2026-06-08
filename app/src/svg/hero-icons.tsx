import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function IconBase({ className, children, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75} /* Slightly thicker for premium UI presence */
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 transition-all duration-200", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function HeroGraduationCapIcon({ title = "Graduation Cap", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Structural duotone fill with distinct geometry */}
      <polygon points="12 3 22 8 12 13 2 8" fill="currentColor" opacity={0.15} stroke="none" />
      <polygon points="12 3 22 8 12 13 2 8" />
      {/* 3D Cap fold effect */}
      <path d="M6 10.5V15c0 2.5 2.5 4 6 4s6-1.5 6-4v-4.5" />
      <path d="M12 13v6" opacity={0.3} /> {/* Central crease accent */}
      {/* Tassel upgrade */}
      <path d="M22 8v7c0 .8-.6 1.5-1.5 1.5" />
      <circle cx="20.5" cy="18" r="1.5" fill="currentColor" opacity={0.3} />
    </IconBase>
  );
}

export function HeroCodeIcon({ title = "Code", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Terminal window duotone */}
      <rect x="2" y="4" width="20" height="16" rx="3" fill="currentColor" opacity={0.1} stroke="none" />
      <rect x="2" y="4" width="20" height="16" rx="3" />
      {/* UI window top bar accent */}
      <path d="M2 9h20" opacity={0.3} />
      <circle cx="6" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
      {/* Code brackets */}
      <path d="M9 13.5l-2.5-2 2.5-2" />
      <path d="M15 13.5l2.5-2-2.5-2" />
    </IconBase>
  );
}

export function HeroBookOpenIcon({ title = "Open Book", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Pages duotone fill */}
      <path d="M2 4h5.5a4.5 4.5 0 0 1 4.5 4.5v12a3 3 0 0 0-3-3H2z" fill="currentColor" opacity={0.12} stroke="none" />
      <path d="M22 4h-5.5a4.5 4.5 0 0 0-4.5 4.5v12a3 3 0 0 1 3-3H22z" fill="currentColor" opacity={0.12} stroke="none" />
      {/* Crisper page outlines */}
      <path d="M2 4h5.5a4.5 4.5 0 0 1 4.5 4.5v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-5.5a4.5 4.5 0 0 0-4.5 4.5v12a3 3 0 0 1 3-3H22z" />
      {/* Ribbon / Bookmark accent */}
      <path d="M12 4v8" opacity={0.4} />
      <path d="M10 4h4" opacity={0.4} />
    </IconBase>
  );
}

export function HeroSparklesIcon({ title = "Sparkles", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Main Sparkle */}
      <path d="M12 3c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z" fill="currentColor" opacity={0.15} stroke="none" />
      <path d="M12 3c0 4.5 1.5 6 6 6-4.5 0-6 1.5-6 6 0-4.5-1.5-6-6-6 4.5 0 6-1.5 6-6z" />
      {/* Secondary Sparkle */}
      <path d="M19 4c0 1.5.5 2 2 2-1.5 0-2 .5-2 2 0-1.5-.5-2-2-2 1.5 0 2-.5 2-2z" fill="currentColor" stroke="none" opacity={0.4} />
      {/* Tertiary Sparkle */}
      <path d="M6 17c0 1.5.5 2 2 2-1.5 0-2 .5-2 2 0-1.5-.5-2-2-2 1.5 0 2-.5 2-2z" fill="currentColor" stroke="none" opacity={0.4} />
    </IconBase>
  );
}

export function HeroFileTextIcon({ title = "Document", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Document Fill */}
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" opacity={0.1} stroke="none" />
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      {/* Premium Folded Corner */}
      <path d="M14 2v4a2 2 0 0 0 2 2h4" fill="currentColor" opacity={0.15} />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      {/* Typography Lines with varied rhythms */}
      <path d="M8 13h8" opacity={0.4} />
      <path d="M8 17h5" opacity={0.4} />
    </IconBase>
  );
}

export function HeroTrophyIcon({ title = "Trophy", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      {/* Cup duotone fill */}
      <path d="M6 9h12v2c0 3.5-2.5 6-6 6s-6-2.5-6-6V9z" fill="currentColor" opacity={0.15} stroke="none" />
      {/* Cup structure */}
      <path d="M6 9h12v2c0 3.5-2.5 6-6 6s-6-2.5-6-6V9z" />
      {/* Handles properly proportioned */}
      <path d="M6 10H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h2" />
      <path d="M18 10h2a2 2 0 0 0 2-2V5c0-1.1-.9-2-2-2h-2" />
      {/* Detailed Pedestal */}
      <path d="M12 17v4" />
      <path d="M9 21h6" />
      <path d="M10 17h4" opacity={0.4} /> {/* Base connection ring */}
    </IconBase>
  );
}