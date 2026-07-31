import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  Loader2,
  RefreshCw,
  Video,
  Copy,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { type Subject, type Topic } from "@/services/api";
import { cn } from "@/lib/utils";

interface TopicViewerProps {
  topic: Topic;
  subject?: Subject;
  onComplete?: () => void;
}

// Custom hook for managing topic completion status
const useTopicCompletion = (topicId: string) => {
  const [isCompleted, setIsCompleted] = useState(() => {
    const stored = localStorage.getItem(`topic_complete_${topicId}`);
    return stored === "true";
  });

  const markComplete = useCallback(async () => {
    localStorage.setItem(`topic_complete_${topicId}`, "true");
    setIsCompleted(true);
  }, [topicId]);

  const resetCompletion = useCallback(() => {
    localStorage.removeItem(`topic_complete_${topicId}`);
    setIsCompleted(false);
  }, [topicId]);

  return { isCompleted, markComplete, resetCompletion };
};

export const TopicViewer = ({ topic, subject, onComplete }: TopicViewerProps) => {
  const { branch, semester, subjectId } = useParams<{
    branch: string;
    semester: string;
    subjectId: string;
  }>();

  // Video states
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();

  // Topic completion management
  const { isCompleted, markComplete } = useTopicCompletion(topic.id);

  // Reset video states when topic changes
  useEffect(() => {
    setIsVideoLoading(true);
    setHasVideoError(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [topic.id]);

  // Show/hide sticky bottom bar based on scroll position
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-48px 0px 0px 0px" }
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    return () => observer.disconnect();
  }, [topic.id]);

  // Compute next / previous topics and progress
  const { prevTopic, nextTopic, currentIndex, totalTopics } = useMemo(() => {
    if (!subject) {
      return { prevTopic: null, nextTopic: null, currentIndex: 0, totalTopics: 0 };
    }
    const allTopics = subject.units.flatMap((u) => u.topics);
    const idx = allTopics.findIndex((t) => t.id === topic.id);
    return {
      prevTopic: idx > 0 ? allTopics[idx - 1] : null,
      nextTopic: idx < allTopics.length - 1 ? allTopics[idx + 1] : null,
      currentIndex: idx + 1,
      totalTopics: allTopics.length,
    };
  }, [subject, topic.id]);

  const getTopicUrl = useCallback(
    (topicId: string) =>
      `/resources/${branch || "unknown"}/${semester || "unknown"}/${subjectId || "unknown"}/topic/${topicId}`,
    [branch, semester, subjectId]
  );

  const handleMarkComplete = useCallback(async () => {
    if (isCompleted || isMarkingComplete) return;
    setIsMarkingComplete(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      await markComplete();
      onComplete?.();
    } finally {
      setIsMarkingComplete(false);
    }
  }, [isCompleted, isMarkingComplete, markComplete, onComplete]);

  const handleRetryVideo = useCallback(() => {
    setIsVideoLoading(true);
    setHasVideoError(false);
    const iframe = videoContainerRef.current?.querySelector("iframe");
    if (iframe) {
      const src = iframe.src;
      iframe.src = "";
      setTimeout(() => {
        iframe.src = src;
      }, 100);
    }
  }, []);

  const hasVideo = Boolean(topic.youtubeVideoId);
  const hasNotes = Boolean(topic.markdownContent?.trim() || topic.contentMarkdown?.trim());
  const hasSummary = Boolean(topic.summaryPoints?.length);
  const progressPercentage = totalTopics > 0 ? (currentIndex / totalTopics) * 100 : 0;

  const markdownContent = topic.contentMarkdown || topic.markdownContent || "";

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleOpenInNotes = () => {
    localStorage.setItem("pendingNoteCreation", markdownContent);
    navigate("/dashboard/student/notes");
  };

  return (
    <article
      className="mx-auto w-full min-w-0 max-w-3xl px-3 pb-28 sm:px-6 sm:pb-20 overflow-x-hidden sm:overflow-x-visible space-y-6 animate-in fade-in slide-in-from-top-5 duration-300"
    >
      {/* Header Card */}
      <Card ref={heroRef} className="shadow-sm">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full shrink-0 -ml-2"
              aria-label="Back to subject"
            >
              <Link to={`/resources/${branch}/${semester}/${subjectId}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                {topic.title}
              </CardTitle>
              {topic.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {topic.description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardPanel className="space-y-4 pt-0">
          {/* Progress bar + status */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Progress</span>
                <span>
                  {currentIndex} / {totalTopics}
                </span>
              </div>
              <Progress value={progressPercentage}>
                <ProgressTrack>
                  <ProgressIndicator />
                </ProgressTrack>
              </Progress>
            </div>
            <div className="shrink-0">
              {isCompleted ? (
                <Badge variant="default" className="gap-1 bg-success/10 text-success text-xs">
                  <CheckCircle2 className="h-3 w-3" /> Done
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkComplete}
                  disabled={isMarkingComplete}
                  className="h-8 gap-1.5 px-3 text-xs"
                >
                  {isMarkingComplete ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>Mark done</>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {topic.estimatedTime && (
              <Badge variant="outline" className="shrink-0 gap-1 text-xs font-normal">
                <Clock className="h-3 w-3" /> {topic.estimatedTime}
              </Badge>
            )}
            {hasVideo && (
              <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                <Video className="h-3 w-3" /> Video
              </Badge>
            )}
            {hasNotes && (
              <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                <BookOpen className="h-3 w-3" /> Notes
              </Badge>
            )}
            {hasSummary && (
              <Badge variant="secondary" className="shrink-0 gap-1 text-xs">
                <Lightbulb className="h-3 w-3" /> Key points
              </Badge>
            )}
          </div>
        </CardPanel>
      </Card>

      {/* Video Section */}
      {hasVideo && (
        <Card className="overflow-hidden shadow-sm">
          <CardPanel className="p-0">
            <div ref={videoContainerRef} className="relative aspect-video w-full max-w-full overflow-hidden bg-black/5">
              {isVideoLoading && !hasVideoError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading video…</span>
                  </div>
                </div>
              )}
              {hasVideoError ? (
                <Empty className="absolute inset-0 z-10 p-6">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <AlertCircle className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>Video unavailable</EmptyTitle>
                    <EmptyDescription>
                      Please try again or continue reading the study notes below.
                    </EmptyDescription>
                  </EmptyHeader>
                  <Button variant="outline" size="sm" onClick={handleRetryVideo} className="gap-2">
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </Button>
                </Empty>
              ) : (
                <iframe
                  key={topic.youtubeVideoId}
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${topic.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
                  title={`Video: ${topic.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                  loading="lazy"
                  onLoad={() => setIsVideoLoading(false)}
                  onError={() => {
                    setIsVideoLoading(false);
                    setHasVideoError(true);
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-presentation allow-popups-to-escape-sandbox"
                />
              )}
            </div>
          </CardPanel>
        </Card>
      )}

      {/* Key Takeaways */}
      {hasSummary && topic.summaryPoints && (
        <Alert variant="warning">
          <Lightbulb className="h-4 w-4" />
          <AlertTitle className="font-semibold">
            Key Takeaways
          </AlertTitle>
          <AlertDescription>
            <ul className="space-y-1.5 mt-1">
              {topic.summaryPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/60" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Topic Content / Notes */}
      <Card
        className={cn(
          "shadow-sm transition-all",
          isFullscreen ? "fixed inset-0 z-[100] h-screen w-screen rounded-none border-0 shadow-none" : ""
        )}
      >
        {hasNotes ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-end gap-1.5 border-b p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-8 gap-1.5 text-xs"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNotes}
                className="h-8 gap-1.5 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open in Notes</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 gap-1.5 text-xs"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </Button>
            </div>

            <CardPanel className="p-4 sm:p-6">
              {isFullscreen ? (
                <ScrollArea className="h-[calc(100vh-60px)]">
                  <div className="max-w-4xl mx-auto p-4 sm:p-6">
                    <RichTextEditor
                      content={markdownContent}
                      onChange={() => {}}
                      editable={false}
                    />
                  </div>
                </ScrollArea>
              ) : (
                <RichTextEditor
                  content={markdownContent}
                  onChange={() => {}}
                  editable={false}
                />
              )}
            </CardPanel>
          </>
        ) : (
          <Empty className="p-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpen className="h-6 w-6" />
              </EmptyMedia>
              <EmptyTitle>Content not available yet</EmptyTitle>
              <EmptyDescription>
                Watch the video lecture above for detailed explanation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Card>

      {/* Navigation */}
      <nav className="pt-2">
        <div className="grid gap-3 sm:grid-cols-2">
          {prevTopic ? (
            <Item asChild variant="outline" className="p-3 cursor-pointer hover:border-primary/40">
              <Link to={getTopicUrl(prevTopic.id)}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </div>
                <ItemContent>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Previous
                  </span>
                  <ItemTitle className="truncate text-sm font-medium">
                    {prevTopic.title}
                  </ItemTitle>
                </ItemContent>
              </Link>
            </Item>
          ) : (
            <div aria-hidden="true" />
          )}

          {nextTopic ? (
            <Item asChild variant="outline" className="p-3 cursor-pointer hover:border-primary/40">
              <Link to={getTopicUrl(nextTopic.id)}>
                <ItemContent className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Next
                  </span>
                  <ItemTitle className="truncate text-sm font-medium justify-end">
                    {nextTopic.title}
                  </ItemTitle>
                </ItemContent>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            </Item>
          ) : (
            <Item asChild variant="outline" className="p-3 cursor-pointer hover:border-primary/40">
              <Link to={`/resources/${branch}/${semester}/${subjectId}`}>
                <ItemContent className="text-right">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    All done
                  </span>
                  <ItemTitle className="truncate text-sm font-medium justify-end">
                    Back to Dashboard
                  </ItemTitle>
                </ItemContent>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ArrowLeft className="h-4 w-4" />
                </div>
              </Link>
            </Item>
          )}
        </div>
      </nav>

      {/* Floating Sticky Bar – pure CSS transition */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-out sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md px-4",
          showStickyBar && !isCompleted
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0 pointer-events-none"
        )}
      >
        <Card className="shadow-lg border bg-card/95 backdrop-blur-xl">
          <CardPanel className="flex items-center justify-between gap-3 p-3 sm:px-5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{topic.title}</p>
              <p className="text-xs text-muted-foreground">
                {currentIndex} of {totalTopics}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              className="gap-2 shrink-0"
            >
              {isMarkingComplete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete
                </>
              )}
            </Button>
          </CardPanel>
        </Card>
      </div>
    </article>
  );
};