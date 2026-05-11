import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

// COSS UI Components (assumed from a system like shadcn/ui)
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownPreview from "@/components/ui/markdown-preview";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { fetchSyllabus, type SyllabusItem } from "@/services/syllabus-service";
import { buildAssetUrl } from "@/services/api";

export default function SyllabusPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const [viewItem, setViewItem] = useState<SyllabusItem | null>(null);

  const loadSyllabus = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSyllabus();
      setSyllabus(data);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load syllabus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSyllabus();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const branchOptions = useMemo(
    () => ["All", ...Array.from(new Set(syllabus.map((item) => item.branch))).sort()],
    [syllabus],
  );

  const termOptions = useMemo(
    () => [
      { label: "All semesters and years", value: "All" },
      ...Array.from(new Set(syllabus.map((item) => item.semester).filter(Boolean)))
        .sort((a, b) => Number(a) - Number(b))
        .map((semester) => ({ label: `Semester ${semester}`, value: `semester:${semester}` })),
      ...Array.from(new Set(syllabus.map((item) => item.year).filter(Boolean)))
        .sort((a, b) => Number(a) - Number(b))
        .map((year) => ({ label: `Year ${year}`, value: `year:${year}` })),
    ],
    [syllabus],
  );

  const filteredSyllabus = syllabus.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query);
    const matchesBranch = selectedBranch === "All" || item.branch === selectedBranch;
    const matchesTerm =
      selectedTerm === "All" ||
      (selectedTerm.startsWith("semester:") && item.semester === selectedTerm.replace("semester:", "")) ||
      (selectedTerm.startsWith("year:") && item.year === selectedTerm.replace("year:", ""));

    return matchesSearch && matchesBranch && matchesTerm;
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const next = new URLSearchParams(searchParams);
    if (value.trim()) {
      next.set("search", value);
    } else {
      next.delete("search");
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSelectedBranch("All");
    setSelectedTerm("All");
    handleSearchChange("");
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedBranch !== "All" || selectedTerm !== "All";

  return (
    <div className="space-y-8 pb-14 pt-8">
      {/* Header Section */}
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Syllabus</Badge>
          <Badge variant="secondary">Student reference</Badge>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Search syllabus quickly
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Search by subject or code, then open the correct syllabus in one step.
          </p>
        </div>
      </header>

      {/* Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_190px_auto]">
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search by subject or code"
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
              />
            </InputGroup>

            <Select value={selectedBranch} onValueChange={(val) => val && setSelectedBranch(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch === "All" ? "All branches" : branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={(val) => val && setSelectedTerm(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester or year" />
              </SelectTrigger>
              <SelectContent>
                {termOptions.map((term) => (
                  <SelectItem key={term.value} value={term.value}>
                    {term.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            ) : (
              <div className="hidden lg:block" />
            )}
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            {loading ? (
              <Skeleton className="h-5 w-32" />
            ) : (
              `${filteredSyllabus.length} result${filteredSyllabus.length === 1 ? "" : "s"} found`
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="flex flex-col items-center py-12">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading syllabus...</p>
        </Card>
      )}

      {/* Error State */}
      {!loading && error && (
        <Card className="flex flex-col items-center py-12 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
          <CardHeader>
            <CardTitle>Unable to load syllabus</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <Button variant="outline" onClick={loadSyllabus} className="mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </Card>
      )}

      {/* Results List */}
      {!loading && !error && (
        <Card>
          <CardContent className="p-0">
            {filteredSyllabus.length > 0 ? (
              filteredSyllabus.map((item) => (
                <div
                  key={item._id || item.code}
                  className="flex flex-col gap-4 border-b border-border p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{item.code}</Badge>
                      <Badge variant="secondary">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">{item.credits} credits</span>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">{item.title}</h2>
                      <p className="text-sm text-muted-foreground">
                        {item.branch} · {formatSyllabusTerm(item)}
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" onClick={() => setViewItem(item)}>
                    {item.type === "markdown" ? "Open content" : "Open file"}
                  </Button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <div>
                  <h2 className="text-lg font-semibold">No syllabus items found</h2>
                  <p className="text-sm text-muted-foreground">
                    Try a different subject name, code, or filter.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
          </DialogHeader>

          {viewItem && (
            <div className="space-y-6 py-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Course code" value={viewItem.code} />
                <InfoCard label="Credits" value={String(viewItem.credits)} />
                <InfoCard label="Branch" value={viewItem.branch} />
                <InfoCard label="Semester / Year" value={formatSyllabusTerm(viewItem)} />
              </div>

              <Separator />

              {viewItem.type === "markdown" ? (
                <MarkdownPreview
                  content={viewItem.contentUrl}
                  className="max-h-[60vh] overflow-auto rounded-md border bg-background p-4"
                />
              ) : (
                <Card className="text-center">
                  <CardContent className="flex flex-col items-center py-8">
                    <FileText className="mb-3 h-8 w-8 text-primary" />
                    <CardTitle className="mb-1">Open syllabus document</CardTitle>
                    <CardDescription className="mb-4">
                      This syllabus item is stored as a file.
                    </CardDescription>
                    <Button asChild>
                      <a
                        href={buildAssetUrl(viewItem.contentUrl, { syllabusId: viewItem.id || viewItem._id })}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline">Open Syllabus</Button>
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatSyllabusTerm(item: SyllabusItem) {
  if (item.semester) return `Semester ${item.semester}`;
  if (item.year) return `Year ${item.year}`;
  return "Not specified";
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
