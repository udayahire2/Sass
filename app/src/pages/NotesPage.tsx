import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, BookOpen, Clock, FileText, Loader2, Save, Trash, MoreHorizontal, FileEdit, Settings, LayoutTemplate, ArrowLeft } from "lucide-react";
import { getNotes, createNote, updateNote, deleteNote, type Note } from "@/services/api";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active note states
  const [title, setTitle] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(data);
      if (data.length > 0 && !activeNoteId) {
        selectNote(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContentMarkdown(note.content_markdown || note.content || "");
  };

  const handleCreateNote = async () => {
    try {
      setIsSaving(true);
      const newNote = await createNote({
        title: "",
        content_markdown: "",
      });
      setNotes([newNote, ...notes]);
      selectNote(newNote);
    } catch (error) {
      console.error("Failed to create note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    
    try {
      await deleteNote(id);
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (activeNoteId === id) {
        if (newNotes.length > 0) {
          selectNote(newNotes[0]);
        } else {
          setActiveNoteId(null);
          setTitle("");
          setContentMarkdown("");
        }
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleNoteChange = useCallback((newMarkdown: string) => {
    setContentMarkdown(newMarkdown);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!activeNoteId) return;
      try {
        const updated = await updateNote(activeNoteId, { content_markdown: newMarkdown });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } catch (e) {
        console.error("Failed to auto-save note:", e);
      } finally {
        setIsSaving(false);
      }
    }, 1500);
  }, [activeNoteId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      if (!activeNoteId) return;
      try {
        const updated = await updateNote(activeNoteId, { title: newTitle });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } catch (err) {
        console.error("Failed to auto-save title:", err);
      } finally {
        setIsSaving(false);
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading notes...</p>
        </div>
      </div>
    );
  }

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-background selection:bg-primary/20">
      {/* Sidebar - Notion Style */}
      <aside className="w-64 sm:w-72 flex-shrink-0 bg-[#FBFBFA] dark:bg-[#191919] border-r border-border/40 flex flex-col transition-all duration-300">
        
        {/* Back to Dashboard */}
        <div className="p-3 border-b border-border/40">
          <button 
            onClick={() => navigate('/profile')} 
            className="w-full flex items-center gap-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground px-2 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* User Workspace Header */}
        <div className="px-3 pt-4 pb-2 flex items-center justify-between group">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1.5 rounded-md cursor-pointer transition-colors w-full">
            <div className="h-5 w-5 bg-primary rounded text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              N
            </div>
            <span className="truncate">My Workspace</span>
          </div>
        </div>
        
        {/* Sidebar Actions */}
        <div className="px-3 pb-2 space-y-0.5">
          <button 
            onClick={handleCreateNote} 
            className="w-full flex items-center gap-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground px-2 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>New page</span>
          </button>
          <button className="w-full flex items-center gap-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground px-2 py-1.5 rounded-md text-sm font-medium transition-colors">
            <Settings className="h-4 w-4 shrink-0" />
            <span>Settings</span>
          </button>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 mt-2">
          <div className="px-3 py-1 mb-1">
            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Private</h3>
          </div>
          {notes.length === 0 ? (
            <div className="px-3 py-4 text-center text-muted-foreground text-xs">
              <p>No pages inside</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => selectNote(note)}
                className={cn(
                  "group flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-sm transition-all",
                  activeNoteId === note.id
                    ? "bg-black/5 dark:bg-white/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="truncate">{note.title || "Untitled"}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteNote(note.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive p-1 rounded transition-all shrink-0"
                  title="Delete page"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor Main Content */}
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {activeNote ? (
          <>
            {/* Notion-style Sticky Header */}
            <header className="sticky top-0 z-40 flex h-12 items-center justify-between px-4 sm:px-6 transition-all">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer transition-colors text-foreground/80">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate max-w-[150px] sm:max-w-[300px]">{title || "Untitled"}</span>
                </span>
                {activeNote.topic_id && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-primary/5 border-primary/20 text-primary/80">
                    Linked Note
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline-block mr-2">
                  {isSaving ? "Saving..." : "Edited just now"}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>
            
            {/* Main Document Content */}
            <main className="flex-1 overflow-y-auto w-full">
              <div className="mx-auto max-w-4xl px-8 sm:px-12 py-8 lg:px-16 lg:py-16">
                {/* Document Header Area */}
                <div className="group relative mb-8 sm:mb-10 pl-2">
                  {/* Optional Add Actions - Notion Style */}
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
                    onChange={handleTitleChange}
                    placeholder="Untitled"
                    className="w-full bg-transparent text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 border-none px-0"
                  />
                </div>
                
                {/* Editor Wrapper */}
                <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary pb-32">
                  <RichTextEditor
                    content={contentMarkdown}
                    onChange={handleNoteChange}
                    editable={true}
                    placeholder="Press '/' for commands, or start typing..."
                    showWordCount={true}
                  />
                </div>
              </div>
            </main>
          </>
        ) : (
          <div className="flex h-full items-center justify-center flex-col gap-4 text-muted-foreground bg-background">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <BookOpen className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="text-sm">Select a page or create a new one</p>
            <Button variant="outline" onClick={handleCreateNote} className="mt-2 h-9 rounded-full px-5">
              Create New Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
