import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, FileEdit, FileText, LayoutTemplate, MoreHorizontal } from "lucide-react";
import { fetchTopicById, updateTopic, type Topic } from "@/services/api";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";

export default function TopicEditorPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [title, setTitle] = useState("");
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
          setContentMarkdown(data.contentMarkdown || data.markdownContent || "");
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
        content_markdown: contentMarkdown,
      });
      navigate(-1);
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
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading document...</p>
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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Topic Not Found</h2>
          <p className="text-base text-muted-foreground max-w-md">The document you're looking for doesn't exist, has been moved, or you don't have permission to view it.</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4 h-10 px-6 rounded-full">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 flex flex-col">
      {/* Notion-style Sticky Top Navigation */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-3 sm:px-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all">
        <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0 rounded-md"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center text-sm font-medium text-muted-foreground overflow-hidden whitespace-nowrap mask-linear-fade">
            <span className="flex items-center gap-1.5 transition-colors hover:bg-muted/50 px-2 py-1 rounded-md cursor-pointer text-foreground/70">
              <LayoutTemplate className="h-3.5 w-3.5" />
              <span className="truncate max-w-[80px] sm:max-w-[150px]">{topic.subject?.name || "Subject"}</span>
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
            className="h-8 w-8 text-muted-foreground hidden sm:flex"
            title="Options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            size="sm"
            className="h-8 gap-1.5 rounded-md px-4 font-medium shadow-sm transition-all bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isSaving ? "Saving" : "Publish"}</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </header>

      {/* Main Editor Content */}
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-16 md:py-20 lg:px-8">
        {/* Document Header Area */}
        <div className="group relative mb-8 sm:mb-12 pl-2">
          {/* Optional Add Icon / Add Cover like Notion */}
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
