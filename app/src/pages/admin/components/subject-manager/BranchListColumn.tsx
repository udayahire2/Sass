import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Edit2, Trash2, Layers, ChevronRight } from "lucide-react";
import {
    Select,
    SelectPopup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BranchData } from "@/services/api";
import { SEMESTERS } from "@/services/api";
import type { SubjectManagerContext } from "../../hooks/use-subject-manager";

interface BranchListColumnProps {
    manager: SubjectManagerContext;
    onEditBranch: (branch: BranchData) => void;
    onCreateBranch: () => void;
}

export function BranchListColumn({ manager, onEditBranch, onCreateBranch }: BranchListColumnProps) {
    const { branches, selectedBranch, selectedSemester, loadingBranches, setSelectedBranch, setSelectedSemester, handleDeleteBranch } = manager;

    const semesterItems = SEMESTERS.map(s => ({ label: `Semester ${s}`, value: s.toString() }));

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this branch?')) {
            await handleDeleteBranch(id);
        }
    };

    return (
        <div className="w-64 flex flex-col border-r border-border/50 bg-muted/10 shrink-0">
            <div className="px-3 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="text-sm font-semibold flex items-center gap-2 px-1">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Branches
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onCreateBranch}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="px-3 py-2 border-b border-border/50">
                <Select
                    items={semesterItems}
                    value={semesterItems.find(i => i.value === selectedSemester)}
                    onValueChange={(item) => item && setSelectedSemester(item.value)}
                >
                    <SelectTrigger className="h-8 text-xs border-border/50 bg-background/50 hover:bg-background transition-colors">
                        <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectPopup>
                        {semesterItems.map((item) => (
                            <SelectItem key={item.value} value={item}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectPopup>
                </Select>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {loadingBranches ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-4 h-4" /></div>
                ) : branches.map(b => (
                    <div 
                        key={b.id} 
                        onClick={() => setSelectedBranch(b)}
                        className={cn(
                            "flex items-center justify-between px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors group",
                            selectedBranch?.id === b.id 
                                ? "bg-accent text-accent-foreground font-medium" 
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                    >
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{b.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); onEditBranch(b); }}>
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded text-muted-foreground hover:text-red-500" onClick={(e) => handleDelete(b.id, e)}>
                                <Trash2 className="w-3 h-3" />
                            </button>
                            <ChevronRight className="w-4 h-4 ml-0.5 text-muted-foreground/50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
