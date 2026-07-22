import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogPanel,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectPopup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BranchListColumn } from "./components/subject-manager/BranchListColumn";
import { SubjectListColumn } from "./components/subject-manager/SubjectListColumn";
import { TopicListColumn } from "./components/subject-manager/TopicListColumn";
import { useSubjectManager } from "./hooks/use-subject-manager";
import type { BranchData, Subject, Topic } from "@/services/api";

export default function SubjectManagerPage() {
    const manager = useSubjectManager();

    // Dialog States
    const [branchDialogOpen, setBranchDialogOpen] = useState(false);
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);

    // Form States
    const [branchForm, setBranchForm] = useState<Partial<BranchData>>({ name: '', status: 'Available' });
    const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({ title: '', code: '', description: '' });
    const [topicForm, setTopicForm] = useState<Partial<Topic>>({ title: '', description: '' });

    // Open Handlers
    const openCreateBranch = () => { setBranchForm({ name: '', status: 'Available' }); setBranchDialogOpen(true); };
    const openEditBranch = (b: BranchData) => { setBranchForm(b); setBranchDialogOpen(true); };

    const openCreateSubject = () => { setSubjectForm({ title: '', code: '' }); setSubjectDialogOpen(true); };
    const openEditSubject = (s: Subject) => { setSubjectForm(s); setSubjectDialogOpen(true); };

    const openCreateTopic = () => { setTopicForm({ title: '', description: '' }); setTopicDialogOpen(true); };
    const openEditTopic = (t: Topic) => { setTopicForm(t); setTopicDialogOpen(true); };

    // Save Handlers
    const onSaveBranch = async () => {
        await manager.handleSaveBranch(branchForm);
        setBranchDialogOpen(false);
    };

    const onSaveSubject = async () => {
        await manager.handleSaveSubject(subjectForm);
        setSubjectDialogOpen(false);
    };

    const onSaveTopic = async () => {
        await manager.handleSaveTopic(topicForm);
        setTopicDialogOpen(false);
    };

    return (
        <div className="flex h-[calc(100vh-theme(spacing.32))] w-full border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm">
            
            <BranchListColumn 
                manager={manager} 
                onCreateBranch={openCreateBranch}
                onEditBranch={openEditBranch}
            />

            <SubjectListColumn 
                manager={manager} 
                onCreateSubject={openCreateSubject}
                onEditSubject={openEditSubject}
            />

            <TopicListColumn 
                manager={manager} 
                onCreateTopic={openCreateTopic}
                onEditTopic={openEditTopic}
            />

            {/* Branch Dialog */}
            <Dialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen}>
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>{branchForm.id ? 'Edit Branch' : 'Create Branch'}</DialogTitle>
                    </DialogHeader>
                    <DialogPanel>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Branch Name</label>
                                <Input value={branchForm.name} onChange={e => setBranchForm({...branchForm, name: e.target.value})} placeholder="e.g. Computer" />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select 
                                    items={[
                                        { label: "Available", value: "Available" },
                                        { label: "Coming Soon", value: "Coming Soon" }
                                    ]}
                                    value={{ label: branchForm.status || "Available", value: branchForm.status || "Available" }}
                                    onValueChange={(v) => v && setBranchForm({...branchForm, status: v.value as any})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectPopup>
                                        <SelectItem value={{ label: "Available", value: "Available" }}>Available</SelectItem>
                                        <SelectItem value={{ label: "Coming Soon", value: "Coming Soon" }}>Coming Soon</SelectItem>
                                    </SelectPopup>
                                </Select>
                            </div>
                        </div>
                    </DialogPanel>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button onClick={onSaveBranch}>Save</Button>
                    </DialogFooter>
                </DialogPopup>
            </Dialog>

            {/* Subject Dialog */}
            <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>{subjectForm.id ? 'Edit Subject' : 'Create Subject'}</DialogTitle>
                        <DialogDescription>For {manager.selectedBranch?.name} - Sem {manager.selectedSemester}</DialogDescription>
                    </DialogHeader>
                    <DialogPanel>
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
                    </DialogPanel>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button onClick={onSaveSubject}>Save</Button>
                    </DialogFooter>
                </DialogPopup>
            </Dialog>

            {/* Topic Dialog */}
            <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>{topicForm.id ? 'Rename Topic' : 'Create Topic'}</DialogTitle>
                    </DialogHeader>
                    <DialogPanel>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Topic Title</label>
                                <Input value={topicForm.title} onChange={e => setTopicForm({...topicForm, title: e.target.value})} placeholder="e.g. Introduction to Arrays" />
                            </div>
                        </div>
                    </DialogPanel>
                    <DialogFooter>
                        <DialogClose render={<Button variant="outline">Cancel</Button>} />
                        <Button onClick={onSaveTopic}>{topicForm.id ? 'Rename' : 'Create & Edit Content'}</Button>
                    </DialogFooter>
                </DialogPopup>
            </Dialog>

        </div>
    );
}
