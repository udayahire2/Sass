import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Layers,
  Loader2,
  Sparkles,
  Video,
} from "lucide-react";

import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Frame, FrameDescription, FrameHeader, FramePanel, FrameTitle } from "@/components/ui/frame";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import type { Subject } from "@/services/api";

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
      {/* Subject Hero Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="default">{subject.branch}</Badge>
            <Badge variant="secondary">Sem {subject.semester}</Badge>
            <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle className="h-3 w-3" />
              Faculty approved
            </Badge>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">{subject.name}</CardTitle>
          <CardDescription className="font-mono text-sm">{subject.code}</CardDescription>
        </CardHeader>

        <CardPanel className="pt-0">
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold">{subject.units.length}</span> units
            </Badge>
            <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold">{totalTopics}</span> topics
            </Badge>
            {subject.papers.length > 0 && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Download className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold">{subject.papers.length}</span> papers
              </Badge>
            )}
          </div>
        </CardPanel>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="syllabus" className="w-full space-y-6">
        <TabsList>
          <TabsTab value="syllabus" className="gap-2">
            Topics
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
              {totalTopics}
            </Badge>
          </TabsTab>
          <TabsTab value="papers" className="gap-2">
            Papers
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[11px]">
              {subject.papers.length}
            </Badge>
          </TabsTab>
        </TabsList>

        {/* Topics Panel */}
        <TabsPanel value="syllabus" className="space-y-4">
          <Frame>
            <FrameHeader>
              <FrameTitle>Course syllabus</FrameTitle>
              <FrameDescription>
                Expand a unit to browse topics. Click any topic to start studying.
              </FrameDescription>
            </FrameHeader>

            <FramePanel className="p-0">
              {subject.units.length > 0 ? (
                <Accordion className="w-full">
                  {subject.units.map((unit) => (
                    <AccordionItem key={unit.id} value={unit.id} className="px-4 sm:px-5">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                            {unit.number}
                          </span>
                          <div className="space-y-0.5">
                            <span className="block text-sm font-semibold">{unit.title}</span>
                            <span className="block text-xs text-muted-foreground">{unit.topics.length} topics</span>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionPanel className="pb-4">
                        <ItemGroup className="gap-2">
                          {unit.topics.map((topic) => (
                            <Item
                              key={topic.id}
                              asChild
                              variant="outline"
                              className="group cursor-pointer p-4 transition-all hover:border-primary/40 hover:bg-accent/40"
                            >
                              <Link to={getTopicUrl(topic.id)}>
                                <ItemContent>
                                  <ItemTitle className="group-hover:text-primary transition-colors">
                                    {topic.title}
                                  </ItemTitle>
                                  {topic.description && (
                                    <ItemDescription>{topic.description}</ItemDescription>
                                  )}
                                </ItemContent>

                                <ItemActions className="flex-wrap gap-2">
                                  {topic.youtubeVideoId && (
                                    <Badge variant="outline" className="gap-1 text-[10px] text-rose-500 border-rose-500/20 bg-rose-500/5">
                                      <Video className="h-3 w-3" />
                                      Video
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px]">
                                    Notes
                                  </Badge>
                                  {topic.estimatedTime && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      {topic.estimatedTime}
                                    </span>
                                  )}
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                                    <Sparkles className="h-3 w-3" /> 4.8
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                                </ItemActions>
                              </Link>
                            </Item>
                          ))}
                        </ItemGroup>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <EmptyDashboardState />
              )}
            </FramePanel>
          </Frame>
        </TabsPanel>

        {/* Papers Panel */}
        <TabsPanel value="papers" className="space-y-4">
          <Frame>
            <FrameHeader>
              <FrameTitle>Previous papers</FrameTitle>
              <FrameDescription>Use them for revision and exam practice.</FrameDescription>
            </FrameHeader>

            <FramePanel className="p-0">
              {subject.papers.length > 0 ? (
                <ItemGroup>
                  {subject.papers.map((paper, idx) => {
                    const isDownloading = downloadingPaperId === paper.id;

                    return (
                      <div key={paper.id}>
                        {idx > 0 && <ItemSeparator />}
                        <Item className="p-4 sm:p-5">
                          <ItemContent>
                            <ItemTitle className="gap-2 flex-wrap">
                              <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                                {paper.type}
                              </Badge>
                              <span>
                                {paper.term} {paper.year}
                              </span>
                            </ItemTitle>
                            <ItemDescription>
                              {paper.pages || "?"} pages{paper.fileSize ? ` • ${paper.fileSize}` : ""}
                            </ItemDescription>
                          </ItemContent>

                          <ItemActions>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl gap-2"
                              onClick={() => handleDownloadPaper(paper.id)}
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  <span>Preparing</span>
                                </>
                              ) : (
                                <>
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </>
                              )}
                            </Button>
                          </ItemActions>
                        </Item>
                      </div>
                    );
                  })}
                </ItemGroup>
              ) : (
                <EmptyDashboardState />
              )}
            </FramePanel>
          </Frame>
        </TabsPanel>
      </Tabs>
    </section>
  );
}

function EmptyDashboardState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText className="h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>No materials yet for this topic</EmptyTitle>
        <EmptyDescription>
          Be the first to share. Help your classmates prepare. Notes, papers, or study guides are reviewed within 24-48 hours.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex flex-col sm:flex-row items-center gap-3">
        <Button size="sm" >
          <Link to="/add-study-content">Upload materials</Link>
        </Button>
        <Button variant="outline" size="sm" >
          <Link to="/resources">Browse other materials</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}