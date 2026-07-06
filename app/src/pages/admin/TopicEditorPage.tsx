import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileEdit,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
} from "lucide-react";
import { fetchTopicById, updateTopic, type Topic } from "@/services/api";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Trash, Plus, Clock, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicEditorPageProps {
  topicId?: string;
  isEmbedded?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function TopicEditorPage({
  topicId: propTopicId,
  isEmbedded,
  onSaved,
  onCancel,
}: TopicEditorPageProps = {}) {
  const params = useParams<{ topicId: string }>();
  const topicId = propTopicId || params.topicId;
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("15 mins");
  const [videoUrl, setVideoUrl] = useState("");
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTopic = async () => {
      if (!topicId) return;
      try {
        const data = await fetchTopicById(topicId);
        if (data) {
          setTopic(data);
          setTitle(data.title);
          setDescription(data.description || "");
          setEstimatedTime(data.estimatedTime || "15 mins");
          setVideoUrl(data.videoUrl || "");
          setSummaryPoints(data.summaryPoints || []);
          setContentMarkdown(
            data.contentMarkdown || data.markdownContent || "",
          );
        }
      } catch (error) {
        console.error("Failed to load topic:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTopic();
  }, [topicId]);

  const handleSave = async () => {
    if (!topicId) return;
    setIsSaving(true);
    try {
      await updateTopic(topicId, {
        title,
        description,
        estimated_time: estimatedTime,
        video_url: videoUrl,
        summary_points: summaryPoints,
        content_markdown: contentMarkdown,
      });

      if (onSaved) {
        onSaved();
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to update topic:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <FileEdit className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Topic Not Found
          </h2>
          <p className="text-base text-muted-foreground max-w-md">
            The document you're looking for doesn't exist, has been moved, or
            you don't have permission to view it.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-background selection:bg-primary/20 flex flex-col",
        isEmbedded ? "min-h-full" : "min-h-screen",
      )}
    >
      {/* Notion-style Sticky Top Navigation */}
      {!isEmbedded && (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-3 sm:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center text-sm font-medium text-muted-foreground overflow-hidden whitespace-nowrap mask-linear-fade">
              <span className="flex items-center gap-1.5 transition-colors hover:bg-muted/50 px-2 py-1 rounded-md cursor-pointer text-foreground/70">
                <LayoutTemplate className="h-3.5 w-3.5" />
                <span className="truncate max-w-[80px] sm:max-w-[150px]">
                  {topic.subject?.name || "Subject"}
                </span>
              </span>
              <span className="text-muted-foreground/40 shrink-0">/</span>
              <span className="transition-colors hover:bg-muted/50 px-2 py-1 rounded-md cursor-pointer text-foreground/70 truncate shrink-0">
                Unit {topic.unit?.number || "-"}
              </span>
              <span className="text-muted-foreground/40 shrink-0">/</span>
              <span className="flex items-center gap-1.5 px-2 py-1 text-foreground truncate max-w-[120px] sm:max-w-[200px]">
                <FileText className="h-3.5 w-3.5 text-primary/70" />
                <span className="truncate">{title || "Untitled"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 pl-2">
            <span className="text-xs text-muted-foreground hidden md:inline-block mr-2">
              {isSaving ? "Saving to workspace..." : "Edited just now"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex"
              title="Options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Saving" : "Publish"}
              </span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </header>
      )}

      {isEmbedded && (
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 sm:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-lg truncate">Edit Topic</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-1.5"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Main Editor Content */}
      <main
        className={cn(
          "flex-1 mx-auto w-full max-w-4xl",
          isEmbedded
            ? "px-4 py-6"
            : "px-4 py-8 sm:px-6 sm:py-16 md:py-20 lg:px-8",
        )}
      >
        {/* Document Header Area */}
        <div className="group relative mb-8 sm:mb-12 pl-2">
          <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity mb-2 text-muted-foreground h-6 items-center">
            <button className="text-xs font-medium flex items-center gap-1.5 hover:text-foreground transition-colors hover:bg-muted/50 px-2 py-1 rounded-md">
              <FileEdit className="h-3.5 w-3.5" /> Add icon
            </button>
            <button className="text-xs font-medium flex items-center gap-1.5 hover:text-foreground transition-colors hover:bg-muted/50 px-2 py-1 rounded-md">
              <LayoutTemplate className="h-3.5 w-3.5" /> Add cover
            </button>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled document"
            className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 border-none px-0"
          />
        </div>

        {/* Metadata Section */}
        <div className="mb-10 space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Topic Metadata
            </h3>
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <Field name="description" className="flex flex-col gap-2">
              <FieldLabel>Short Description</FieldLabel>
              <Textarea
                placeholder="Briefly describe what this topic covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none h-[120px]"
              />
              <FieldDescription>
                This appears in topic lists and previews.
              </FieldDescription>
            </Field>

            <div className="space-y-6">
              <Field name="estimatedTime" className="flex flex-col gap-2">
                <FieldLabel className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Estimated
                  Time
                </FieldLabel>
                <Input
                  placeholder="e.g. 15 mins, 1 hour"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                />
                <FieldDescription>
                  Expected reading time for students.
                </FieldDescription>
              </Field>

              <Field name="videoUrl" className="flex flex-col gap-2">
                <FieldLabel className="flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-muted-foreground" /> Video URL
                </FieldLabel>
                <Input
                  type="url"
                  placeholder="https://youtube.com/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
              </Field>
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <h4 className="font-medium text-foreground">Key Takeaways</h4>
                <p className="text-sm text-muted-foreground">
                  Summary points for quick revision.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSummaryPoints([...summaryPoints, ""])}
                className="gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" /> Add Point
              </Button>
            </div>
            {summaryPoints.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20">
                <p className="text-sm text-muted-foreground mb-4">
                  No summary points added.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSummaryPoints([""])}
                >
                  Create the first point
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {summaryPoints.map((point, index) => (
                  <Field
                    key={index}
                    className="flex flex-col gap-2 group relative"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                      <Input  className="w-full"
                        value={point}
                        onChange={(e) => {
                          const newPoints = [...summaryPoints];
                          newPoints[index] = e.target.value;
                          setSummaryPoints(newPoints);
                        }}
                        placeholder="Enter a key takeaway..."
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSummaryPoints(
                            summaryPoints.filter((_, i) => i !== index),
                          )
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </Field>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary pb-32">
          <RichTextEditor
            content={contentMarkdown}
            onChange={setContentMarkdown}
            editable={true}
            placeholder="Press '/' for commands, or start typing..."
            showWordCount={true}
          />
        </div>
      </main>
    </div>
  );
}
