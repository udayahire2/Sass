import { useEffect, useMemo, useState } from "react";
import { ExternalLink, File, FileText, Loader2, Search, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchResources, type ResourceCategory, type ResourceItem } from "@/services/resource-service";

type ResourceCollectionPageProps = {
  category: ResourceCategory;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

const getTypeIcon = (type: ResourceItem["type"]) => {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
  if (type === "video") return <Video className="h-4 w-4 text-blue-500" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

export default function ResourceCollectionPage({
  category,
  title,
  description,
  emptyTitle,
  emptyDescription,
}: ResourceCollectionPageProps) {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetchResources({ category })
      .then((items) => {
        if (mounted) setResources(items);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resources;

    return resources.filter((resource) =>
      [resource.title, resource.subject, resource.branch, resource.semester, resource.author]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [resources, search]);

  return (
    <div className="mx-auto w-full max-w-270 space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-col gap-5">
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-[13px] font-medium text-muted-foreground">
          <Badge variant="secondary" className="rounded-[6px] bg-primary/10 text-primary">
            Study Material
          </Badge>
        </nav>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="h-px w-full bg-border/40" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="w-full sm:max-w-sm">
          <InputGroupAddon>
            <Search aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search title, subject, branch..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </InputGroup>
        <p className="text-sm text-muted-foreground">{filtered.length} items</p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table className="min-w-190">
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-90">Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Branch / Semester</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-9 w-9 opacity-50" />
                      <p className="font-medium text-foreground">{emptyTitle}</p>
                      <p className="max-w-sm text-sm">{emptyDescription}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-muted p-2">
                          {getTypeIcon(resource.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium">{resource.title}</div>
                          <div className="line-clamp-1 text-xs text-muted-foreground">
                            {resource.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{resource.subject}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span>{resource.branch}</span>
                        <span className="text-xs text-muted-foreground">{resource.semester}</span>
                      </div>
                    </TableCell>
                    <TableCell>{resource.author}</TableCell>
                    <TableCell className="text-right">
                      <Button   size="sm" variant="outline">
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
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
