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
        <div className="w-80 flex flex-col border-r bg-muted/5 shrink-0">
            <div className="p-4 border-b flex items-center justify-between bg-background">
                <div className="font-semibold flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                    Subjects
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selectedBranch} onClick={onCreateSubject}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {!selectedBranch ? (
                    <Empty className="mt-10">
                        <EmptyHeader>
                            <EmptyTitle className="text-sm">No branch selected</EmptyTitle>
                            <EmptyDescription>Select a branch to view subjects</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : loadingSubjects ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-5 h-5" /></div>
                ) : subjects.length === 0 ? (
                    <Empty className="mt-10">
                        <EmptyHeader>
                            <EmptyTitle className="text-sm">No subjects found</EmptyTitle>
                            <EmptyDescription>Add a subject for this branch.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : subjects.map(s => (
                    <div 
                        key={s.id} 
                        onClick={() => setSelectedSubject(s)}
                        className={cn(
                            "flex items-center justify-between p-3 rounded-md cursor-pointer text-sm transition-colors border group",
                            selectedSubject?.id === s.id ? "bg-accent border-accent-foreground/20 shadow-sm" : "bg-background border-transparent hover:border-border"
                        )}
                    >
                        <div className="flex flex-col min-w-0 flex-1 pr-2">
                            <span className="font-medium truncate">{s.title || s.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{s.code}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-muted rounded" onClick={(e) => { e.stopPropagation(); onEditSubject(s); }}>
                                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button className="p-1.5 hover:bg-muted rounded" onClick={(e) => handleDelete(s.id, e)}>
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
