import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Clock } from "lucide-react";
import { Badge } from "../ui/badge";
export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24">
      {/* Main Content Container */}
      <div className="container relative z-10 mx-auto my-0 max-w-3xl px-4 text-center">
        <div className="space-y-4">
          <div>
            <Badge variant="secondary" className="py-2 px-3">
              NMU Study Hub
            </Badge>
          </div>

          <h1 className="text-3xl tracking-tight sm:text-5xl md:text-4xl lg:text-5xl">
            Find exam prep material{" "}
            <span className="bg-gradient-to-r from-primary to-primary/40 bg-clip-text text-transparent">
              designed for <span className="font-bold font-mono">your</span> semester
            </span>
            .
          </h1>

          <p className="mx-auto max-w-2xl text-lg font-normal leading-relaxed text-muted-foreground/90 md:text-xl">
            100+ topics organized by branch and semester. Access notes, previous
            papers, and syllabus—all in one place.
          </p>

          <div className="flex flex-col justify-center gap-4 pt-2 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/resources")}>
              Start browsing
            </Button>
            <Button size="lg" variant="ghost" onClick={() => navigate("/how-to-use")}>
              How it works
            </Button>
          </div>
        </div>
      </div>

      {/* Product Workspace Mockup */}
      <div className="mx-auto mt-16 max-w-4xl px-4">
        <div className="rounded-xl border border-border/80 bg-card shadow-[0_20px_50px_rgba(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Title Bar */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-success/60" />
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/80 select-none">
              nmu-studyhub.app/computer/sem-4/data-structures
            </div>
            <div className="w-12" /> {/* Spacer */}
          </div>
          
          {/* App Body */}
          <div className="flex h-[320px] md:h-[360px] bg-background">
            {/* Mock Sidebar */}
            <div className="hidden sm:flex w-48 shrink-0 flex-col border-r border-border/50 bg-muted/10 p-4 space-y-5">
              <div className="space-y-2">
                <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">
                  Engineering Branch
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 rounded-md bg-accent/80 text-accent-foreground px-2 py-1.5 text-xs font-semibold">
                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                    <span>Computer Eng.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2">
                  Core Subjects
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground px-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Data Structures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-transparent border border-muted-foreground/40" />
                    <span>Operating Systems</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-transparent border border-muted-foreground/40" />
                    <span>Microprocessors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-transparent border border-muted-foreground/40" />
                    <span>Software Eng.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Main Workspace */}
            <div className="flex-1 flex flex-col p-5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-border/40">
                <div>
                  <h3 className="text-base font-bold text-foreground">Data Structures</h3>
                  <p className="text-[10px] text-muted-foreground">Course Code: CS402 • Sem 4</p>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-semibold">
                    Core Subject
                  </span>
                </div>
              </div>

              {/* Units Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground/60 font-mono uppercase">Unit 1</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-semibold">9 Topics</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Linear Data Structures</h4>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">Arrays, Stacks, Queues, Linked Lists, Circular structures and their applications.</p>
                  <div className="flex gap-2 pt-1">
                    <div className="text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5" /> Notes
                    </div>
                    <div className="text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Previous Papers
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 p-4 space-y-3 bg-card/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground/60 font-mono uppercase">Unit 2</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded font-semibold">7 Topics</span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">Non-Linear Data Structures</h4>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">Trees, Binary Trees, Traversals, AVL Trees, Heaps, and Priority Queues representation.</p>
                  <div className="flex gap-2 pt-1">
                    <div className="text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium flex items-center gap-1">
                      <FileText className="h-2.5 w-2.5" /> Notes
                    </div>
                    <div className="text-[9px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Previous Papers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}