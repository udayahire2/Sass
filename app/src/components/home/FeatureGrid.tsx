import type { ComponentType } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderOpen,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type FeatureIcon = ComponentType<{
  className?: string;
}>;

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
    title: "Smart subject finder",
    description:
      "Locate study resources organized by engineering branch, semester, and course code in seconds.",
    href: "/resources",
    icon: BookOpen,
  },
  {
    id: "branch-curriculum",
    title: "Syllabus reference",
    description:
      "Quickly look up official syllabus content using subject name or university course code.",
    href: "/syllabus",
    icon: FileText,
  },
  {
    id: "archives",
    title: "Previous papers & notes",
    description:
      "Access previous semester exam papers and structured reading notes shared by other students.",
    href: "/resources",
    icon: FolderOpen,
  },
  {
    id: "collaboration",
    title: "Student upload system",
    description:
      "Directly contribute notes, papers, or digital notes to support your university peers.",
    href: "/add-study-content",
    icon: Users,
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header Section */}
        <div className="mb-16 space-y-4 max-w-2xl">
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
            Workspace Capabilities
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything required to organize your semester.
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A minimalist resource catalog, structured syllabus reference, and peer-to-peer sharing mechanism built to reduce study prep time.
          </p>
        </div>

        {/* Minimal Grid Layout with thin borders */}
        <div className="grid grid-cols-1 border-t border-l border-border/60 sm:grid-cols-2">
          {FEATURE_ITEMS.map((feature) => (
            <Link
              key={feature.id}
              to={feature.href}
              className="group block border-r border-b border-border/60 p-8 transition-colors duration-200 hover:bg-muted/10"
            >
              <div className="flex h-full flex-col justify-between space-y-8">
                {/* Icon & Arrow */}
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border/80 bg-muted/10 text-muted-foreground transition-colors duration-200 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20">
                    <feature.icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/80" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}