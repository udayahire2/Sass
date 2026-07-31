import { useState, useEffect } from "react";
import type { ElementType } from "react";
import {
    Building2,
    Check,
    Cog,
    Globe,
    Monitor,
    Zap,
    Folder,
    Loader2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SEMESTERS, fetchBranches, type BranchData } from "@/services/api";
import { cn } from "@/lib/utils";

interface BranchSemesterSelectionProps {
    selectedBranch: string | null;
    selectedSemester: string | null;
    onBranchSelect: (b: string) => void;
    onSemesterSelect: (s: string) => void;
}

const BRANCH_META: Record<
    string,
    {
        icon: ElementType;
        desc: string;
    }
> = {
    Computer: {
        icon: Monitor,
        desc: "Software, DSA, OS and networking fundamentals.",
    },
    IT: {
        icon: Globe,
        desc: "Web, databases, security and cloud systems.",
    },
    Mechanical: {
        icon: Cog,
        desc: "Thermodynamics, CAD and machine design topics.",
    },
    Civil: {
        icon: Building2,
        desc: "Structures, surveying and construction materials.",
    },
    Electrical: {
        icon: Zap,
        desc: "Circuits, machines and power system studies.",
    },
};

export function BranchSemesterSelection({
    selectedBranch,
    selectedSemester,
    onBranchSelect,
    onSemesterSelect,
}: BranchSemesterSelectionProps) {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSemesters, setShowSemesters] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetchBranches()
            .then(data => {
                if (mounted) setBranches(data.filter(b => b.isActive));
            })
            .catch(err => console.error("Failed to load branches:", err))
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    // Show semester section only when a branch is selected
    useEffect(() => {
        if (selectedBranch) {
            setShowSemesters(true);
        } else {
            setShowSemesters(false);
        }
    }, [selectedBranch]);

    const selectedBranchData = branches.find(b => b.name === selectedBranch);

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            {/* Branch selection */}
            <section className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5 shadow-sm">
                <div className="space-y-3">
                    <Badge variant="outline" className="w-fit rounded-full border-border/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Step 1
                    </Badge>
                    <div className="space-y-1.5">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">Select your branch</h2>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Start with your branch to see only relevant subjects.
                        </p>
                    </div>
                </div>

                <Separator className="bg-border/60" />

                <div>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="animate-spin text-muted-foreground w-8 h-8" />
                        </div>
                    ) : branches.length === 0 ? (
                        <div className="text-center p-8 text-muted-foreground">
                            No branches available at the moment.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {branches.map((branch) => {
                                const meta = BRANCH_META[branch.name] || { icon: Folder, desc: "Explore subjects and resources." };
                                const Icon = meta.icon;
                                const isActive = selectedBranch === branch.name;
                                const isComingSoon = branch.status === 'Coming Soon';

                                return (
                                    <button
                                        key={branch.id}
                                        onClick={() => {
                                            if (!isComingSoon) onBranchSelect(branch.name);
                                        }}
                                        disabled={isComingSoon}
                                        aria-pressed={isActive}
                                        className={cn(
                                            "group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left outline-none transition-all duration-200 overflow-hidden",
                                            isComingSoon ? "opacity-60 cursor-not-allowed bg-muted/30" : "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background hover:shadow-sm",
                                            isActive
                                                ? "border-primary bg-primary/5 scale-[1.02]"
                                                : (!isComingSoon ? "border-border bg-card hover:bg-muted" : "border-border/40")
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                                                isActive
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-muted-foreground group-hover:bg-background/80 group-hover:text-foreground"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" strokeWidth={1.5} />
                                        </div>

                                        <div className="relative z-10 min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("truncate text-[15px] font-semibold transition-colors", isActive ? "text-primary" : "text-foreground group-hover:text-foreground")}>
                                                    {branch.name}
                                                </p>
                                                {isComingSoon ? (
                                                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider px-1.5 py-0">Coming Soon</Badge>
                                                ) : isActive && (
                                                    <div className="shrink-0">
                                                        <Check className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                                                {meta.desc}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Semester selection – animated with pure CSS */}
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-out",
                    showSemesters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}
            >
                <section className="space-y-5 rounded-2xl border border-border/60 bg-card/70 p-4 sm:p-5 shadow-sm">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-full border-border/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Step 2
                            </Badge>
                            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                {selectedBranchData?.name}
                            </Badge>
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-lg font-semibold tracking-tight text-foreground">Select semester</h2>
                            <p className="text-sm leading-6 text-muted-foreground">
                                Choose the semester you want to study right now.
                            </p>
                        </div>
                        <Separator className="bg-border/50" />
                    </div>

                    <div>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-8">
                            {SEMESTERS.map((sem) => {
                                const isActive = selectedSemester === sem.toString();
                                return (
                                    <button
                                        key={sem}
                                        onClick={() => onSemesterSelect(sem.toString())}
                                        aria-pressed={isActive}
                                        className={cn(
                                            "relative flex h-14 flex-col items-center justify-center rounded-lg p-3 outline-none transition-all duration-200 overflow-hidden",
                                            "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                                            isActive
                                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                : "border border-border bg-card text-foreground hover:bg-muted hover:shadow-sm"
                                        )}
                                    >
                                        <span className={cn("relative z-10 text-[10px] font-medium uppercase tracking-wider", isActive ? "text-primary-foreground/90" : "text-muted-foreground")}>
                                            Sem
                                        </span>
                                        <span className={cn("relative z-10 mt-0.5 text-[15px] font-semibold", isActive ? "text-white" : "text-foreground")}>
                                            {sem}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}