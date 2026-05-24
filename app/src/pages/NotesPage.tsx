import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  FileText,
  Loader2,
  Trash,
  MoreHorizontal,
  ArrowLeft,
  Menu,
  Pencil,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import { getNotes, createNote, updateNote, deleteNote, renameNote, type Note } from "@/services/api";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active note states
  const [title, setTitle] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const startRename = (note: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingNoteId(note.id);
    setRenameValue(note.title || "");
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = async () => {
    if (!renamingNoteId) return;
    const trimmed = renameValue.trim() || "Untitled";
    
    // Optimistic update
    setNotes((prev) => prev.map((n) => (n.id === renamingNoteId ? { ...n, title: trimmed } : n)));
    if (activeNoteId === renamingNoteId) setTitle(trimmed);
    
    const noteId = renamingNoteId;
    setRenamingNoteId(null);
    
    try {
      const updated = await renameNote(noteId, trimmed);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      toast.success("Renamed successfully");
    } catch {
      toast.error("Failed to rename");
    }
  };

  const cancelRename = () => {
    setRenamingNoteId(null);
    setRenameValue("");
  };

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
      toast.error("Could not load your notes");
    } finally {
      setIsLoading(false);
    }
  };

  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    activeNoteIdRef.current = note.id;
    setTitle(note.title);
    setContentMarkdown(note.content_markdown || "");
    setIsSidebarOpen(false);
  };

  const handleCreateNote = async () => {
    try {
      setIsSaving(true);
      const newNote = await createNote({
        title: "Untitled",
        content_markdown: "",
      });
      setNotes([newNote, ...notes]);
      selectNote(newNote);
      toast.success("New note created");
    } catch {
      toast.error("Could not create note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this note permanently?")) return;
    
    try {
      await deleteNote(id);
      const newNotes = notes.filter((n) => n.id !== id);
      setNotes(newNotes);
      if (activeNoteId === id) {
        if (newNotes.length > 0) {
          selectNote(newNotes[0]);
        } else {
          setActiveNoteId(null);
          activeNoteIdRef.current = null;
          setTitle("");
          setContentMarkdown("");
        }
      }
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleNoteChange = useCallback((newMarkdown: string) => {
    setContentMarkdown(newMarkdown);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const currentId = activeNoteIdRef.current;
      if (!currentId) return;
      try {
        const updated = await updateNote(currentId, { content_markdown: newMarkdown });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        setIsSaving(false);
      } catch {
        toast.error("Auto‑save failed");
        setIsSaving(false);
      }
    }, 1500);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setNotes((prev) => prev.map((n) => (n.id === activeNoteIdRef.current ? { ...n, title: newTitle } : n)));

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      const currentId = activeNoteIdRef.current;
      if (!currentId) return;
      try {
        const updated = await updateNote(currentId, { title: newTitle });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } catch {
        toast.error("Failed to save title");
      } finally {
        setIsSaving(false);
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar – Notion style */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-card transition-transform duration-300 sm:relative sm:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="border-b p-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-2 py-2">
            <div className="mb-2 px-2 py-1">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Private
              </h3>
            </div>
            {notes.length === 0 ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                <p>No pages yet</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => renamingNoteId !== note.id && selectNote(note)}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm transition-all",
                      activeNoteId === note.id
                        ? "bg-muted/50 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5 overflow-hidden">
                      <FileText className="h-4 w-4 shrink-0 opacity-70" />
                      {renamingNoteId === note.id ? (
                        <input
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={commitRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") cancelRename();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 rounded border border-primary/30 bg-background px-1.5 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      ) : (
                        <span className="truncate">{note.title || "Untitled"}</span>
                      )}
                    </div>
                    {renamingNoteId !== note.id && (
                      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={(e) => startRename(note, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="border-t p-3">
          <button
            onClick={handleCreateNote}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span>New page</span>
          </button>
        </div>
      </aside>

      {/* Main editor area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {activeNote ? (
          <>
            <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="rounded-md p-1.5 text-foreground/80 hover:bg-muted/50 sm:hidden"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted/50">
                  <FileText className="h-4 w-4" />
                  <span className="max-w-[150px] truncate sm:max-w-[300px]">
                    {title || "Untitled"}
                  </span>
                </div>
                {activeNote.topic_id && (
                  <Badge variant="outline" className="h-5 border-primary/20 bg-primary/5 px-1.5 text-[10px] font-normal text-primary/80">
                    Linked
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {isSaving ? "Saving…" : "Saved"}
                </span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-4xl px-6 py-8 sm:px-8 sm:py-12 lg:px-12">
                <div className="group relative mb-6 pl-1">
                  <div className="mb-3 flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                      <FileText className="h-3.5 w-3.5" /> Add icon
                    </button>
                    <button className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                      <LayoutTemplate className="h-3.5 w-3.5" /> Add cover
                    </button>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled"
                    className="w-full border-none bg-transparent px-0 text-3xl font-bold tracking-tight text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-0 sm:text-4xl"
                  />
                </div>
                <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary">
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
          <div className="flex h-full flex-col items-center justify-center gap-4 bg-background text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Select a page or create a new one</p>
            <Button variant="outline" onClick={handleCreateNote} className="mt-2 rounded-full px-5">
              New page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
