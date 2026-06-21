import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
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
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Loader2, Plus, Search, BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    fetchSubjectsByBranchSemester,
    createSubject,
    deleteSubject,
    type Subject,
    BRANCHES,
    SEMESTERS
} from "@/services/api";

export default function SubjectManagerPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [branch, setBranch] = useState<string>("Computer");
    const [semester, setSemester] = useState<string>("3");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        code: "",
        credits: 0,
        description: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadSubjects = async () => {
        setLoading(true);
        try {
            const data = await fetchSubjectsByBranchSemester(branch, semester);
            setSubjects(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubjects();
    }, [branch, semester]);

    const handleDeleteConfirm = async () => {
        if (!selectedForDelete) return;
        try {
            await deleteSubject(selectedForDelete);
            setSubjects((prev) => prev.filter((item) => item.id !== selectedForDelete));
            toast.success("Subject deleted successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to delete subject");
        } finally {
            setDeleteConfirmOpen(false);
            setSelectedForDelete(null);
        }
    };

    const openDeleteDialog = (id: string) => {
        setSelectedForDelete(id);
        setDeleteConfirmOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createSubject({
                ...formData,
                branch,
                semester: Number(semester)
            });
            toast.success("Subject created successfully");
            setDialogOpen(false);
            setFormData({ title: "", code: "", credits: 0, description: "" });
            loadSubjects();
        } catch (error: any) {
            toast.error(error.message || "Failed to create subject");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filtered = subjects.filter(
        (item) =>
            item.title?.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Curriculum Manager</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage subjects, units, and topics for different branches and semesters.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-3">
                    <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {BRANCHES.map((b) => (
                                <SelectItem key={b} value={b}>
                                    {b}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {SEMESTERS.map((s) => (
                                <SelectItem key={s} value={s}>
                                    Semester {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex flex-1 items-center gap-4 justify-end">
                    <InputGroup className="w-full md:w-64">
                        <InputGroupAddon>
                            <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                            type="search"
                            placeholder="Search subjects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </InputGroup>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subject
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-125 p-3">
                            <form onSubmit={handleCreateSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Subject</DialogTitle>
                                    <DialogDescription>
                                        Creating subject for {branch} - Semester {semester}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <label htmlFor="code" className="text-sm font-medium">Subject Code</label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                                            required
                                            placeholder="e.g. CS401"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            required
                                            placeholder="e.g. Data Structures"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="credits" className="text-sm font-medium">Credits</label>
                                        <Input
                                            id="credits"
                                            type="number"
                                            value={formData.credits}
                                            onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label htmlFor="description" className="text-sm font-medium">Description</label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Subject description..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Create Subject
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table className="min-w-[760px]">
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[120px]">Code</TableHead>
                                <TableHead>Subject Title</TableHead>
                                <TableHead className="text-center">Units</TableHead>
                                <TableHead className="text-center">Topics</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Search className="text-muted-foreground" />
                                                </EmptyMedia>
                                                <EmptyTitle>No subjects found</EmptyTitle>
                                                <EmptyDescription>No subjects match your criteria for this branch and semester.</EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((item) => (
                                    <TableRow key={item.id || item._id}>
                                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                                        <TableCell className="font-medium">{item.title || item.name}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                                {item.unitCount || item.units?.length || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                                                {item.topicCount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button asChild variant="outline" size="sm" className="h-8">
                                                    <Link to={`/admin/subjects/${item.id}`}>
                                                        <BookOpen className="mr-2 h-4 w-4" />
                                                        Manage Content
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openDeleteDialog(item.id || item._id || "")}
                                                    className="h-8 text-destructive hover:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Subject</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this subject? All associated units and topics will also be deleted. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
