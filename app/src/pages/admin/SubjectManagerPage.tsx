import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Loader2, Plus, Search, BookOpen, Trash2, Edit2, LayoutTemplate, Layers, LayoutList, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
    fetchBranches,
    createBranchData,
    updateBranchData,
    deleteBranchData,
    fetchSubjectsByBranchSemester,
    createSubject,
    updateSubject,
    deleteSubject,
    fetchSubjectUnits,
    createUnit,
    createTopic,
    updateTopic,
    deleteTopic,
    type BranchData,
    type Subject,
    type Topic,
    type Unit,
    SEMESTERS
} from "@/services/api";
import { TopicContentForm } from "@/components/admin/TopicContentForm";
import { cn } from "@/lib/utils";

export default function SubjectManagerPage() {
    const [branches, setBranches] = useState<BranchData[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    
    // Selection state
    const [selectedBranch, setSelectedBranch] = useState<BranchData | null>(null);
    const [selectedSemester, setSelectedSemester] = useState<string>("3");
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    // Loading states
    const [loadingBranches, setLoadingBranches] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingTopics, setLoadingTopics] = useState(false);

    // Dialogs
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);

    // Forms
    const [branchForm, setBranchForm] = useState<Partial<BranchData>>({ name: '', status: 'Available' });
    const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ title: '', code: '', description: '' });
    const [topicForm, setTopicForm] = useState<Partial<Topic>>({ title: '', description: '' });

    const loadBranches = async () => {
        setLoadingBranches(true);
        try {
            const data = await fetchBranches(true);
            setBranches(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load branches");
        } finally {
            setLoadingBranches(false);
        }
    };

    const loadSubjects = async (branchName: string, semester: string) => {
        setLoadingSubjects(true);
        try {
            const data = await fetchSubjectsByBranchSemester(branchName, semester);
            setSubjects(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load subjects");
        } finally {
            setLoadingSubjects(false);
        }
    };

    const loadTopics = async (subjectId: string) => {
        setLoadingTopics(true);
        try {
            const data = await fetchSubjectUnits(subjectId);
            setUnits(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load topics");
        } finally {
            setLoadingTopics(false);
        }
    };

    useEffect(() => {
        loadBranches();
    }, []);

    useEffect(() => {
        if (selectedBranch) {
            loadSubjects(selectedBranch.name, selectedSemester);
            setSelectedSubject(null);
            setUnits([]);
        } else {
            setSubjects([]);
            setSelectedSubject(null);
            setUnits([]);
        }
    }, [selectedBranch, selectedSemester]);

    useEffect(() => {
        if (selectedSubject) {
            loadTopics(selectedSubject.id);
        } else {
            setUnits([]);
        }
    }, [selectedSubject]);

    // ── Branch Handlers ──
    const handleSaveBranch = async () => {
        try {
            if (branchForm.id) {
                await updateBranchData(branchForm.id, branchForm);
                toast.success("Branch updated");
            } else {
                await createBranchData(branchForm);
                toast.success("Branch created");
            }
            setBranchDialogOpen(false);
            loadBranches();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteBranch = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this branch?')) return;
        try {
            await deleteBranchData(id);
            toast.success("Branch deleted");
            if (selectedBranch?.id === id) setSelectedBranch(null);
            loadBranches();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ── Subject Handlers ──
    const handleSaveSubject = async () => {
        if (!selectedBranch) return;
        try {
            if (subjectForm.id) {
                await updateSubject(subjectForm.id, subjectForm);
                toast.success("Subject updated");
            } else {
                await createSubject({
                    ...subjectForm,
                    branch: selectedBranch.name,
                    semester: Number(selectedSemester)
                });
                toast.success("Subject created");
            }
            setSubjectDialogOpen(false);
            loadSubjects(selectedBranch.name, selectedSemester);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteSubject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this subject?')) return;
        try {
            await deleteSubject(id);
            toast.success("Subject deleted");
            if (selectedSubject?.id === id) setSelectedSubject(null);
            loadSubjects(selectedBranch!.name, selectedSemester);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // ── Topic Handlers ──
    const handleSaveTopic = async () => {
        if (!selectedSubject) return;
        try {
            if (topicForm.id) {
                await updateTopic(topicForm.id, topicForm);
                toast.success("Topic updated");
            } else {
                // If no units exist, create a default one
                let targetUnitId = units.length > 0 ? units[0].id : null;
                if (!targetUnitId) {
                    const newUnit = await createUnit(selectedSubject.id, { title: "Unit 1", unit_number: 1 });
                    targetUnitId = newUnit.id;
                }
                await createTopic(targetUnitId, topicForm);
                toast.success("Topic created");
            }
            setTopicDialogOpen(false);
            loadTopics(selectedSubject.id);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleDeleteTopic = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this topic?')) return;
        try {
            await deleteTopic(id);
            toast.success("Topic deleted");
            loadTopics(selectedSubject!.id);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    // Flatten topics for the UI list
    const allTopics = units.flatMap(u => u.topics);

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] -mx-4 sm:-mx-6 -my-4 sm:-my-6 sm:mt-0 overflow-hidden bg-background">
            
            {/* Column 1: Branches */}
            <div className="w-64 flex flex-col border-r bg-muted/10 shrink-0">
                <div className="p-4 border-b flex items-center justify-between bg-background">
                    <div className="font-semibold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                        Branches
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setBranchForm({ name: '', status: 'Available' }); setBranchDialogOpen(true); }}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="p-2 border-b bg-background">
                    <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {SEMESTERS.map((s) => (
                                <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                            ))}
                        </SelectContent>
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
                                <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded" onClick={(e) => { e.stopPropagation(); setBranchForm(b); setBranchDialogOpen(true); }}>
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded" onClick={(e) => handleDeleteBranch(b.id, e)}>
                                    <Trash2 className="w-3 h-3 text-red-500 hover:text-red-600 dark:text-red-400" />
                                </button>
                                <ChevronRight className="w-4 h-4 ml-1 opacity-50" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 2: Subjects */}
            <div className="w-80 flex flex-col border-r bg-muted/5 shrink-0">
                <div className="p-4 border-b flex items-center justify-between bg-background">
                    <div className="font-semibold flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-muted-foreground" />
                        Subjects
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!selectedBranch} onClick={() => { setSubjectForm({ title: '', code: '' }); setSubjectDialogOpen(true); }}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {!selectedBranch ? (
                        <div className="p-4 text-center text-sm text-muted-foreground mt-10">
                            Select a branch to view subjects
                        </div>
                    ) : loadingSubjects ? (
                        <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground w-5 h-5" /></div>
                    ) : subjects.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground mt-10">
                            No subjects found.
                        </div>
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
                                <button className="p-1.5 hover:bg-muted rounded" onClick={(e) => { e.stopPropagation(); setSubjectForm(s); setSubjectDialogOpen(true); }}>
                                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                                </button>
                                <button className="p-1.5 hover:bg-muted rounded" onClick={(e) => handleDeleteSubject(s.id, e)}>
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Column 3: Topics & Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                        <LayoutList className="w-4 h-4 text-muted-foreground" />
                        Topics {selectedSubject && <span className="text-muted-foreground font-normal ml-2">in {selectedSubject.title}</span>}
                    </div>
                    <Button size="sm" disabled={!selectedSubject} onClick={() => { setTopicForm({ title: '', description: '' }); setTopicDialogOpen(true); }}>
                        <Plus className="w-4 h-4 mr-2" /> Add Topic
                    </Button>
                </div>
                
                <div className="flex-1 overflow-hidden flex relative">
                    {/* Topics List Side */}
                    <div className={cn("flex flex-col h-full overflow-y-auto p-4 space-y-2 transition-all", selectedTopic ? "w-1/3 border-r hidden lg:flex" : "w-full")}>
                        {!selectedSubject ? (
                            <Empty className="my-auto">
                                <EmptyTitle>No Subject Selected</EmptyTitle>
                                <EmptyDescription>Select a subject to view its topics.</EmptyDescription>
                            </Empty>
                        ) : loadingTopics ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-6 h-6" /></div>
                        ) : allTopics.length === 0 ? (
                            <Empty className="my-auto">
                                <EmptyTitle>No Topics Yet</EmptyTitle>
                                <EmptyDescription>Click the button above to add the first topic.</EmptyDescription>
                            </Empty>
                        ) : allTopics.map((t, idx) => (
                            <div 
                                key={t.id} 
                                className={cn(
                                    "flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
                                    selectedTopic?.id === t.id ? "ring-2 ring-primary border-transparent bg-primary/5" : "bg-card"
                                )}
                            >
                                <div className="flex flex-col min-w-0 flex-1 pr-3" onClick={() => setSelectedTopic(t)}>
                                    <span className="text-xs font-semibold text-primary mb-1">Topic {idx + 1}</span>
                                    <span className="font-medium text-sm leading-tight mb-1">{t.title}</span>
                                    {t.description && <span className="text-xs text-muted-foreground line-clamp-2">{t.description}</span>}
                                </div>
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setTopicForm(t); setTopicDialogOpen(true); }}>
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-red-500" onClick={(e) => handleDeleteTopic(t.id, e)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Editor Side */}
                    {selectedTopic && (
                        <div className="flex-1 h-full overflow-hidden absolute inset-0 lg:static z-10 bg-background">
                            <TopicContentForm 
                                topic={selectedTopic} 
                                onSaved={(updated) => {
                                    loadTopics(selectedSubject!.id);
                                    setSelectedTopic(updated);
                                }}
                                onCancel={() => setSelectedTopic(null)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Dialogs */}
            
            {/* Branch Dialog */}
            <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{branchForm.id ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Branch Name</label>
                            <Input value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="e.g. Computer" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={branchForm.status} onValueChange={(v: any) => setBranchForm({...branchForm, status: v})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBranchDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveBranch}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Subject Dialog */}
            <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{subjectForm.id ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
                        <DialogDescription>For {selectedBranch?.name} - Sem {selectedSemester}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Subject Code</label>
                            <Input value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} placeholder="e.g. CS101" />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Subject Title</label>
                            <Input value={subjectForm.title} onChange={e => setSubjectForm({...subjectForm, title: e.target.value})} placeholder="e.g. Data Structures" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSubject}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Topic Dialog (Metadata only, full edit happens in side panel) */}
            <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{topicForm.id ? 'Rename Topic' : 'Create Topic'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Topic Title</label>
                            <Input value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} placeholder="e.g. Introduction to Arrays" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTopicDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTopic}>{topicForm.id ? 'Rename' : 'Create & Edit Content'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
