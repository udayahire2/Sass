import { BookOpen, ChevronRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
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
      <Empty className="rounded-2xl border border-dashed p-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpen className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>No subjects available yet</EmptyTitle>
          <EmptyDescription>
            We could not find study material for {branch} semester {semester} right now.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/resources">Back to selection</Link>
          </Button>
        </EmptyContent>
      </Empty>
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
          const topicCount =
            subject.topicCount ??
            subject.units.reduce((count, unit) => count + unit.topics.length, 0);

          return (
            <motion.div key={subject.id} variants={cardVariants} className="h-full">
              <Link to={`${subject.id}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-xl group-hover:shadow-primary/5">
                  <CardHeader className="flex flex-row items-start gap-3.5 space-y-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase">
                        {subject.code}
                      </Badge>
                      <CardTitle className="text-[15px] font-semibold leading-snug line-clamp-2 transition-colors group-hover:text-primary">
                        {subject.name}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  <CardFooter className="mt-auto flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5" />
                      <span>{unitCount} Units</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{topicCount} Topics</span>
                    </div>
                    <span className="flex items-center gap-1 font-semibold text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2">
                      Study <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
