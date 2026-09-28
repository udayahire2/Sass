import { useEffect, useState } from "react";
import {
  Download,
  FileCode,
  FileText,
  Plus,
  Search,
  Trash2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogPopup,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import SyllabusForm from "@/components/admin/SyllabusForm";
import {
  deleteSyllabus,
  fetchSyllabus,
  type SyllabusItem,
} from "@/services/syllabus-service";

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
        prev.filter(
          (item) =>
            item.id !== selectedForDelete && item._id !== selectedForDelete
        )
      );
      toast.success("Syllabus item deleted successfully");
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
      (item.code && item.code.toLowerCase().includes(search.toLowerCase())) ||
      item.branch.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return (
          <Badge variant="error" size="sm" className="gap-1 font-sans">
            <FileText className="h-3 w-3 text-destructive" />
            <span>PDF</span>
          </Badge>
        );
      case "markdown":
        return (
          <Badge variant="info" size="sm" className="gap-1 font-sans">
            <FileCode className="h-3 w-3 text-info-foreground" />
            <span>Markdown</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm" className="gap-1 font-sans">
            <Download className="h-3 w-3 text-muted-foreground" />
            <span className="uppercase">{type}</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-primary" />
            <span>Syllabus Manager</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage course curriculum, semester subjects, and downloadable syllabus resources.
          </p>
        </div>

        {/* Add Syllabus Action Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="gap-2 shrink-0">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Syllabus</span>
            </Button>
          </DialogTrigger>
          <DialogPopup className="sm:max-w-[650px] p-0 flex flex-col overflow-hidden max-h-[90vh]">
            <ScrollArea className="max-h-[90vh] w-full p-4 sm:p-6">
              <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-bold tracking-tight">
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
          </DialogPopup>
        </Dialog>
      </div>

      {/* Main Coss UI Card Component */}
      <Card >
        <CardHeader >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Course Curriculum Overview</CardTitle>
              <CardDescription className="mt-0.5">
                Total {filtered.length} {filtered.length === 1 ? "course" : "courses"} listed in syllabus catalog
              </CardDescription>
            </div>

            {/* Filter Search InputGroup Component */}
            <InputGroup className="w-full md:w-72">
              <InputGroupAddon>
                <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search by code, title or branch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </div>
        </CardHeader>

        <CardPanel className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[110px] pl-6">Code</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Branch / Semester-Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-56 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Spinner className="h-7 w-7 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Loading syllabus data...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-72 p-0 text-center">
                      <Empty className="py-8">
                        <EmptyMedia variant="icon">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>No syllabus items found</EmptyTitle>
                          <EmptyDescription>
                            {search
                              ? `No course matching "${search}" was found.`
                              : "No syllabus items added yet. Click 'Add Syllabus' to create one."}
                          </EmptyDescription>
                        </EmptyHeader>
                        {search && (
                          <EmptyContent>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSearch("")}
                            >
                              Clear Filter
                            </Button>
                          </EmptyContent>
                        )}
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((item) => (
                    <TableRow key={item.id || item._id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="pl-6 font-mono">
                        <Badge variant="outline" size="sm" className="font-mono bg-muted/20">
                          {item.code || item.subjectCode || "BUNDLE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex flex-col">
                          <span className="font-semibold">{item.title}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge variant="secondary" size="sm">
                            {item.branch || item.program}
                          </Badge>
                          <Badge variant={item.syllabusType === 'program' ? 'info' : 'outline'} size="sm" className="text-[10px]">
                            {item.syllabusType === 'program' ? 'Program Bundle' : 'Subject'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.semester
                              ? `Sem ${item.semester}`
                              : item.year
                              ? `Year ${item.year}`
                              : "All Semesters"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(item.type)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(item.id || item._id || "")}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 h-8 px-2.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardPanel>
      </Card>

      {/* Delete Confirmation Coss UI AlertDialog Component */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogPopup className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Syllabus Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this syllabus item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogClose render={<Button variant="ghost" />}>
              Cancel
            </AlertDialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Item
            </Button>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  );
}

