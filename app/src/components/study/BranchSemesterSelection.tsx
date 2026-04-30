import { motion, AnimatePresence, type Variants } from "framer-motion";
import type { ElementType } from "react";
import {
    Building2,
    Check,
    Cog,
    Globe,
    Monitor,
    Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BRANCHES, SEMESTERS } from "@/services/api";
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
        label: string;
        desc: string;
    }
> = {
    Computer: {
        icon: Monitor,
        label: "Computer Engg.",
        desc: "Software, DSA, OS and networking fundamentals.",
    },
    IT: {
        icon: Globe,
        label: "Information Tech.",
        desc: "Web, databases, security and cloud systems.",
    },
    Mechanical: {
        icon: Cog,
        label: "Mechanical Engg.",
        desc: "Thermodynamics, CAD and machine design topics.",
    },
    Civil: {
        icon: Building2,
        label: "Civil Engg.",
        desc: "Structures, surveying and construction materials.",
    },
    Electrical: {
        icon: Zap,
        label: "Electrical Engg.",
        desc: "Circuits, machines and power system studies.",
    },
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function BranchSemesterSelection({
    selectedBranch,
    selectedSemester,
    onBranchSelect,
    onSemesterSelect,
}: BranchSemesterSelectionProps) {
    const selectedMeta = selectedBranch ? BRANCH_META[selectedBranch] : null;

    return (
        <div className="mx-auto w-full max-w-5xl space-y-6">
            <section className="space-y-5 rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5">
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
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {BRANCHES.map((branch) => {
                            const meta = BRANCH_META[branch];
                            if (!meta) return null;

                            const Icon = meta.icon;
                            const isActive = selectedBranch === branch;

                            return (
                                <motion.button
                                    key={branch}
                                    variants={fadeUpVariants}
                                    onClick={() => onBranchSelect(branch)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        "group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left outline-none transition-all duration-300 overflow-hidden",
                                        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                                        isActive
                                            ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_-5px_rgba(var(--primary),0.2)] scale-[1.01]"
                                            : "border-border/60 bg-background/50 hover:border-primary/30 hover:bg-muted hover:shadow-sm"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0  from-primary/10 via-transparent to-transparent opacity-50" />
                                    )}
                                    <div
                                        className={cn(
                                            "relative z-10 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border transition-colors duration-300",
                                            isActive
                                                ? "border-primary/30 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                : "border-border/50 bg-background text-muted-foreground group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" strokeWidth={2} />
                                    </div>

                                    <div className="relative z-10 min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn("truncate text-[15px] font-semibold transition-colors", isActive ? "text-primary" : "text-foreground group-hover:text-foreground")}>
                                                {meta.label}
                                            </p>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="shrink-0"
                                                >
                                                    <Check className="h-5 w-5 text-primary" />
                                                </motion.div>
                                            )}
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                                            {meta.desc}
                                        </p>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            <AnimatePresence mode="popLayout">
                {selectedBranch && selectedMeta && (
                    <motion.div
                        key="semester-section"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                        className="overflow-hidden"
                    >
                        <section className="space-y-5 rounded-2xl border border-border/60 bg-background/70 p-4 sm:p-5">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="rounded-full border-border/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Step 2
                                    </Badge>
                                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                                        {selectedMeta.label}
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
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-8"
                                >
                                    {SEMESTERS.map((sem) => {
                                        const isActive = selectedSemester === sem.toString();
                                        return (
                                            <motion.button
                                                variants={fadeUpVariants}
                                                key={sem}
                                                onClick={() => onSemesterSelect(sem.toString())}
                                                aria-pressed={isActive}
                                                className={cn(
                                                    "relative flex h-14 flex-col items-center justify-center rounded-xl p-3 outline-none transition-all duration-300 overflow-hidden",
                                                    "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                                                    isActive
                                                        ? "border-transparent text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                                                        : "border border-border/60 bg-background/50 text-foreground hover:border-primary/30 hover:bg-muted"
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeSem"
                                                        className="absolute inset-0  from-primary to-primary/80"
                                                        initial={false}
                                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                    />
                                                )}
                                                <span className={cn("relative z-10 text-[10px] font-semibold uppercase tracking-wider", isActive ? "text-primary-foreground/90" : "text-muted-foreground")}>
                                                    Sem
                                                </span>
                                                <span className={cn("relative z-10 mt-0.5 text-[15px] font-bold", isActive ? "text-white" : "text-foreground")}>
                                                    {sem}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
