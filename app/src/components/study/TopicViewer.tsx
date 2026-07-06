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
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const subjectData = subject;

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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full min-w-0 max-w-3xl px-3 pb-28 sm:px-6 sm:pb-20 overflow-x-hidden sm:overflow-x-visible"
    >
      {/* ── Compact Header ── */}
      <header ref={heroRef} className="mb-5 space-y-3">
        {/* Back + Title row */}
        <div className="flex items-start gap-2">
          <Link
            to={`/resources/${branch}/${semester}/${subjectId}`}
            className="mt-0.5 rounded-full p-2 -ml-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            aria-label="Back to subject"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              {topic.title}
            </h1>
            {topic.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {topic.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar + status */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{currentIndex} / {totalTopics}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
          <div className="shrink-0">
            {isCompleted ? (
              <Badge variant="default" className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs">
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

        {/* Metadata chips – scrollable horizontally on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide [-webkit-overflow-scrolling:touch]">
          {topic.estimatedTime && (
            <Badge variant="outline" className="shrink-0 gap-1 text-xs font-normal">
              <Clock className="h-3 w-3" /> {topic.estimatedTime}
            </Badge>
          )}
          {hasVideo && (
            <Badge variant="secondary" className="shrink-0 gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs">
              <Video className="h-3 w-3" /> Video
            </Badge>
          )}
          {hasNotes && (
            <Badge variant="secondary" className="shrink-0 gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
              <BookOpen className="h-3 w-3" /> Notes
            </Badge>
          )}
          {hasSummary && (
            <Badge variant="secondary" className="shrink-0 gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              <Lightbulb className="h-3 w-3" /> Key points
            </Badge>
          )}
        </div>
      </header>

      {/* ── Video Section ── */}
      {hasVideo && (
        <section className="mb-6 w-full min-w-0">
          <div className="relative aspect-video w-full max-w-full overflow-hidden rounded-xl bg-black/5 ring-1 ring-border/40">
            {isVideoLoading && !hasVideoError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading video…</span>
                </div>
              </div>
            )}
            {hasVideoError ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/20 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                <div>
                  <p className="text-sm font-medium text-foreground">Video unavailable</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Please try again or continue with the notes.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRetryVideo} className="gap-2">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
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
        </section>
      )}

      {/* ── Key Points – highlighted for quick grasp ── */}
      {hasSummary && topic.summaryPoints && (
        <section className="mb-6">
          <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Key Takeaways
              </h3>
            </div>
            <ul className="space-y-1.5">
              {topic.summaryPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-amber-900/80 dark:text-amber-200/80"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60 dark:bg-amber-400/60" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Topic Content ── */}
      <section className="mb-6 w-full min-w-0">
        {hasNotes ? (
          <div className={cn(
            "flex flex-col bg-background transition-shadow w-full min-w-0",
            isFullscreen 
              ? "fixed inset-0 z-[100] h-screen w-screen" 
              : "rounded-xl border border-border/40 hover:shadow-sm"
          )}>
            {/* Toolbar */}
            <div className={cn(
              "flex flex-wrap items-center justify-end gap-1.5 border-b border-border/40 bg-muted/10",
              isFullscreen ? "p-3 sm:px-6" : "p-2"
            )}>
              <Button variant="ghost" size="sm" onClick={handleCopyMarkdown} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0">
                {isCopied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleOpenInNotes} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Open in Notes</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0">
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Full Screen</span>
                  </>
                )}
              </Button>
            </div>
            
            {isFullscreen ? (
              <ScrollArea className="flex-1 w-full h-full min-w-0">
                <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 pb-32 overflow-x-hidden w-full">
                  <RichTextEditor
                    content={markdownContent}
                    onChange={() => {}}
                    editable={false}
                  />
                </div>
              </ScrollArea>
            ) : (
              <div className="p-3 sm:p-5 overflow-x-auto w-full min-w-0">
                <RichTextEditor
                  content={markdownContent}
                  onChange={() => {}}
                  editable={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-6 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-foreground">Content not available yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Watch the video lecture above.
            </p>
          </div>
        )}
      </section>

      {/* ── Navigation ── */}
      <nav className="border-t border-border/40 pt-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {prevTopic ? (
            <Link
              to={getTopicUrl(prevTopic.id)}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background p-3 transition-all hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <ChevronLeft className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Previous
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {prevTopic.title}
                </span>
              </div>
            </Link>
          ) : (
            <div aria-hidden="true" />
          )}

          {nextTopic ? (
            <Link
              to={getTopicUrl(nextTopic.id)}
              className="group flex items-center justify-end gap-3 rounded-xl border border-border/50 bg-background p-3 text-right transition-all hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Next
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {nextTopic.title}
                </span>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ) : (
            <Link
              to={`/resources/${branch}/${semester}/${subjectId}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10 p-3 text-right transition-all hover:border-primary/30 hover:bg-primary/[0.02] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  All done
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  Back to Dashboard
                </span>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* ── Floating Sticky Bar (mobile-friendly) ── */}
      <AnimatePresence>
        {showStickyBar && !isCompleted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:shadow-lg sm:max-w-md"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};