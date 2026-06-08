import { Loader2 } from "lucide-react";
import {
  NotesPageSidebar,
  EditorHeader,
  PageCanvas,
  EmptyState,
  SettingsModal,
  SidebarContextMenu,
} from "@/components/notes";
import { EmojiPicker } from "@/components/notes/EmojiPicker";
import { CoverPicker } from "@/components/notes/CoverPicker";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotesProvider, useNotesState } from "@/context/NotesContext";

function NotesPageContent() {
  const {
    isLoading,
    notes,
    activeNote,
    activeNoteId,
    title,
    metadata,
    ancestors,
    isSaving,
    sidebarVisible,
    bodyMarkdown,
    fontClass,
    showEmojiPicker,
    showCoverPicker,
    showSettings,
    editorTheme,
    sidebarMenu,
    emojiTriggerRef,
    coverTriggerRef,
    selectNote,
    handleToggleFavorite,
    setIsSidebarPinned,
    toggleFullWidth,
    setPageFont,
    handleDuplicateNote,
    handleMoveToTrash,
    setShowEmojiPicker,
    setShowCoverPicker,
    handleTitleChange,
    handleNoteChange,
    updateMetadataField,
    handleCreateNote,
    setShowSettings,
    handleThemeChange,
    setSidebarMenu,
    startRename,
  } = useNotesState();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/50">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 z-50 flex h-screen w-screen overflow-hidden bg-background">
        {/* ── Mobile overlay ── */}
        {sidebarVisible && !metadata.fullWidth && ( // just reusing sidebarVisible logic inside NotesPageSidebar mostly
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => {
              setIsSidebarPinned(false);
            }}
          />
        )}

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <NotesPageSidebar />

        {/* ═══════════════ MAIN AREA ═══════════════ */}
        <div className={cn(
          "flex flex-1 flex-col overflow-hidden min-w-0 z-10 relative transition-all duration-300",
          editorTheme === "light" && "theme-light-editor",
          editorTheme === "dark" && "theme-dark-editor"
        )}>
          {activeNote && !activeNote.meta.trash ? (
            <>
              <EditorHeader
                title={title}
                metadata={metadata}
                ancestors={ancestors}
                activeNoteId={activeNoteId}
                isSaving={isSaving}
                sidebarVisible={sidebarVisible}
                onSelectAncestor={selectNote}
                onToggleFavorite={() => handleToggleFavorite(activeNoteId!)}
                onToggleSidebar={() => setIsSidebarPinned(true)}
                onToggleFullWidth={toggleFullWidth}
                onSetFont={setPageFont}
                onDuplicate={() => handleDuplicateNote(activeNoteId!)}
                onTrash={() => handleMoveToTrash(activeNoteId!)}
                onOpenEmojiPicker={() => setShowEmojiPicker(true)}
                onOpenCoverPicker={() => setShowCoverPicker(true)}
              />

              <PageCanvas
                title={title}
                metadata={metadata}
                bodyMarkdown={bodyMarkdown}
                fontClass={fontClass}
                onTitleChange={handleTitleChange}
                onBodyChange={handleNoteChange}
                onOpenEmojiPicker={(e) => {
                  (emojiTriggerRef as any).current = e.currentTarget;
                  setShowEmojiPicker(true);
                }}
                onRemoveIcon={() => updateMetadataField("icon", "")}
                onOpenCoverPicker={(e) => {
                  (coverTriggerRef as any).current = e.currentTarget;
                  setShowCoverPicker(true);
                }}
                onRemoveCover={() => updateMetadataField("cover", "")}
              />
            </>
          ) : (
            <EmptyState
              sidebarVisible={sidebarVisible}
              notesCount={notes.length}
              onCreateNote={() => handleCreateNote()}
              onToggleSidebar={() => setIsSidebarPinned(true)}
            />
          )}
        </div>

        <EmojiPicker
          isOpen={showEmojiPicker}
          onSelect={(emoji) => {
            updateMetadataField("icon", emoji);
            setShowEmojiPicker(false);
          }}
          onClose={() => setShowEmojiPicker(false)}
          triggerRef={emojiTriggerRef}
        />

        <CoverPicker
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
        />

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          editorTheme={editorTheme}
          onThemeChange={handleThemeChange}
        />

        {sidebarMenu && (
          <SidebarContextMenu
            note={sidebarMenu.note}
            position={{ x: sidebarMenu.x, y: sidebarMenu.y }}
            onClose={() => setSidebarMenu(null)}
            onRename={startRename}
            onDuplicate={handleDuplicateNote}
            onToggleFavorite={handleToggleFavorite}
            onTrash={handleMoveToTrash}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default function NotesPage() {
  return (
    <NotesProvider>
      <NotesPageContent />
    </NotesProvider>
  );
}
