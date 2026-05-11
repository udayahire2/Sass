import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Download, FileCode, FileText, Loader2, Plus, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import SyllabusForm from "@/components/admin/SyllabusForm";
import { deleteSyllabus, fetchSyllabus, type SyllabusItem } from "@/services/syllabus-service";

export default function SyllabusManagerPage() {
    const [syllabusList, setSyllabusList] = useState<SyllabusItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<string | null>(null);

    const loadSyllabus = async () => {
        setLoading(true);
        const data = await fetchSyllabus();
        setSyllabusList(data);
        setLoading(false);
    };

    useEffect(() => {
        loadSyllabus();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!selectedForDelete) return;
        const success = await deleteSyllabus(selectedForDelete);
        if (success) {
            setSyllabusList((prev) =>
                prev.filter((item) => item.id !== selectedForDelete && item._id !== selectedForDelete)
            );
            toast.success("Syllabus deleted successfully");
        } else {
            toast.error("Failed to delete syllabus item");
        }
        setDeleteConfirmOpen(false);
        setSelectedForDelete(null);
    };

    const openDeleteDialog = (id: string) => {
        setSelectedForDelete(id);
        setDeleteConfirmOpen(true);
    };

    const filtered = syllabusList.filter(
        (item) =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.code.toLowerCase().includes(search.toLowerCase())
    );

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "pdf":
                return <FileText className="h-4 w-4 text-red-500" />;
            case "markdown":
                return <FileCode className="h-4 w-4 text-blue-500" />;
            default:
                return <Download className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Syllabus Manager</h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Manage course curriculum and syllabus content.
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <InputGroup className="w-full md:w-64">
                    <InputGroupAddon>
                        <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        type="search"
                        placeholder="Search by title or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Syllabus
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px] p-0 flex flex-col overflow-hidden max-h-[90vh]">
                        <ScrollArea className="max-h-[90vh] w-full p-6 sm:p-8">
                            <DialogHeader className="pb-2">
                                <DialogTitle className="text-2xl font-bold tracking-tight">
                                    Add New Syllabus
                                </DialogTitle>
                            </DialogHeader>
                            <SyllabusForm
                                onSuccess={() => {
                                    setDialogOpen(false);
                                    loadSyllabus();
                                }}
                            />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table className="min-w-[760px]">
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[120px]">Code</TableHead>
                                <TableHead>Course Title</TableHead>
                                <TableHead>Branch / Semester-Year</TableHead>
                                <TableHead>Type</TableHead>
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
                                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-50" />
                                            <p>No syllabus found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((item) => (
                                    <TableRow key={item.id || item._id}>
                                        <TableCell className="font-mono text-sm">{item.code}</TableCell>
                                        <TableCell className="font-medium">{item.title}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span>{item.branch}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.semester
                                                        ? `Semester ${item.semester}`
                                                        : item.year
                                                            ? `Year ${item.year}`
                                                            : 'Not specified'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {getTypeIcon(item.type)}
                                                <span className="text-xs uppercase">{item.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openDeleteDialog(item.id || item._id || "")
                                                }
                                                className="text-destructive hover:text-destructive"
                                            >
                                                Delete
                                            </Button>
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
                        <DialogTitle>Delete Syllabus Item</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this syllabus item? This action
                            cannot be undone.
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
