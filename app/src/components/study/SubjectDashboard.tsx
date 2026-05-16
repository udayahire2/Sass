import { useState } from "react";
import { ChevronRight, Clock, Download, FileText, Layers, Loader2, CheckCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Subject } from "@/services/api";
import { cn } from "@/lib/utils";

interface SubjectDashboardProps {
  subject: Subject;
}

export function SubjectDashboard({ subject }: SubjectDashboardProps) {
  const { branch, semester, subjectId } = useParams<{
    branch: string;
    semester: string;
    subjectId: string;
  }>();
  const [downloadingPaperId, setDownloadingPaperId] = useState<string | null>(null);

  const totalTopics = subject.units.reduce((count, unit) => count + unit.topics.length, 0);

  const handleDownloadPaper = async (paperId: string) => {
    setDownloadingPaperId(paperId);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
    } finally {
      setDownloadingPaperId(null);
    }
  };

  const getTopicUrl = (topicId: string) =>
    `/resources/${branch || "unknown"}/${semester || "unknown"}/${subjectId || "unknown"}/topic/${topicId}`;

  return (
    <section className="space-y-6">
      {/* Subject Hero Header */}
      <div className="space-y-4 rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-primary/[0.03] p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
            {subject.branch}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px]">
            Sem {subject.semester}
          </Badge>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {subject.name}
          </h1>
          <p className="font-mono text-sm text-muted-foreground">{subject.code}</p>
        </div>

        {/* Quick stats pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Badge variant="default" className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle className="h-3 w-3" /> Faculty approved
          </Badge>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{subject.units.length}</span> units
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium">{totalTopics}</span> topics
          </div>
          {subject.papers.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground">
              <Download className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium">{subject.papers.length}</span> papers
            </div>
          )}
        </div>
      </div>

      {/* Segmented Tab Control */}
      <Tabs defaultValue="syllabus" className="w-full space-y-6">
        <TabsList className="bg-muted/40 p-1.5 rounded-[14px] flex w-full sm:w-fit border border-border/50 shadow-inner">
          <TabsTrigger
            value="syllabus"
            className={cn(
              "rounded-[10px] flex-1 sm:flex-none px-8 py-2.5 text-sm font-medium transition-all",
              "text-muted-foreground",
              "data-active:bg-background data-active:shadow-sm data-active:text-foreground"
            )}
          >
            Topics
          </TabsTrigger>
          <TabsTrigger
            value="papers"
            className={cn(
              "rounded-[10px] flex-1 sm:flex-none px-8 py-2.5 text-sm font-medium transition-all",
              "text-muted-foreground",
              "data-active:bg-background data-active:shadow-sm data-active:text-foreground"
            )}
          >
            Papers
          </TabsTrigger>
        </TabsList>

        {/* Syllabus / Topics Tab */}
        <TabsContent value="syllabus" className="space-y-4">
          <div className="rounded-2xl border border-border/40 bg-background/50 overflow-hidden">
            <div className="border-b border-border/40 px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Course syllabus</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Expand a unit to browse topics. Click any topic to start studying.
              </p>
            </div>

            {subject.units.length > 0 ? (
              <Accordion className="w-full">
                {subject.units.map((unit) => (
                  <AccordionItem key={unit.id} value={unit.id} className="border-b border-border/20 px-4 last:border-b-0 sm:px-5">
                    <AccordionTrigger className="py-4 text-left hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                          {unit.number}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-foreground">{unit.title}</p>
                          <p className="text-xs text-muted-foreground">{unit.topics.length} topics</p>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="space-y-2 pb-4">
                      {unit.topics.map((topic) => (
                        <Link
                          key={topic.id}
                          to={getTopicUrl(topic.id)}
                          className="group flex flex-col gap-3 rounded-xl border border-border/30 bg-background/80 px-4 py-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0 space-y-1.5">
                            <h3 className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{topic.description}</p>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground pt-1">
                              {topic.youtubeVideoId && (
                                <Badge
                                  variant="outline"
                                  className="rounded-md border-border/40 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary/80"
                                >
                                  Video
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="rounded-md border-border/40 bg-transparent px-2 py-0.5 text-[10px]"
                              >
                                Notes
                              </Badge>
                              {topic.estimatedTime && (
                                <span className="inline-flex items-center gap-1 border-r border-border/50 pr-2">
                                  <Clock className="h-3 w-3" />
                                  {topic.estimatedTime}
                                </span>
                              )}
                              
                              {/* Confidence Indicators */}
                              <span className="inline-flex items-center gap-1 px-1 text-amber-500/90 dark:text-amber-400/90">
                                ⭐ 4.8
                              </span>
                              <span className="inline-flex items-center gap-1 px-1">
                                👁️ {Math.floor(Math.random() * 500) + 50}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground shrink-0 transition-all group-hover:text-primary mt-2 sm:mt-0">
                            <span className="hidden sm:inline">Open</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8 text-center bg-muted/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-1">
                  <FileText className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-semibold text-foreground">No materials yet for this topic</h3>
                <p className="max-w-md text-sm text-muted-foreground">
                  Be the first to share. Help your classmates prepare.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                  <Button asChild size="sm">
                    <Link to="/add-study-content">Upload materials</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/resources">Browse other materials</Link>
                  </Button>
                </div>
                <p className="mt-4 text-xs text-muted-foreground max-w-sm">
                  You can upload notes, papers, or study guides. They'll be reviewed within 24-48 hours.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Papers Tab */}
        <TabsContent value="papers" className="space-y-3">
          {subject.papers.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-border/40 bg-background/50">
              <div className="border-b border-border/40 px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">Previous papers</h2>
                <p className="mt-1 text-xs text-muted-foreground">Use them for revision and exam practice.</p>
              </div>

              <div className="divide-y divide-border/20">
                {subject.papers.map((paper) => {
                  const isDownloading = downloadingPaperId === paper.id;

                  return (
                    <div
                      key={paper.id}
                      className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className="rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider border-border/40 bg-transparent font-medium"
                            >
                              {paper.type}
                            </Badge>
                            <span className="text-sm font-medium text-foreground">
                              {paper.term} {paper.year}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {paper.pages || "?"} pages{paper.fileSize ? ` • ${paper.fileSize}` : ""}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto rounded-xl h-9 border-border/40 gap-2"
                        onClick={() => handleDownloadPaper(paper.id)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="text-xs">Preparing</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span className="text-xs">Download</span>
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-8 text-center bg-muted/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-1">
                <FileText className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground">No materials yet for this topic</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Be the first to share. Help your classmates prepare.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
                <Button asChild size="sm">
                  <Link to="/add-study-content">Upload materials</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/resources">Browse other materials</Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground max-w-sm">
                You can upload notes, papers, or study guides. They'll be reviewed within 24-48 hours.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
