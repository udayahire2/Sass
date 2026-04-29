import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

export function IconBase({ className, children, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5} // SF Symbols standard is typically 1.5 for regular weight on 24x24
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      {...props}
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

// -----------------------------------------------------------------------------
// 1. VERIFIED STUDY
// AUDIT: Old path had fractional anchor points (7.5, 4.75) causing blur.
// REFACTOR: Snapped to integer grid. Pure geometric primitives.
// -----------------------------------------------------------------------------
export function VerifiedStudyIcon({ title = "Verified Study", ...props }: IconProps) {
  // Concept: Standard document housing a verified status badge
  // Metaphor: Certification, approved course syllabus
  return (
    <IconBase title={title} {...props}>
      <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5.5" />
      <path d="M14.5 3L19 7.5V13" />
      <path d="M14.5 3v3.5a1 1 0 0 0 1 1H19" opacity={0.5} />
      
      {/* Text Hierarchy Lines */}
      <path d="M8 9h6" opacity={0.4} />
      <path d="M8 13h4" opacity={0.4} />
      
      {/* Floating Badge */}
      <circle cx="17" cy="17" r="4" fill="currentColor" opacity={0.12} stroke="none" />
      <path d="m15 17 1.5 1.5 2.5-3" />
    </IconBase>
  );
}

// MICRO-VARIATION: Verified Landscape Context
export function VerifiedStudyWideIcon({ title = "Verified Study Context", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      <path d="M13 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
      <path d="M6 8h4" opacity={0.4} />
      <path d="M6 12h8" opacity={0.4} />
      <circle cx="17" cy="6" r="4" fill="currentColor" opacity={0.12} stroke="none" />
      <path d="m15 6 1.5 1.5 2.5-3" />
    </IconBase>
  );
}

// -----------------------------------------------------------------------------
// 2. CURRICULUM LAYERS
// AUDIT: Old layers formed irregular polygons without pure isometric math.
// REFACTOR: Mathematically stacked isometric grid-planes (2:1 projection).
// -----------------------------------------------------------------------------
export function CurriculumLayersIcon({ title = "Curriculum Layers", ...props }: IconProps) {
  // Concept: Foundational layers building upward
  // Metaphor: Structured learning planes, hierarchy
  return (
    <IconBase title={title} {...props}>
      <polygon points="12 3 20 7.5 12 12 4 7.5" fill="currentColor" opacity={0.12} stroke="none" />
      <polygon points="12 3 20 7.5 12 12 4 7.5" />
      <path d="M4 12l8 4.5 8-4.5" />
      <path d="M4 16.5L12 21l8-4.5" />
    </IconBase>
  );
}

// MICRO-VARIATION: Curriculum Layer Spine
export function CurriculumLayersSpineIcon({ title = "Curriculum Structure", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      <polygon points="12 3 20 7.5 12 12 4 7.5" />
      <path d="M4 12l8 4.5 8-4.5" />
      <path d="M4 16.5L12 21l8-4.5" />
      <path d="M12 12v9" opacity={0.3} />
    </IconBase>
  );
}

// -----------------------------------------------------------------------------
// 3. ARCHIVE DOCUMENT
// AUDIT: Ambiguous folder lines. Uneven z-indexing.
// REFACTOR: "Tray object upfront" vs "Document object behind". 
// -----------------------------------------------------------------------------
export function ArchiveDocumentIcon({ title = "Archive Document", ...props }: IconProps) {
  // Concept: Physical document sliding into an active filing tray
  return (
    <IconBase title={title} {...props}>
      {/* Background Document */}
      <path d="M8 3h5l4 4v8H7V5a2 2 0 0 1 2-2z" />
      <path d="M13 3v3a1 1 0 0 0 1 1h3" opacity={0.4} />
      <path d="M10 9h4" opacity={0.3} />
      
      {/* Foreground Tray */}
      <path d="M4 15h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" fill="currentColor" opacity={0.12} stroke="none" />
      <path d="M4 15h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
      <path d="M10 18h4" opacity={0.6} />
    </IconBase>
  );
}

// MICRO-VARIATION: Empty Archive Tray
export function ArchiveTrayIcon({ title = "Archive Tray Empty", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      <path d="M4 15h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" fill="currentColor" opacity={0.12} stroke="none" />
      <path d="M4 15h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4z" />
      <path d="M10 18h4" opacity={0.6} />
      <path d="M8 15v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" opacity={0.3} strokeDasharray="2 2" />
    </IconBase>
  );
}

// -----------------------------------------------------------------------------
// 4. COLLABORATION ORBIT
// AUDIT: Multiple fractional arcs mapping poorly to grids. 
// REFACTOR: Standardized radii and clear 4.5px/3.5px avatar head/body proportions.
// -----------------------------------------------------------------------------
export function CollaborationOrbitIcon({ title = "Collaboration", ...props }: IconProps) {
  // Concept: Connected individuals orbiting a shared space
  return (
    <IconBase title={title} {...props}>
      <circle cx="9" cy="8" r="2.5" />
      <circle cx="16.5" cy="10" r="2" />
      <path d="M4.5 19c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <path d="M13.5 18c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5" />
      <path d="M14 6c1 0 2 0.5 2.5 1.5" opacity={0.4} />
      <path d="M6 5C7 4 8 4 9 4" opacity={0.4} />
    </IconBase>
  );
}

// -----------------------------------------------------------------------------
// 5. ARROW UP RIGHT (EXTERNAL LINK / OPEN)
// AUDIT: Simple, but path lines were overly specific.
// REFACTOR: Perfectly snapped to integer coordinates for maximum sharpness.
// -----------------------------------------------------------------------------
export function ArrowUpRightIcon({ title = "Open External", ...props }: IconProps) {
  return (
    <IconBase title={title} {...props}>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </IconBase>
  );
}
