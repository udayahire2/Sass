import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileEdit,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Trash,
  Plus,
  Clock,
  Video,
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
import { cn } from "@/lib/utils";

interface TopicEditorPageProps {
  topicId?: string;
  isEmbedded?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}

export default function TopicEditorPage({
  topicId: propTopicId,
  isEmbedded = false,
  onSaved,
  onCancel,
}: TopicEditorPageProps) {
  const params = useParams<{ topicId: string }>();
  const topicId = propTopicId || params.topicId;
  const navigate = useNavigate();

  // State
  const [topic, setTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("15 mins");
  const [videoUrl, setVideoUrl] = useState("");
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load topic data
  const loadTopic = useCallback(async () => {
    if (!topicId) return;
    setIsLoading(true);
    try {
      const data = await fetchTopicById(topicId);
      if (data) {
        setTopic(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setEstimatedTime(data.estimatedTime || "15 mins");
        setVideoUrl(data.videoUrl || "");
        setSummaryPoints(data.summaryPoints || []);
        setContentMarkdown(data.contentMarkdown || data.markdownContent || "");
        setSaveStatus("idle");
      }
    } catch (error) {
      console.error("Failed to load topic:", error);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (!topicId) return;
    setIsSaving(true);
    setSaveStatus("saving");
    try {
      await updateTopic(topicId, {
        title,
        description,
        estimated_time: estimatedTime,
        video_url: videoUrl,
        summary_points: summaryPoints,
        content_markdown: contentMarkdown,
      });
      setSaveStatus("saved");
      if (onSaved) {
        onSaved();
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Failed to update topic:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [topicId, title, description, estimatedTime, videoUrl, summaryPoints, contentMarkdown, onSaved, navigate]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    if (!topic) return [];
    return [
      { label: topic.subject?.name || "Subject", icon: LayoutTemplate },
      { label: `Unit ${topic.unit?.number || "-"}`, icon: null },
      { label: title || "Untitled", icon: FileText },
    ];
  }, [topic, title]);

  // Summary point handlers
  const addSummaryPoint = useCallback(() => {
    setSummaryPoints((prev) => [...prev, ""]);
  }, []);

  const updateSummaryPoint = useCallback((index: number, value: string) => {
    setSummaryPoints((prev) => {
      const newPoints = [...prev];
      newPoints[index] = value;
      return newPoints;
    });
  }, []);

  const removeSummaryPoint = useCallback((index: number) => {
    setSummaryPoints((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Loading state
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

  // Not found state
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
        <Button variant="outline" onClick={() => navigate(-1)}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  // Main render
  return (
    <div
      className={cn(
        "bg-background selection:bg-primary/20 flex flex-col",
        isEmbedded ? "min-h-full" : "min-h-screen",
      )}
    >
      {/* Header */}
      <Header
        isEmbedded={isEmbedded}
        breadcrumbItems={breadcrumbItems}
        isSaving={isSaving}
        saveStatus={saveStatus}
        onSave={handleSave}
        onCancel={onCancel}
        navigate={navigate}
      />

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 mx-auto w-full max-w-4xl",
          isEmbedded
            ? "px-4 py-6"
            : "px-4 py-8 sm:px-6 sm:py-16 md:py-20 lg:px-8",
        )}
      >
        {/* Title Input */}
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
        <MetadataSection
          description={description}
          setDescription={setDescription}
          estimatedTime={estimatedTime}
          setEstimatedTime={setEstimatedTime}
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          summaryPoints={summaryPoints}
          addSummaryPoint={addSummaryPoint}
          updateSummaryPoint={updateSummaryPoint}
          removeSummaryPoint={removeSummaryPoint}
        />

        {/* Editor */}
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

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

interface HeaderProps {
  isEmbedded: boolean;
  breadcrumbItems: Array<{ label: string; icon: React.ElementType | null }>;
  isSaving: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  onSave: () => void;
  onCancel?: () => void;
  navigate: (delta: number) => void;
}

function Header({
  isEmbedded,
  breadcrumbItems,
  isSaving,
  saveStatus,
  onSave,
  onCancel,
  navigate,
}: HeaderProps) {
  const saveLabel = useMemo(() => {
    if (saveStatus === "saving") return "Saving...";
    if (saveStatus === "saved") return "Saved";
    if (saveStatus === "error") return "Error";
    return "Publish";
  }, [saveStatus]);

  const saveIcon = useMemo(() => {
    if (saveStatus === "saving") return <Loader2 className="h-4 w-4 animate-spin" />;
    return <Save className="h-4 w-4" />;
  }, [saveStatus]);

  if (isEmbedded) {
    return (
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-4 sm:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-semibold text-lg truncate">Edit Topic</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving} size="sm">
            {saveIcon}
            <span className="ml-1.5">Save Changes</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-3 sm:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} title="Go back">
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center text-sm font-medium text-muted-foreground overflow-hidden whitespace-nowrap mask-linear-fade">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-muted-foreground/40 shrink-0 mx-1">/</span>
              )}
              <span
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors",
                  index === breadcrumbItems.length - 1
                    ? "text-foreground cursor-default"
                    : "hover:bg-muted/50 cursor-pointer text-foreground/70",
                )}
              >
                {item.icon && <item.icon className="h-3.5 w-3.5" />}
                <span className="truncate max-w-[100px] sm:max-w-[150px]">
                  {item.label}
                </span>
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pl-2">
        <span className="text-xs text-muted-foreground hidden md:inline-block mr-2">
          {saveStatus === "saving"
            ? "Saving to workspace..."
            : saveStatus === "saved"
            ? "Saved"
            : saveStatus === "error"
            ? "Save failed"
            : "Edited just now"}
        </span>
        <Button variant="ghost" size="icon" className="hidden sm:flex" title="Options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button onClick={onSave} disabled={isSaving} size="sm">
          {saveIcon}
          <span className="hidden sm:inline ml-1.5">{saveLabel}</span>
          <span className="sm:hidden ml-1.5">Save</span>
        </Button>
      </div>
    </header>
  );
}

interface MetadataSectionProps {
  description: string;
  setDescription: (value: string) => void;
  estimatedTime: string;
  setEstimatedTime: (value: string) => void;
  videoUrl: string;
  setVideoUrl: (value: string) => void;
  summaryPoints: string[];
  addSummaryPoint: () => void;
  updateSummaryPoint: (index: number, value: string) => void;
  removeSummaryPoint: (index: number) => void;
}

function MetadataSection({
  description,
  setDescription,
  estimatedTime,
  setEstimatedTime,
  videoUrl,
  setVideoUrl,
  summaryPoints,
  addSummaryPoint,
  updateSummaryPoint,
  removeSummaryPoint,
}: MetadataSectionProps) {
  return (
    <div className="mb-10 space-y-6 rounded-lg border border-border/50 bg-transparent p-6">
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
          <Button variant="secondary" size="sm" onClick={addSummaryPoint}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Point
          </Button>
        </div>
        {summaryPoints.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-transparent">
            <p className="text-sm text-muted-foreground mb-4">
              No summary points added.
            </p>
            <Button variant="outline" size="sm" onClick={addSummaryPoint}>
              Create the first point
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {summaryPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-3 group relative"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <Input
                  className="flex-1"
                  value={point}
                  onChange={(e) => updateSummaryPoint(index, e.target.value)}
                  placeholder="Enter a key takeaway..."
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSummaryPoint(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}