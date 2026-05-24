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
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { type Subject, type Topic } from "@/services/api";

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

  // Topic completion management
  const { isCompleted, markComplete } = useTopicCompletion(topic.id);

  // Reset video states when topic changes
  useEffect(() => {
    setIsVideoLoading(true);
    setHasVideoError(false);
    // Scroll to top on topic change
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
      // Simulate API call
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
    // Force iframe reload by updating key
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
  const hasNotes = Boolean(topic.markdownContent?.trim());
  const hasSummary = Boolean(topic.summaryPoints?.length);
  const progressPercentage = totalTopics > 0 ? (currentIndex / totalTopics) * 100 : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto w-full max-w-3xl px-4 sm:px-6"
    >
      {/* ── Back Link ── */}
      <div className="mb-6">
        <Link
          to={`/resources/${branch}/${semester}/${subjectId}`}
          className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground -ml-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Back to subject"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {subjectData?.name || "Back to subject"}
        </Link>
      </div>

      {/* ── Page Header (Hero) ── */}
      <header ref={heroRef} className="mb-8 space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <BookOpen className="h-7 w-7" strokeWidth={1.8} />
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {topic.title}
        </h1>

        {topic.description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {topic.description}
          </p>
        )}

        {/* ── Page Properties ── */}
        <div className="flex flex-col gap-3 border-y border-border/40 py-4 sm:gap-4">
          {topic.estimatedTime && (
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-muted-foreground/70 font-medium">
                Duration
              </span>
              <span className="inline-flex items-center gap-1.5 text-foreground">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {topic.estimatedTime}
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-muted-foreground/70 font-medium">
              Includes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hasVideo && (
                <Badge variant="secondary" className="gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <Video className="h-3 w-3" /> Lecture
                </Badge>
              )}
              {hasNotes && (
                <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <BookOpen className="h-3 w-3" /> Notes
                </Badge>
              )}
              {hasSummary && (
                <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Lightbulb className="h-3 w-3" /> Key Points
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-muted-foreground/70 font-medium">
              Progress
            </span>
            <div className="flex flex-1 items-center gap-3">
              <div className="h-1.5 flex-1 max-w-[200px] overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {currentIndex} of {totalTopics}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-muted-foreground/70 font-medium">
              Status
            </span>
            {isCompleted ? (
              <Badge variant="default" className="gap-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="h-auto gap-1.5 px-2.5 py-1 text-xs"
                aria-label="Mark topic as complete"
              >
                {isMarkingComplete ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                  </>
                ) : (
                  "Mark complete"
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ── Video Section ── */}
      {hasVideo && (
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Video Lecture
            </h2>
          </div>

          <div
            ref={videoContainerRef}
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-black/5 ring-1 ring-border/40"
          >
            {isVideoLoading && !hasVideoError && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">Loading video...</span>
                </div>
              </div>
            )}

            {hasVideoError ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-muted/20 p-6 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                <div>
                  <p className="text-sm font-medium text-foreground">Video unavailable</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    The video failed to load. Please try again or continue with the notes.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryVideo}
                  className="gap-2"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            ) : (
              <iframe
                key={topic.youtubeVideoId}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${topic.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
                title={`Video lesson: ${topic.title}`}
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

      {/* ── Key Points Section ── */}
      {hasSummary && topic.summaryPoints && (
        <section className="mb-10">
          <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 p-5 dark:border-amber-500/20 dark:bg-amber-500/[0.06]">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Key Points — Quick Revision
              </h3>
            </div>
            <ul className="space-y-2">
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

      {/* ── Topic Content Section ── */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary/80" strokeWidth={1.8} />
            Topic Content
          </h2>
        </div>

        {hasNotes ? (
          <div className="rounded-xl border border-border/40 bg-background overflow-hidden transition-shadow duration-200 hover:shadow-sm">
            <RichTextEditor
              content={topic.contentMarkdown || topic.markdownContent || ""}
              onChange={() => {}}
              editable={false}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/10 p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-medium text-foreground">Content is not available yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Continue with the video lecture for this topic.
            </p>
          </div>
        )}
      </section>

      {/* ── Navigation ── */}
      <nav className="border-t border-border/40 pt-8 pb-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {prevTopic ? (
            <Link
              to={getTopicUrl(prevTopic.id)}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-background p-4 transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
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
              className="group flex items-center justify-end gap-3 rounded-xl border border-border/50 bg-background p-4 text-right transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Next
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  {nextTopic.title}
                </span>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ) : (
            <Link
              to={`/resources/${branch}/${semester}/${subjectId}`}
              className="group flex items-center justify-end gap-3 rounded-xl border border-dashed border-border/50 bg-muted/10 p-4 text-right transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.02] focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  All done
                </span>
                <span className="block truncate text-sm font-medium text-foreground">
                  Back to Dashboard
                </span>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* ── Floating Sticky Bottom Bar ── */}
      <AnimatePresence>
        {showStickyBar && !isCompleted && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:rounded-2xl sm:border sm:shadow-lg sm:max-w-md sm:w-auto"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{topic.title}</p>
                <p className="text-xs text-muted-foreground">
                  {currentIndex} of {totalTopics} topics
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="gap-2"
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
