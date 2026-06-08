import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getNotes, createNote, updateNote, deleteNote, renameNote } from '@/services/api';
import { DEFAULT_METADATA, type NoteMetadata, type PageFont } from '@/lib/notesMetadata';
import { buildTree, getAncestors } from '@/components/notes/helpers';
import type { NoteWithMeta, TreeNode } from '@/components/notes/types';

interface NotesContextType {
  notes: NoteWithMeta[];
  activeNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  
  title: string;
  bodyMarkdown: string;
  metadata: NoteMetadata;
  
  isSidebarPinned: boolean;
  sidebarHovered: boolean;
  searchQuery: string;
  expandedNodes: Set<string>;
  showTrash: boolean;
  favoritesExpanded: boolean;
  
  renamingNoteId: string | null;
  renameValue: string;
  renameInputRef: React.RefObject<HTMLInputElement | null>;
  
  showEmojiPicker: boolean;
  showCoverPicker: boolean;
  emojiTriggerRef: React.RefObject<HTMLButtonElement | null>;
  coverTriggerRef: React.RefObject<HTMLButtonElement | null>;
  
  showSettings: boolean;
  editorTheme: string;
  sidebarMenu: { x: number; y: number; note: NoteWithMeta } | null;
  
  activeNotes: NoteWithMeta[];
  trashedNotes: NoteWithMeta[];
  favoriteNotes: NoteWithMeta[];
  tree: TreeNode[];
  activeNote: NoteWithMeta | undefined;
  ancestors: NoteWithMeta[];
  filteredActiveNotes: NoteWithMeta[];
  sidebarVisible: boolean;
  fontClass: string;
  
  setSidebarHovered: (v: boolean) => void;
  setIsSidebarPinned: (v: boolean) => void;
  setSearchQuery: (v: string) => void;
  setShowTrash: (v: boolean) => void;
  setFavoritesExpanded: (v: boolean) => void;
  setRenamingNoteId: (v: string | null) => void;
  setRenameValue: (v: string) => void;
  setShowEmojiPicker: (v: boolean) => void;
  setShowCoverPicker: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setSidebarMenu: (v: any) => void;
  
  handleThemeChange: (theme: string) => void;
  selectNote: (note: NoteWithMeta) => void;
  handleNoteChange: (newMarkdown: string) => void;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateMetadataField: <K extends keyof NoteMetadata>(key: K, value: NoteMetadata[K]) => void;
  handleToggleFavorite: (noteId: string) => void;
  setPageFont: (font: PageFont) => void;
  toggleFullWidth: () => void;
  handleCreateNote: (parentId?: string) => Promise<void>;
  handleMoveToTrash: (noteId: string) => void;
  handleRestoreFromTrash: (noteId: string) => void;
  handleDeletePermanently: (noteId: string) => Promise<void>;
  handleDuplicateNote: (noteId: string) => Promise<void>;
  startRename: (note: NoteWithMeta, e: React.MouseEvent) => void;
  commitRename: () => Promise<void>;
  toggleExpanded: (nodeId: string) => void;
}

const NotesContext = createContext<NotesContextType | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<NoteWithMeta[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [metadata, setMetadata] = useState<NoteMetadata>({ ...DEFAULT_METADATA });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const emojiTriggerRef = useRef<HTMLButtonElement>(null);
  const coverTriggerRef = useRef<HTMLButtonElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState("light");

  const [sidebarMenu, setSidebarMenu] = useState<{ x: number; y: number; note: NoteWithMeta } | null>(null);

  const normalizeEditorTheme = useCallback((theme: string | null | undefined) => {
    return theme === "dark" ? "dark" : "light";
  }, []);

  useEffect(() => {
    import("@/services/api").then(({ getApiOrigin }) => {
      fetch(`${getApiOrigin()}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json()).then(payload => {
        if (payload?.data?.preferences?.editorTheme) {
          setEditorTheme(normalizeEditorTheme(payload.data.preferences.editorTheme));
        } else {
          setEditorTheme(normalizeEditorTheme(localStorage.getItem("editor-theme")));
        }
      }).catch(() => setEditorTheme(normalizeEditorTheme(localStorage.getItem("editor-theme"))));
    });
  }, [normalizeEditorTheme]);

  const handleThemeChange = (newTheme: string) => {
    const normalizedTheme = normalizeEditorTheme(newTheme);
    setEditorTheme(normalizedTheme);
    localStorage.setItem("editor-theme", normalizedTheme);
    import("@/services/api").then(({ updatePreferences }) => {
      updatePreferences({ editorTheme: normalizedTheme }).catch(console.error);
    });
  };

  const sidebarVisible = isSidebarPinned || sidebarHovered;

  const activeNotes = useMemo(() => notes.filter((n) => !n.meta.trash), [notes]);
  const trashedNotes = useMemo(() => notes.filter((n) => n.meta.trash), [notes]);
  const favoriteNotes = useMemo(() => activeNotes.filter((n) => n.meta.favorite), [activeNotes]);
  const tree = useMemo(() => buildTree(activeNotes), [activeNotes]);
  const activeNote = notes.find((n) => n.id === activeNoteId);
  const ancestors = activeNoteId ? getAncestors(activeNoteId, activeNotes) : [];

  const filteredActiveNotes = useMemo(() => {
    if (!searchQuery.trim()) return activeNotes;
    const q = searchQuery.toLowerCase();
    return activeNotes.filter(
      (n) => n.title.toLowerCase().includes(q) || n.bodyMarkdown.toLowerCase().includes(q)
    );
  }, [activeNotes, searchQuery]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const selectNote = useCallback((note: NoteWithMeta) => {
    setActiveNoteId(note.id);
    activeNoteIdRef.current = note.id;
    setTitle(note.title);
    setBodyMarkdown(note.bodyMarkdown);
    setMetadata({ ...note.meta });
    if (window.innerWidth < 768) {
      setIsSidebarPinned(false);
      setSidebarHovered(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && notes.length > 0 && !activeNoteId) {
      const firstActive = notes.find(n => !n.meta.trash);
      if (firstActive) selectNote(firstActive);
    }
  }, [isLoading, notes, activeNoteId, selectNote]);

  const fetchNotes = async () => {
    try {
      const data = await getNotes();
      const enriched: NoteWithMeta[] = data.map((n) => {
        const meta: NoteMetadata = {
          icon: n.icon || "",
          cover: n.cover || "",
          favorite: !!n.is_favorite,
          trash: !!n.is_trash,
          parentId: n.parent_id || "",
          font: (n.font as PageFont) || "sans",
          fullWidth: !!n.full_width,
        };
        return { ...n, meta, bodyMarkdown: n.content_markdown || "" };
      });
      setNotes(enriched);
      if (enriched.length > 0 && !activeNoteIdRef.current) {
        const firstActive = enriched.find((n) => !n.meta.trash);
        if (firstActive) selectNote(firstActive);
      }
    } catch (error) {
      toast.error("Could not load your notes");
    } finally {
      setIsLoading(false);
    }
  };

  const persistNote = useCallback((noteId: string, newMeta: NoteMetadata, newBody: string, newTitle?: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload: Partial<import("@/services/api").Note> = {
          content_markdown: newBody,
          icon: newMeta.icon || null,
          cover: newMeta.cover || null,
          is_favorite: newMeta.favorite ? 1 : 0,
          is_trash: newMeta.trash ? 1 : 0,
          parent_id: newMeta.parentId || null,
          font: newMeta.font,
          full_width: newMeta.fullWidth ? 1 : 0,
        };
        if (newTitle !== undefined) payload.title = newTitle;

        const updated = await updateNote(noteId, payload);
        const savedMeta: NoteMetadata = {
          icon: updated.icon || "",
          cover: updated.cover || "",
          favorite: !!updated.is_favorite,
          trash: !!updated.is_trash,
          parentId: updated.parent_id || "",
          font: (updated.font as PageFont) || "sans",
          fullWidth: !!updated.full_width,
        };

        setNotes((prev) => prev.map((n) =>
          n.id === updated.id ? { ...updated, meta: savedMeta, bodyMarkdown: updated.content_markdown || "" } : n
        ));
        setIsSaving(false);
      } catch {
        toast.error("Auto-save failed");
        setIsSaving(false);
      }
    }, 1200);
  }, []);

  const handleNoteChange = useCallback((newMarkdown: string) => {
    setBodyMarkdown(newMarkdown);
    setNotes((prev) => prev.map((n) => n.id === activeNoteIdRef.current ? { ...n, bodyMarkdown: newMarkdown } : n));
    const currentId = activeNoteIdRef.current;
    if (!currentId) return;
    const note = notes.find((n) => n.id === currentId);
    if (!note) return;
    persistNote(currentId, note.meta, newMarkdown);
  }, [notes, persistNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setNotes((prev) => prev.map((n) => n.id === activeNoteIdRef.current ? { ...n, title: newTitle } : n));
    const currentId = activeNoteIdRef.current;
    if (!currentId) return;
    persistNote(currentId, metadata, bodyMarkdown, newTitle);
  };

  const updateMetadataField = useCallback(<K extends keyof NoteMetadata>(key: K, value: NoteMetadata[K]) => {
    const currentId = activeNoteIdRef.current;
    if (!currentId) return;
    const newMeta = { ...metadata, [key]: value };
    setMetadata(newMeta);
    setNotes((prev) => prev.map((n) => n.id === currentId ? { ...n, meta: newMeta } : n));
    persistNote(currentId, newMeta, bodyMarkdown);
  }, [metadata, bodyMarkdown, persistNote]);

  const handleToggleFavorite = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const newMeta = { ...note.meta, favorite: !note.meta.favorite };
    if (noteId === activeNoteIdRef.current) setMetadata(newMeta);
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, meta: newMeta } : n)));
    persistNote(noteId, newMeta, note.bodyMarkdown);
    toast.success(newMeta.favorite ? "Added to favorites" : "Removed from favorites");
  }, [notes, persistNote]);

  const setPageFont = useCallback((font: PageFont) => {
    updateMetadataField("font", font);
  }, [updateMetadataField]);

  const toggleFullWidth = useCallback(() => {
    updateMetadataField("fullWidth", !metadata.fullWidth);
  }, [metadata.fullWidth, updateMetadataField]);

  const handleCreateNote = async (parentId?: string) => {
    try {
      const newMeta: NoteMetadata = { ...DEFAULT_METADATA, parentId: parentId || "" };
      const newNote = await createNote({
        title: "Untitled",
        content_markdown: "",
        icon: newMeta.icon || null,
        cover: newMeta.cover || null,
        is_favorite: newMeta.favorite ? 1 : 0,
        is_trash: newMeta.trash ? 1 : 0,
        parent_id: newMeta.parentId || null,
        font: newMeta.font,
        full_width: newMeta.fullWidth ? 1 : 0,
      });
      const meta: NoteMetadata = {
        icon: newNote.icon || "",
        cover: newNote.cover || "",
        favorite: !!newNote.is_favorite,
        trash: !!newNote.is_trash,
        parentId: newNote.parent_id || "",
        font: (newNote.font as PageFont) || "sans",
        fullWidth: !!newNote.full_width,
      };
      const enriched: NoteWithMeta = { ...newNote, meta, bodyMarkdown: newNote.content_markdown || "" };
      setNotes((prev) => [enriched, ...prev]);
      selectNote(enriched);
      if (parentId) setExpandedNodes((prev) => new Set(prev).add(parentId));
      toast.success("New page created");
    } catch {
      toast.error("Could not create page");
    }
  };

  const handleMoveToTrash = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const newMeta = { ...note.meta, trash: true };
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, meta: newMeta } : n));
    if (activeNoteId === noteId) {
      const remaining = notes.filter((n) => n.id !== noteId && !n.meta.trash);
      if (remaining.length > 0) selectNote(remaining[0]);
      else {
        setActiveNoteId(null);
        activeNoteIdRef.current = null;
      }
    }
    persistNote(noteId, newMeta, note.bodyMarkdown);
    toast.success("Moved to Trash");
  }, [notes, activeNoteId, selectNote, persistNote]);

  const handleRestoreFromTrash = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const newMeta = { ...note.meta, trash: false };
    setNotes((prev) => prev.map((n) => n.id === noteId ? { ...n, meta: newMeta } : n));
    persistNote(noteId, newMeta, note.bodyMarkdown);
    toast.success("Page restored");
  }, [notes, persistNote]);

  const handleDeletePermanently = async (noteId: string) => {
    if (!confirm("Delete this page permanently? This cannot be undone.")) return;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        const remaining = notes.filter((n) => n.id !== noteId && !n.meta.trash);
        if (remaining.length > 0) selectNote(remaining[0]);
        else {
          setActiveNoteId(null);
          activeNoteIdRef.current = null;
        }
      }
      toast.success("Page deleted permanently");
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const handleDuplicateNote = async (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    try {
      const newMeta = { ...note.meta, favorite: false };
      const dup = await createNote({
        title: `${note.title} (copy)`,
        content_markdown: note.bodyMarkdown,
        icon: newMeta.icon || null,
        cover: newMeta.cover || null,
        is_favorite: newMeta.favorite ? 1 : 0,
        is_trash: newMeta.trash ? 1 : 0,
        parent_id: newMeta.parentId || null,
        font: newMeta.font,
        full_width: newMeta.fullWidth ? 1 : 0,
      });
      const meta: NoteMetadata = {
        icon: dup.icon || "",
        cover: dup.cover || "",
        favorite: !!dup.is_favorite,
        trash: !!dup.is_trash,
        parentId: dup.parent_id || "",
        font: (dup.font as PageFont) || "sans",
        fullWidth: !!dup.full_width,
      };
      const enriched: NoteWithMeta = { ...dup, meta, bodyMarkdown: dup.content_markdown || "" };
      setNotes((prev) => [enriched, ...prev]);
      toast.success("Page duplicated");
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  const startRename = (note: NoteWithMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingNoteId(note.id);
    setRenameValue(note.title || "");
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = async () => {
    if (!renamingNoteId) return;
    const trimmed = renameValue.trim() || "Untitled";
    setNotes((prev) => prev.map((n) => n.id === renamingNoteId ? { ...n, title: trimmed } : n));
    if (activeNoteId === renamingNoteId) setTitle(trimmed);
    const noteId = renamingNoteId;
    setRenamingNoteId(null);
    try {
      const updated = await renameNote(noteId, trimmed);
      const meta: NoteMetadata = {
        icon: updated.icon || "",
        cover: updated.cover || "",
        favorite: !!updated.is_favorite,
        trash: !!updated.is_trash,
        parentId: updated.parent_id || "",
        font: (updated.font as PageFont) || "sans",
        fullWidth: !!updated.full_width,
      };
      setNotes((prev) => prev.map((n) =>
        n.id === updated.id ? { ...updated, meta, bodyMarkdown: updated.content_markdown || "" } : n
      ));
    } catch {
      toast.error("Failed to rename");
    }
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const fontClass = metadata.font === "serif" ? "font-serif" : metadata.font === "mono" ? "font-mono" : "font-sans";

  return (
    <NotesContext.Provider value={{
      notes, activeNoteId, isLoading, isSaving, title, bodyMarkdown, metadata,
      isSidebarPinned, sidebarHovered, searchQuery, expandedNodes, showTrash, favoritesExpanded,
      renamingNoteId, renameValue, renameInputRef, showEmojiPicker, showCoverPicker,
      emojiTriggerRef, coverTriggerRef, showSettings, editorTheme, sidebarMenu,
      activeNotes, trashedNotes, favoriteNotes, tree, activeNote, ancestors, filteredActiveNotes,
      sidebarVisible, fontClass,
      
      setSidebarHovered, setIsSidebarPinned, setSearchQuery, setShowTrash, setFavoritesExpanded,
      setRenamingNoteId, setRenameValue, setShowEmojiPicker, setShowCoverPicker, setShowSettings,
      setSidebarMenu, handleThemeChange, selectNote, handleNoteChange, handleTitleChange,
      updateMetadataField, handleToggleFavorite, setPageFont, toggleFullWidth, handleCreateNote,
      handleMoveToTrash, handleRestoreFromTrash, handleDeletePermanently, handleDuplicateNote,
      startRename, commitRename, toggleExpanded
    }}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotesState = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotesState must be used within a NotesProvider");
  }
  return context;
};
