import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, LayoutTemplate } from "lucide-react";
import { Empty, EmptyTitle, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { Subject } from "@/services/api";
import type { SubjectManagerContext } from "../../hooks/use-subject-manager";

interface SubjectListColumnProps {
    manager: SubjectManagerContext;
    onEditSubject: (subject: Subject) => void;
    onCreateSubject: () => void;
}

export function SubjectListColumn({ manager, onEditSubject, onCreateSubject }: SubjectListColumnProps) {
    const { subjects, selectedBranch, selectedSubject, loadingSubjects, setSelectedSubject, handleDeleteSubject } = manager;

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this subject?')) {
            await handleDeleteSubject(id);
        }
    };

    return (
        <div className="w-80 flex flex-col border-r border-border/50 bg-background/95 shrink-0">
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                    Subjects
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={!selectedBranch} onClick={onCreateSubject}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {!selectedBranch ? (
                    <Empty className="mt-10">
                        <EmptyHeader>
                            <EmptyTitle className="text-sm font-medium">No branch selected</EmptyTitle>
                            <EmptyDescription className="text-xs">Select a branch to view subjects</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : loadingSubjects ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-4 h-4" /></div>
                ) : subjects.length === 0 ? (
                    <Empty className="mt-10">
                        <EmptyHeader>
                            <EmptyTitle className="text-sm font-medium">No subjects found</EmptyTitle>
                            <EmptyDescription className="text-xs">Add a subject for this branch.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : subjects.map(s => (
                    <div 
                        key={s.id} 
                        onClick={() => setSelectedSubject(s)}
                        className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm transition-colors group",
                            selectedSubject?.id === s.id 
                                ? "bg-accent text-accent-foreground font-medium" 
                                : "bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                    >
                        <div className="flex flex-col min-w-0 flex-1 pr-2 gap-1">
                            <span className="truncate">{s.title || s.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground opacity-70 truncate w-fit">{s.code}</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onEditSubject(s); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-muted-foreground hover:text-red-500" onClick={(e) => handleDelete(s.id, e)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
