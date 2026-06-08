import type { ComponentType } from "react";
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  FolderOpen,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
      "Find materials by branch, semester, and subject in seconds.",
    href: "/resources",
    icon: BookOpen,
  },
  {
    id: "branch-curriculum",
    title: "Syllabus reference",
    description:
      "Search using subject name or course code and know what to study.",
    href: "/syllabus",
    icon: FileText,
  },
  {
    id: "archives",
    title: "Previous papers & resources",
    description:
      "Access notes, exam papers, and curated study resources.",
    href: "/resources",
    icon: FolderOpen,
  },
  {
    id: "collaboration",
    title: "Share & help others",
    description:
      "Upload notes, contribute resources, and support classmates.",
    href: "/add-study-content",
    icon: Users,
  },
];

const gridStyles = [
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-1",
];

export function FeatureGrid() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="mb-14 flex flex-col items-center text-center">
          <Badge
            variant="secondary"
            className="mb-5 rounded-full px-3 py-1 font-medium"
          >
            Features
          </Badge>

          <div className="max-w-3xl space-y-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-5xl">
              Everything you need to
              <span className="text-muted-foreground">
                {" "}
                prepare smarter.
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Organized study materials, syllabus references,
              previous papers, and collaborative uploads — all
              designed for NMU students.
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURE_ITEMS.map((feature, index) => (
            <Link
              key={feature.id}
              to={feature.href}
              className={cn(
                "group block",
                gridStyles[index]
              )}
            >
              <Card className="h-full border-border/60 bg-background shadow-none transition-colors hover:bg-muted/30">
                <CardContent className="flex h-full flex-col p-6 lg:p-8">
                  {/* Top */}
                  <div className="mb-10 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/40">
                      <feature.icon className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-background opacity-0 transition-all duration-200 group-hover:opacity-100">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-auto max-w-md space-y-3">
                    <h3 className="text-xl font-medium tracking-tight md:text-2xl">
                      {feature.title}
                    </h3>

                    <p className="text-sm leading-6 text-muted-foreground md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}