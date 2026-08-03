import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  File,
  FileText,
  Loader2,
  Search,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Frame } from "@/components/ui/frame";
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
import {
  fetchResources,
  type ResourceCategory,
  type ResourceItem,
} from "@/services/resource-service";
import { PageContainer } from "./layout/PageContainer";
import { PageHeader } from "./layout/PageHeader";
import { EmptyState } from "./layout/EmptyState";

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
    setLoading(true);
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

    return resources.filter((resource) => {
      return (
        resource.title.toLowerCase().includes(query) ||
        resource.subject.toLowerCase().includes(query) ||
        (resource.branch && resource.branch.toLowerCase().includes(query)) ||
        (resource.semester &&
          resource.semester.toLowerCase().includes(query)) ||
        resource.author.toLowerCase().includes(query)
      );
    });
  }, [resources, search]);

  return (
    <PageContainer>
      <PageHeader
        title={title}
        description={description}
        badge={
          <Badge
            variant="secondary"
            className="rounded-[6px] bg-primary/10 text-primary"
          >
            Study Material
          </Badge>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <InputGroup className="w-full shadow-sm sm:max-w-sm">
          <InputGroupAddon>
            <Search
              aria-hidden="true"
              className="h-4 w-4 text-muted-foreground"
            />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            placeholder="Search title, subject, branch..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="text-base sm:text-sm" // Prevents iOS input zoom
          />
        </InputGroup>
        <p className="text-sm font-medium text-muted-foreground hidden sm:block">
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border/50 bg-muted/20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          icon={FileText}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching results"
          description="Try adjusting your search query."
          icon={Search}
        />
      ) : (
        <>
          {/* MOBILE VIEW: Card Grid (Visible < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
            {filtered.map((resource) => (
              <div 
                key={resource._id} 
                className="flex flex-col rounded-xl border border-border/50 bg-background p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/50 border border-border/50">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="line-clamp-2 text-sm font-semibold text-foreground leading-tight">
                      {resource.title}
                    </h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {resource.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-muted-foreground mb-0.5">Subject</span>
                    <span className="font-medium text-foreground truncate block">{resource.subject}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground mb-0.5">Branch/Sem</span>
                    <span className="font-medium text-foreground truncate block">
                      {resource.branch || "—"} {resource.semester ? `• ${resource.semester}` : ""}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground truncate">
                    By {resource.author}
                  </span>
                  <Button asChild size="sm" className="shrink-0 rounded-lg">
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      Open <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Data Table (Visible >= 768px) */}
          <div className="hidden md:block">
            <Frame className="w-full overflow-hidden">
              <Table variant="card" className="min-w-[600px]">
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="w-[35%]">Title</TableHead>
                    <TableHead className="w-[20%]">Subject</TableHead>
                    <TableHead className="w-[20%]">Branch / Sem</TableHead>
                    <TableHead className="w-[15%]">Author</TableHead>
                    <TableHead className="w-[10%] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((resource) => (
                    <TableRow key={resource._id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted/50 border border-border/50 transition-colors group-hover:bg-background">
                            {getTypeIcon(resource.type)}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-foreground">
                              {resource.title}
                            </div>
                            <div className="line-clamp-1 text-xs text-muted-foreground mt-0.5">
                              {resource.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground/80">
                        {resource.subject}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground/80">{resource.branch || "—"}</span>
                          <span className="text-xs text-muted-foreground">
                            {resource.semester || ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {resource.author}
                      </TableCell>
                      <TableCell className="text-right">
                        {/* asChild is used here to prevent invalid HTML (button wrapping an anchor) */}
                        <Button asChild size="sm" variant="secondary" className="transition-all hover:bg-primary hover:text-primary-foreground">
                          <a href={resource.url} target="_blank" rel="noreferrer">
                            Open <ExternalLink className="ml-2 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Frame>
          </div>
        </>
      )}
    </PageContainer>
  );
}