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
        <div className="w-64 flex flex-col border-r bg-muted/10 shrink-0">
            <div className="p-4 border-b flex items-center justify-between bg-background">
                <div className="font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    Branches
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateBranch}>
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            <div className="p-2 border-b bg-background">
                <Select
                    items={semesterItems}
                    value={semesterItems.find(i => i.value === selectedSemester)}
                    onValueChange={(item) => item && setSelectedSemester(item.value)}
                >
                    <SelectTrigger className="h-8 text-xs">
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
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingBranches ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-5 h-5" /></div>
                ) : branches.map(b => (
                    <div 
                        key={b.id} 
                        onClick={() => setSelectedBranch(b)}
                        className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer text-sm transition-colors group",
                            selectedBranch?.id === b.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex flex-col min-w-0">
                            <span className="truncate">{b.name}</span>
                            <span className="text-[10px] opacity-70">{b.status}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded" onClick={(e) => { e.stopPropagation(); onEditBranch(b); }}>
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded" onClick={(e) => handleDelete(b.id, e)}>
                                <Trash2 className="w-3 h-3 text-red-500 hover:text-red-600 dark:text-red-400" />
                            </button>
                            <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
