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
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { File, FileText, Loader2, Plus, Search, Video } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ResourceForm from "@/components/admin/ResourceForm";
import {
    deleteResource as deleteResourceById,
    fetchResources,
    type ResourceItem,
} from "@/services/resource-service";

export default function ResourceManagerPage() {
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);

    const loadResources = async () => {
        setLoading(true);
        try {
            const data = await fetchResources();
            setResources(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadResources();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        const success = await deleteResourceById(id);
        if (success) {
            setResources((prev) => prev.filter((r) => r._id !== id));
            toast.success("Resource deleted successfully");
        } else {
            toast.error("Failed to delete resource");
        }
    };

    const filtered = resources.filter((resource) =>
        [resource.title, resource.subject, resource.author]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "pdf":
                return <FileText className="h-4 w-4 text-red-500" />;
            case "video":
                return <Video className="h-4 w-4 text-blue-500" />;
            default:
                return <File className="h-4 w-4 text-muted-foreground" />;
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Resource Manager</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage and organize published study resources.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px] p-0 flex flex-col overflow-hidden max-h-[90vh]">
                        <ScrollArea className="max-h-[90vh] w-full p-6 sm:p-8">
                            <DialogHeader className="pb-2">
                                <DialogTitle className="text-2xl font-bold tracking-tight">Add New Resource</DialogTitle>
                            </DialogHeader>
                            <ResourceForm
                                onSuccess={() => {
                                    setDialogOpen(false);
                                    loadResources();
                                }}
                            />
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and count */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <InputGroup className="w-full md:w-64">
                    <InputGroupAddon>
                        <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        type="search"
                        placeholder="Search by title, subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </InputGroup>
                <div className="text-sm text-muted-foreground">
                    {resources.length} total resources
                </div>
            </div>

            {/* Resources table */}
            <div className="overflow-hidden rounded-lg border">
                <div className="overflow-x-auto">
                    <Table className="min-w-[820px]">
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[400px]">Resource Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-48 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-50" />
                                            <p>No resources found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((resource) => (
                                    <TableRow key={resource._id}>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-muted">
                                                    {getTypeIcon(resource.type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium">{resource.title}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{resource.subject}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{resource.type}</Badge>
                                        </TableCell>
                                        <TableCell>{resource.author}</TableCell>
                                        <TableCell>{resource.year}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(resource._id)}
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
        </div>
    );
}
