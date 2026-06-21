import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  renameNote,
} from "@/services/api";
import {
  DEFAULT_METADATA,
  type NoteMetadata,
  type PageFont,
} from "@/lib/notesMetadata";
import {
  NotesSidebar,
  NotesEditorHeader,
  NoteEditorCanvas,
  NotesEmptyState,
  NotesSettingsModal,
  NotesSidebarContextMenu,
  type NoteWithMeta,
} from "@/components/notes";
import { buildTree, getAncestors } from "@/components/notes/helpers";
import { NotesEmojiPicker } from "@/components/notes/NotesEmojiPicker";
import { NotesCoverPicker } from "@/components/notes/NotesCoverPicker";
import { cn } from "@/lib/utils";

function normalizeEditorTheme(theme: string | null | undefined): string {
  if (theme === "dark" || theme === "sepia" || theme === "nord") {
    return theme;
  }
  return "light";
}

export default function NotesPage() {
  // ── Core State ──
  const [notes, setNotes] = useState<NoteWithMeta[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ── Active note editing state ──
  const [title, setTitle] = useState("");
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [metadata, setMetadata] = useState<NoteMetadata>({
    ...DEFAULT_METADATA,
  });
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sidebar state ──
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showTrash, setShowTrash] = useState(false);
  const [favoritesExpanded, setFavoritesExpanded] = useState(true);

  // ── Inline rename state ──
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // ── Emoji / Cover pickers ──
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const emojiTriggerRef = useRef<HTMLButtonElement>(null);
  const coverTriggerRef = useRef<HTMLButtonElement>(null);

  // ── Settings & Theme State ──
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const localTheme = localStorage.getItem("editor-theme");
      if (localTheme) {
        return normalizeEditorTheme(localTheme);
      }
      const globalTheme = localStorage.getItem("vite-ui-theme");
      if (globalTheme === "dark") return "dark";
      if (globalTheme === "light") return "light";

      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });
  const [showWordCount, setShowWordCount] = useState(() => {
    if (typeof window !== "undefined") {
      const localVal = localStorage.getItem("pref-show-word-count");
      return localVal !== null ? localVal === "true" : true;
    }
    return true;
  });
  const [spellcheck, setSpellcheck] = useState(() => {
    if (typeof window !== "undefined") {
      const localVal = localStorage.getItem("pref-spellcheck");
      return localVal !== null ? localVal === "true" : false;
    }
    return false;
  });
  const [pasteImageLink, setPasteImageLink] = useState(() => {
    if (typeof window !== "undefined") {
      const localVal = localStorage.getItem("pref-paste-image-link");
      return localVal !== null ? localVal === "true" : true;
    }
    return true;
  });

  useEffect(() => {
    import("@/services/api").then(({ getApiOrigin }) => {
      fetch(`${getApiOrigin()}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(r => r.json()).then(payload => {
        const prefs = payload?.data?.preferences || {};
        if (prefs.editorTheme) {
          setEditorTheme(normalizeEditorTheme(prefs.editorTheme));
        } else {
          setEditorTheme(normalizeEditorTheme(localStorage.getItem("editor-theme")));
        }

        if (prefs.showWordCount !== undefined) {
          setShowWordCount(!!prefs.showWordCount);
        } else {
          const localVal = localStorage.getItem("pref-show-word-count");
          setShowWordCount(localVal !== null ? localVal === "true" : true);
        }

        if (prefs.spellcheck !== undefined) {
          setSpellcheck(!!prefs.spellcheck);
        } else {
          const localVal = localStorage.getItem("pref-spellcheck");
          setSpellcheck(localVal !== null ? localVal === "true" : false);
        }

        if (prefs.pasteImageLink !== undefined) {
          setPasteImageLink(!!prefs.pasteImageLink);
        } else {
          const localVal = localStorage.getItem("pref-paste-image-link");
          setPasteImageLink(localVal !== null ? localVal === "true" : true);
        }
      }).catch(() => {
        setEditorTheme(normalizeEditorTheme(localStorage.getItem("editor-theme")));
        setShowWordCount(localStorage.getItem("pref-show-word-count") !== "false");
        setSpellcheck(localStorage.getItem("pref-spellcheck") === "true");
        setPasteImageLink(localStorage.getItem("pref-paste-image-link") !== "false");
      });
    });
  }, []);

  const handleThemeChange = (newTheme: string) => {
    const normalizedTheme = normalizeEditorTheme(newTheme);
    setEditorTheme(normalizedTheme);
    localStorage.setItem("editor-theme", normalizedTheme);
    import("@/services/api").then(({ updatePreferences }) => {
      updatePreferences({ editorTheme: normalizedTheme }).catch(console.error);
    });
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (key === "showWordCount") {
      setShowWordCount(value);
      localStorage.setItem("pref-show-word-count", String(value));
    } else if (key === "spellcheck") {
      setSpellcheck(value);
      localStorage.setItem("pref-spellcheck", String(value));
    } else if (key === "pasteImageLink") {
      setPasteImageLink(value);
      localStorage.setItem("pref-paste-image-link", String(value));
    }
    import("@/services/api").then(({ updatePreferences }) => {
      updatePreferences({ [key]: value }).catch(console.error);
    });
  };

  // ── Sidebar Context Menu State ──
  const [sidebarMenu, setSidebarMenu] = useState<{
    x: number;
    y: number;
    note: NoteWithMeta;
  } | null>(null);

  // ── Sidebar visibility logic ──
  const sidebarVisible = isSidebarPinned || sidebarHovered;

  // ── Computed data ──
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.meta.trash),
    [notes]
  );
  const trashedNotes = useMemo(
    () => notes.filter((n) => n.meta.trash),
    [notes]
  );
  const favoriteNotes = useMemo(
    () => activeNotes.filter((n) => n.meta.favorite),
    [activeNotes]
  );
  const tree = useMemo(() => buildTree(activeNotes), [activeNotes]);
  const activeNote = notes.find((n) => n.id === activeNoteId);
  const ancestors = activeNoteId
    ? getAncestors(activeNoteId, activeNotes)
    : [];

  const filteredActiveNotes = useMemo(() => {
    if (!searchQuery.trim()) return activeNotes;
    const q = searchQuery.toLowerCase();
    return activeNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.bodyMarkdown.toLowerCase().includes(q)
    );
  }, [activeNotes, searchQuery]);

  // ────────────────────────────────────────────────────
  //  Data Loading
  // ────────────────────────────────────────────────────

  useEffect(() => {
    fetchNotes();
  }, []);

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
      console.error("Failed to fetch notes:", error);
      toast.error("Could not load your notes");
    } finally {
      setIsLoading(false);
    }
  };

  // ────────────────────────────────────────────────────
  //  Note selection
  // ────────────────────────────────────────────────────

  const selectNote = useCallback((note: NoteWithMeta) => {
    setActiveNoteId(note.id);
    activeNoteIdRef.current = note.id;
    setTitle(note.title);
    setBodyMarkdown(note.bodyMarkdown);
    setMetadata({ ...note.meta });
    // On mobile, close sidebar
    if (window.innerWidth < 768) {
      setIsSidebarPinned(false);
      setSidebarHovered(false);
    }
  }, []);

  // ────────────────────────────────────────────────────
  //  Persistence helpers
  // ────────────────────────────────────────────────────

  const persistNote = useCallback(
    (
      noteId: string,
      newMeta: NoteMetadata,
      newBody: string,
      newTitle?: string
    ) => {
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

          setNotes((prev) =>
            prev.map((n) =>
              n.id === updated.id
                ? { ...updated, meta: savedMeta, bodyMarkdown: updated.content_markdown || "" }
                : n
            )
          );
          setIsSaving(false);
        } catch {
          toast.error("Auto-save failed");
          setIsSaving(false);
        }
      }, 1200);
    },
    []
  );

  // ────────────────────────────────────────────────────
  //  Editor Handlers
  // ────────────────────────────────────────────────────

  const handleNoteChange = useCallback(
    (newMarkdown: string) => {
      setBodyMarkdown(newMarkdown);
      // Optimistic local update
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteIdRef.current
            ? { ...n, bodyMarkdown: newMarkdown }
            : n
        )
      );
      const currentId = activeNoteIdRef.current;
      if (!currentId) return;
      const note = notes.find((n) => n.id === currentId);
      if (!note) return;
      persistNote(currentId, note.meta, newMarkdown);
    },
    [notes, persistNote]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNoteIdRef.current ? { ...n, title: newTitle } : n
      )
    );
    const currentId = activeNoteIdRef.current;
    if (!currentId) return;
    persistNote(currentId, metadata, bodyMarkdown, newTitle);
  };

  // ────────────────────────────────────────────────────
  //  Metadata Mutations
  // ────────────────────────────────────────────────────

  const updateMetadataField = useCallback(
    <K extends keyof NoteMetadata>(key: K, value: NoteMetadata[K]) => {
      const currentId = activeNoteIdRef.current;
      if (!currentId) return;

      const newMeta = { ...metadata, [key]: value };
      setMetadata(newMeta);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === currentId ? { ...n, meta: newMeta } : n
        )
      );
      persistNote(currentId, newMeta, bodyMarkdown);
    },
    [metadata, bodyMarkdown, persistNote]
  );

  const handleToggleFavorite = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const newMeta = { ...note.meta, favorite: !note.meta.favorite };
      if (noteId === activeNoteIdRef.current) {
        setMetadata(newMeta);
      }
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, meta: newMeta } : n))
      );
      persistNote(noteId, newMeta, note.bodyMarkdown);
      toast.success(newMeta.favorite ? "Added to favorites" : "Removed from favorites");
    },
    [notes, persistNote]
  );

  const setPageFont = useCallback(
    (font: PageFont) => {
      updateMetadataField("font", font);
    },
    [updateMetadataField]
  );

  const toggleFullWidth = useCallback(() => {
    updateMetadataField("fullWidth", !metadata.fullWidth);
  }, [metadata.fullWidth, updateMetadataField]);

  // ────────────────────────────────────────────────────
  //  CRUD
  // ────────────────────────────────────────────────────

  const handleCreateNote = async (parentId?: string) => {
    try {
      const newMeta: NoteMetadata = {
        ...DEFAULT_METADATA,
        parentId: parentId || "",
      };
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
      const enriched: NoteWithMeta = {
        ...newNote,
        meta,
        bodyMarkdown: newNote.content_markdown || "",
      };
      setNotes((prev) => [enriched, ...prev]);
      selectNote(enriched);
      if (parentId) {
        setExpandedNodes((prev) => new Set(prev).add(parentId));
      }
      toast.success("New page created");
    } catch {
      toast.error("Could not create page");
    }
  };

  const handleMoveToTrash = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const newMeta = { ...note.meta, trash: true };
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, meta: newMeta } : n
        )
      );

      // If active note is trashed, select another
      if (activeNoteId === noteId) {
        const remaining = notes.filter(
          (n) => n.id !== noteId && !n.meta.trash
        );
        if (remaining.length > 0) {
          selectNote(remaining[0]);
        } else {
          setActiveNoteId(null);
          activeNoteIdRef.current = null;
        }
      }

      persistNote(noteId, newMeta, note.bodyMarkdown);
      toast.success("Moved to Trash");
    },
    [notes, activeNoteId, selectNote, persistNote]
  );

  const handleRestoreFromTrash = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId);
      if (!note) return;

      const newMeta = { ...note.meta, trash: false };
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, meta: newMeta } : n
        )
      );
      persistNote(noteId, newMeta, note.bodyMarkdown);
      toast.success("Page restored");
    },
    [notes, persistNote]
  );

  const handleDeletePermanently = async (noteId: string) => {
    if (!confirm("Delete this page permanently? This cannot be undone."))
      return;
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (activeNoteId === noteId) {
        const remaining = notes.filter(
          (n) => n.id !== noteId && !n.meta.trash
        );
        if (remaining.length > 0) {
          selectNote(remaining[0]);
        } else {
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

  // ── Rename ──
  const startRename = (note: NoteWithMeta, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingNoteId(note.id);
    setRenameValue(note.title || "");
    setTimeout(() => renameInputRef.current?.select(), 50);
  };

  const commitRename = async () => {
    if (!renamingNoteId) return;
    const trimmed = renameValue.trim() || "Untitled";
    setNotes((prev) =>
      prev.map((n) =>
        n.id === renamingNoteId ? { ...n, title: trimmed } : n
      )
    );
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
      setNotes((prev) =>
        prev.map((n) =>
          n.id === updated.id
            ? { ...updated, meta, bodyMarkdown: updated.content_markdown || "" }
            : n
        )
      );
    } catch {
      toast.error("Failed to rename");
    }
  };

  // ────────────────────────────────────────────────────
  //  Sidebar tree toggle
  // ────────────────────────────────────────────────────

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // ────────────────────────────────────────────────────
  //  FONT CLASS
  // ────────────────────────────────────────────────────

  const fontClass =
    metadata.font === "serif"
      ? "font-serif"
      : metadata.font === "mono"
        ? "font-mono"
        : "font-sans";

  // ────────────────────────────────────────────────────
  //  LOADING
  // ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-background",
        editorTheme === "light" && "theme-light-editor",
        editorTheme === "dark" && "theme-dark-editor",
        editorTheme === "sepia" && "theme-sepia-editor",
        editorTheme === "nord" && "theme-nord-editor"
      )}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/50">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-background",
      editorTheme === "light" && "theme-light-editor",
      editorTheme === "dark" && "theme-dark-editor",
      editorTheme === "sepia" && "theme-sepia-editor",
      editorTheme === "nord" && "theme-nord-editor"
    )}>
      {/* ── Mobile overlay ── */}
      {sidebarVisible && !isSidebarPinned && (
        <div
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => {
            setIsSidebarPinned(false);
            setSidebarHovered(false);
          }}
        />
      )}

      {/* ── Hover zone for collapsed sidebar ── */}
      {!sidebarVisible && (
        <div
          className="fixed inset-y-0 left-0 z-30 w-3 hidden md:block"
          onMouseEnter={() => setSidebarHovered(true)}
        />
      )}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <NotesSidebar
        isSidebarPinned={isSidebarPinned}
        sidebarHovered={sidebarHovered}
        onSidebarHover={setSidebarHovered}
        onTogglePin={() => {
          setIsSidebarPinned(!isSidebarPinned);
          if (isSidebarPinned) setSidebarHovered(false);
        }}
        activeNoteId={activeNoteId}
        favorites={favoriteNotes}
        tree={tree}
        trashedNotes={trashedNotes}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        expandedNodes={expandedNodes}
        onToggleExpanded={toggleExpanded}
        showTrash={showTrash}
        onToggleTrash={() => setShowTrash(!showTrash)}
        favoritesExpanded={favoritesExpanded}
        onToggleFavoritesExpanded={() => setFavoritesExpanded(!favoritesExpanded)}
        filteredActiveNotes={filteredActiveNotes}
        renamingNoteId={renamingNoteId}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        renameInputRef={renameInputRef}
        onCommitRename={commitRename}
        onCancelRename={() => setRenamingNoteId(null)}
        onSelectNote={selectNote}
        onStartRename={startRename}
        onMoveToTrash={handleMoveToTrash}
        onRestoreFromTrash={handleRestoreFromTrash}
        onDeletePermanently={handleDeletePermanently}
        onDuplicateNote={handleDuplicateNote}
        onCreateNote={handleCreateNote}
        onToggleFavorite={handleToggleFavorite}
        onOpenSettings={() => setShowSettings(true)}
        onContextMenu={(note, e) => setSidebarMenu({ x: e.clientX, y: e.clientY, note })}
      />

      {/* ═══════════════ MAIN AREA ═══════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 z-10 relative bg-background text-foreground transition-all duration-300">
        {activeNote && !activeNote.meta.trash ? (
          <>
            <NotesEditorHeader
              title={title}
              metadata={metadata}
              ancestors={ancestors}
              activeNoteId={activeNoteId}
              isSaving={isSaving}
              sidebarVisible={sidebarVisible}
              onSelectAncestor={selectNote}
              onToggleFavorite={() => handleToggleFavorite(activeNoteId!)}
              onToggleSidebar={() => {
                setIsSidebarPinned(true);
              }}
              onToggleFullWidth={toggleFullWidth}
              onSetFont={setPageFont}
              onDuplicate={() => handleDuplicateNote(activeNoteId!)}
              onTrash={() => handleMoveToTrash(activeNoteId!)}
              onOpenEmojiPicker={() => setShowEmojiPicker(true)}
              onOpenCoverPicker={() => setShowCoverPicker(true)}
            />

            <NoteEditorCanvas
              title={title}
              metadata={metadata}
              bodyMarkdown={bodyMarkdown}
              fontClass={fontClass}
              onTitleChange={handleTitleChange}
              onBodyChange={handleNoteChange}
              onOpenEmojiPicker={(e) => {
                emojiTriggerRef.current = e.currentTarget;
                setShowEmojiPicker(true);
              }}
              onRemoveIcon={() => updateMetadataField("icon", "")}
              onOpenCoverPicker={(e) => {
                coverTriggerRef.current = e.currentTarget;
                setShowCoverPicker(true);
              }}
              onRemoveCover={() => updateMetadataField("cover", "")}
              showWordCount={showWordCount}
              spellcheck={spellcheck}
            />
          </>
        ) : (
          <NotesEmptyState
            sidebarVisible={sidebarVisible}
            notesCount={notes.length}
            onCreateNote={() => handleCreateNote()}
            onToggleSidebar={() => setIsSidebarPinned(true)}
          />
        )}
      </div>

      <NotesEmojiPicker
        isOpen={showEmojiPicker}
        onSelect={(emoji) => {
          updateMetadataField("icon", emoji);
          setShowEmojiPicker(false);
        }}
        onClose={() => setShowEmojiPicker(false)}
        triggerRef={emojiTriggerRef}
        theme={editorTheme}
      />

      <NotesCoverPicker
        isOpen={showCoverPicker}
        onSelect={(cover) => {
          updateMetadataField("cover", cover);
          setShowCoverPicker(false);
        }}
        onRemove={() => {
          updateMetadataField("cover", "");
          setShowCoverPicker(false);
        }}
        onClose={() => setShowCoverPicker(false)}
        triggerRef={coverTriggerRef}
        theme={editorTheme}
      />

      <NotesSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        editorTheme={editorTheme}
        onThemeChange={handleThemeChange}
        showWordCount={showWordCount}
        spellcheck={spellcheck}
        pasteImageLink={pasteImageLink}
        onPreferenceChange={handlePreferenceChange}
      />

      {sidebarMenu && (
        <NotesSidebarContextMenu
          note={sidebarMenu.note}
          position={{ x: sidebarMenu.x, y: sidebarMenu.y }}
          onClose={() => setSidebarMenu(null)}
          onRename={startRename}
          onDuplicate={handleDuplicateNote}
          onToggleFavorite={handleToggleFavorite}
          onTrash={handleMoveToTrash}
          theme={editorTheme}
        />
      )}
    </div>
  );
}
