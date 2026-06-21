import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle
} from "@/components/ui/empty";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, Plus, ArrowLeft, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
    fetchSubjectUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    createTopic,
    deleteTopic,
    updateTopic,
    type Unit,
    type Topic
} from "@/services/api";

export default function SubjectDetailPage() {
    const { subjectId } = useParams();
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialogs state
    const [unitDialogOpen, setUnitDialogOpen] = useState(false);
    const [topicDialogOpen, setTopicDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [targetUnitIdForTopic, setTargetUnitIdForTopic] = useState<string | null>(null);
    
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'unit' | 'topic', id: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [unitFormData, setUnitFormData] = useState({ title: "", description: "", unit_number: 1 });
    const [topicFormData, setTopicFormData] = useState({ title: "", content_markdown: "", video_url: "" });

    const loadUnits = async () => {
        if (!subjectId) return;
        setLoading(true);
        try {
            const data = await fetchSubjectUnits(subjectId);
            setUnits(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load units");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUnits();
    }, [subjectId]);

    // Handlers
    const handleUnitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUnit) {
                await updateUnit(editingUnit.id || editingUnit._id!, unitFormData);
                toast.success("Unit updated");
            } else {
                await createUnit(subjectId!, unitFormData);
                toast.success("Unit created");
            }
            setUnitDialogOpen(false);
            loadUnits();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTopicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingTopic) {
                await updateTopic(editingTopic.id || editingTopic._id!, topicFormData);
                toast.success("Topic updated");
            } else if (targetUnitIdForTopic) {
                await createTopic(targetUnitIdForTopic, topicFormData);
                toast.success("Topic created");
            }
            setTopicDialogOpen(false);
            loadUnits();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === 'unit') {
                await deleteUnit(deleteTarget.id);
                toast.success("Unit deleted");
            } else {
                await deleteTopic(deleteTarget.id);
                toast.success("Topic deleted");
            }
            loadUnits();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete");
        } finally {
            setDeleteConfirmOpen(false);
            setDeleteTarget(null);
        }
    };

    const openCreateUnit = () => {
        setEditingUnit(null);
        setUnitFormData({ title: "", description: "", unit_number: units.length + 1 });
        setUnitDialogOpen(true);
    };

    const openEditUnit = (unit: Unit) => {
        setEditingUnit(unit);
        setUnitFormData({ title: unit.title, description: unit.description || "", unit_number: unit.unitNumber || unit.number || 1 });
        setUnitDialogOpen(true);
    };

    const openCreateTopic = (unitId: string) => {
        setEditingTopic(null);
        setTargetUnitIdForTopic(unitId);
        setTopicFormData({ title: "", content_markdown: "", video_url: "" });
        setTopicDialogOpen(true);
    };

    const openEditTopic = (topic: Topic) => {
        setEditingTopic(topic);
        setTopicFormData({ title: topic.title, content_markdown: topic.contentMarkdown || topic.markdownContent || "", video_url: topic.videoUrl || "" });
        setTopicDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin/subjects">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subject Details</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage units and topics for this subject.</p>
                </div>
                <div className="ml-auto">
                    <Button onClick={openCreateUnit}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Unit
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : units.length === 0 ? (
                <Empty className="rounded-xl border border-dashed p-12">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Plus className="text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyTitle>No units found</EmptyTitle>
                        <EmptyDescription>No units found for this subject. Create one to get started.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className="space-y-6">
                    {units.map((unit) => (
                        <Card key={unit.id || unit._id}>
                            <CardHeader className="border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Unit {unit.number || unit.unitNumber}: {unit.title}
                                        </CardTitle>
                                        {unit.description && <CardDescription className="mt-2">{unit.description}</CardDescription>}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => openEditUnit(unit)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Unit
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setDeleteTarget({ type: 'unit', id: unit.id || unit._id! }); setDeleteConfirmOpen(true); }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-medium">Topics</h4>
                                    <Button variant="secondary" size="sm" onClick={() => openCreateTopic(unit.id || unit._id!)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Topic
                                    </Button>
                                </div>
                                {unit.topics && unit.topics.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead className="w-[100px] text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {unit.topics.map(topic => (
                                                <TableRow key={topic.id || topic._id}>
                                                    <TableCell className="font-medium">{topic.title}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="ghost" size="icon" onClick={() => openEditTopic(topic)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setDeleteTarget({ type: 'topic', id: topic.id || topic._id! }); setDeleteConfirmOpen(true); }}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No topics in this unit.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Unit Dialog */}
            <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleUnitSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingUnit ? "Edit Unit" : "Create Unit"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Unit Number</label>
                                <Input
                                    type="number"
                                    value={unitFormData.unit_number}
                                    onChange={e => setUnitFormData({ ...unitFormData, unit_number: Number(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={unitFormData.title}
                                    onChange={e => setUnitFormData({ ...unitFormData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={unitFormData.description}
                                    onChange={e => setUnitFormData({ ...unitFormData, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setUnitDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Unit"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Topic Dialog */}
            <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <form onSubmit={handleTopicSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingTopic ? "Edit Topic" : "Create Topic"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={topicFormData.title}
                                    onChange={e => setTopicFormData({ ...topicFormData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Video URL (optional)</label>
                                <Input
                                    value={topicFormData.video_url}
                                    onChange={e => setTopicFormData({ ...topicFormData, video_url: e.target.value })}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Markdown Content</label>
                                <Textarea
                                    className="font-mono min-h-[200px]"
                                    value={topicFormData.content_markdown}
                                    onChange={e => setTopicFormData({ ...topicFormData, content_markdown: e.target.value })}
                                    placeholder="# Topic Content..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setTopicDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Topic"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete {deleteTarget?.type === 'unit' ? 'Unit' : 'Topic'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
