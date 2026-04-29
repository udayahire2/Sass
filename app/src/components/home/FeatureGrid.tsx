import type { ComponentType, SVGProps } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

import {
  ArchiveDocumentIcon,
  CollaborationOrbitIcon,
  CurriculumLayersIcon,
  VerifiedStudyIcon,
} from "@/svg/feature-icons";
import { cn } from "@/lib/utils";

export type FeatureIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: FeatureIcon;
}

const FEATURE_ITEMS: FeatureItem[] = [
  {
    id: "verified-materials",
    title: "Study materials by semester",
    description: "Open the right subject quickly without browsing through noise.",
    href: "/resources",
    icon: VerifiedStudyIcon,
  },
  {
    id: "branch-curriculum",
    title: "Simple syllabus search",
    description: "Search by subject or code. Instantly view required modules.",
    href: "/syllabus",
    icon: CurriculumLayersIcon,
  },
  {
    id: "archives",
    title: "Previous paper access",
    description: "Keep revision practical with organized historical papers.",
    href: "/resources",
    icon: ArchiveDocumentIcon,
  },
  {
    id: "collaboration",
    title: "Cleaner student flow",
    description: "Built for speed. Less noise, faster reading, better grades.",
    href: "/resources",
    icon: CollaborationOrbitIcon,
  },
];

// Bento Layout mapping for 4 items in a 3-column grid
const bentoStyles = [
  "lg:col-span-1", // top left (small)
  "lg:col-span-2", // top right (wide)
  "lg:col-span-2", // bottom left (wide)
  "lg:col-span-1", // bottom right (small)
];

export function FeatureGrid() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="mb-14 max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3 px-3 py-1 bg-primary/10 w-fit mx-auto rounded-full">
            Start fast
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl mb-4">
            Find your study material <br className="hidden sm:block" /> in seconds
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Skip the clutter. Access syllabus, notes, and papers instantly.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURE_ITEMS.map((feature, index) => (
            <Link
              key={feature.id}
              to={feature.href}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 lg:p-8 transition-all hover:shadow-md hover:border-border/80",
                bentoStyles[index]
              )}
            >
              <div className="flex flex-col h-full">
                {/* Icon */}
                <div className="mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background text-foreground group-hover:scale-105 transition-transform duration-200">
                    <feature.icon className="h-6 w-6 opacity-80 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Content */}
                <div className="mt-auto">
                  <h3 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Top Right Arrow */}
              <div className="absolute top-6 right-6 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200">
                <div className="flex items-center justify-center h-8 w-8 rounded-full border border-border bg-background shadow-sm">
                  <ArrowUpRight className="h-4 w-4 text-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}