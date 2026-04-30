import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/services/api";

interface SubjectGridProps {
  subjects: Subject[];
  branch: string;
  semester: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function SubjectGrid({ subjects, branch, semester }: SubjectGridProps) {
  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/70 bg-background/70 p-10 text-center">
        <BookOpen className="h-10 w-10 text-muted-foreground/40" />
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">No subjects available yet</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            We could not find study material for {branch} semester {semester} right now.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/resources">Back to selection</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-foreground">Pick a subject</h2>
          <p className="text-sm text-muted-foreground">
            {branch} — Semester {semester} • {subjects.length} subject{subjects.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Button asChild variant="outline" className="w-fit rounded-full text-xs">
          <Link to="/resources">Change selection</Link>
        </Button>
      </div>

      {/* Card Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {subjects.map((subject) => {
          const unitCount = subject.unitCount ?? subject.units.length;
          const topicCount = subject.topicCount ?? subject.units.reduce((count, unit) => count + unit.topics.length, 0);

          return (
            <motion.div key={subject.id} variants={cardVariants}>
              <Link
                to={`${subject.id}`}
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-background hover:shadow-xl hover:shadow-primary/5"
              >
                {/* Decorative corner accent */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10" />

                {/* Subject icon + code + title */}
                <div className="relative z-10 flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-primary/8 text-primary transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/15 group-hover:shadow-md group-hover:shadow-primary/10">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Badge
                      variant="outline"
                      className="rounded-md border-border/40 bg-muted/30 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-muted-foreground"
                    >
                      {subject.code}
                    </Badge>
                    <h3 className="text-[15px] font-semibold leading-snug text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                      {subject.name}
                    </h3>
                  </div>
                </div>

                {/* Stats row */}
                <div className="relative z-10 mt-auto flex items-center gap-4 border-t border-border/40 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{unitCount} Units</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{topicCount} Topics</span>
                  </div>
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                    Study <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
