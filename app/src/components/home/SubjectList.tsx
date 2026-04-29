"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, BookOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────
const mockSubjects = [
  { id: "math-1", name: "Engineering Mathematics I",     branch: "Common",               semester: 1 },
  { id: "phy",    name: "Engineering Physics",           branch: "Common",               semester: 1 },
  { id: "math-2", name: "Engineering Mathematics II",    branch: "Common",               semester: 2 },
  { id: "chem",   name: "Engineering Chemistry",         branch: "Common",               semester: 2 },
  { id: "dsa",    name: "Data Structures & Algorithms",  branch: "Computer Engineering", semester: 3 },
  { id: "oop",    name: "Object Oriented Programming",   branch: "Computer Engineering", semester: 3 },
  { id: "os",     name: "Operating Systems",             branch: "Computer Engineering", semester: 4 },
  { id: "cn",     name: "Computer Networks",             branch: "Computer Engineering", semester: 4 },
  { id: "dbms",   name: "Database Management Systems",   branch: "Computer Engineering", semester: 5 },
  { id: "toc",    name: "Theory of Computation",         branch: "Computer Engineering", semester: 5 },
  { id: "ai",     name: "Artificial Intelligence",       branch: "Computer Engineering", semester: 6 },
  { id: "wt",     name: "Web Technology",                branch: "Computer Engineering", semester: 6 },
];

// ─────────────────────────────────────────────
// Framer Motion variants
// ─────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, x: -16 },
  show:   { opacity: 1, x: 0 },
};

// ─────────────────────────────────────────────
// SubjectList
// ─────────────────────────────────────────────
interface SubjectListProps {
  selectedSemester: number;
}

export function SubjectList({ selectedSemester }: SubjectListProps) {
  const subjects = mockSubjects.filter((s) => s.semester === selectedSemester);

  return (
    <section id="subject-list" className="mx-auto my-12 w-full max-w-3xl px-4">

      {/* Section header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-semibold md:text-2xl">
          Subjects – Semester {selectedSemester}
        </h2>
      </div>

      {/* Subject cards */}
      {subjects.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-3"
        >
          {subjects.map((subject) => (
            <motion.div key={subject.id} variants={item}>
              <Link to={`/subject/${subject.id}`} className="block">
                <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-accent/50">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium leading-tight">
                        {subject.name}
                      </p>
                      {subject.branch && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          {subject.branch}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No subjects found for this semester yet.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default SubjectList;
