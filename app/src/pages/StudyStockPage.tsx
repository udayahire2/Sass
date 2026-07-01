import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  ExternalLink,
  FileText,
  Loader2,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildAssetUrl, BRANCHES } from "@/services/api";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/study-materials/layout/PageContainer";
import { PageHeader } from "@/components/study-materials/layout/PageHeader";
import { EmptyState } from "@/components/study-materials/layout/EmptyState";
import { useStudyStock } from "@/hooks/use-study-stock";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function StudyStockPage() {
  const {
    materials,
    filteredMaterials,
    loadingUploads,
    bookmarkedIds,
    handleToggleBookmark,
    types,
    searchQuery,
    setSearchQuery,
    activeTypeFilter,
    setActiveTypeFilter,
    activeBranchFilter,
    setActiveBranchFilter,
    user
  } = useStudyStock();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset to first page when any filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTypeFilter, activeBranchFilter]);

  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("ellipsis");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      let adjustedStart = start;
      let adjustedEnd = end;
      
      if (currentPage <= 3) {
        adjustedEnd = 4;
      } else if (currentPage >= totalPages - 2) {
        adjustedStart = totalPages - 3;
      }
      
      for (let i = adjustedStart; i <= adjustedEnd; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Study Stock" 
        description="A dedicated repository for student and faculty uploaded study materials. Discover notes, guides, and community-driven content."
      />

      <section className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit rounded-md">
              Community uploads
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Explore Resources
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Community submissions reviewed by admins.
              </p>
            </div>
          </div>
          {user && (
            <Button variant="outline">
                <UploadCloud className="h-4 w-4 mr-2" />
              <Link to="/dashboard/student/add-content">
                Add Content
              </Link>
            </Button>
          )}
        </div>

        {!loadingUploads && materials.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <InputGroup className="w-full sm:max-w-sm">
              <InputGroupAddon>
                <Search
                  aria-hidden="true"
                  className="h-4 w-4 text-muted-foreground"
                />
              </InputGroupAddon>
              <InputGroupInput
                type="search"
                placeholder="Search uploads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <InputGroupAddon align="inline-end">
                  <Button
                    onClick={() => setSearchQuery("")}
                    variant="ghost"
                    size="icon-xs"
                    className="h-6 w-6 rounded-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>

            <div className="w-full sm:w-44 shrink-0">
              <Select
                value={activeBranchFilter}
                onValueChange={(val) => val && setActiveBranchFilter(val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Branches">All Branches</SelectItem>
                  {BRANCHES.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {types.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Button
                  variant={!activeTypeFilter ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  onClick={() => setActiveTypeFilter(null)}
                >
                  All
                </Button>
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={activeTypeFilter === type ? "default" : "outline"}
                    size="sm"
                    className="shrink-0"
                    onClick={() =>
                      setActiveTypeFilter(activeTypeFilter === type ? null : type)
                    }
                  >
                    {type}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {loadingUploads ? (
          <div className="flex min-h-50 items-center justify-center rounded-xl border border-border/50">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : materials.length === 0 ? (
          <EmptyState 
            title="No uploads found"
            description="Be the first to submit useful study material."
            icon={FileText}
          />
        ) : filteredMaterials.length === 0 ? (
           <EmptyState 
            title="No matching results"
            description="Try adjusting your search terms or filters."
            icon={Search}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {paginatedMaterials.map((material) => {
                const href =
                  material.url ||
                  (material.filePath
                    ? buildAssetUrl(material.filePath, {
                        studyMaterialId: material.id || material._id,
                      })
                    : "");
                
                const isBookmarked = bookmarkedIds.has(String(material.id || material._id));

                return (
                  <Card
                    key={material._id || material.id}
                    className="group p-4 transition-all duration-200 hover:border-primary/30 hover:bg-background hover:shadow-md flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 flex-1">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/40 bg-primary/8 text-primary transition-colors group-hover:bg-primary/15">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <h3 className="truncate text-sm font-semibold text-foreground">
                            {material.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {material.subject}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-lg text-xs shrink-0"
                      >
                        {material.type}
                      </Badge>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border/30 pt-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Uploaded by {material.author}
                      </p>
                      <div className="flex items-center gap-2">
                        {user && (
                          <Button
                            variant={isBookmarked ? "default" : "ghost"}
                            size="icon"
                            className={cn(
                              "rounded-xl h-9 w-9",
                              isBookmarked ? "bg-primary text-primary-foreground" : "",
                            )}
                            onClick={() => handleToggleBookmark(String(material.id || material._id))}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        )}
                        {href && (
                          <Button size="sm" variant="outline">
                              <ExternalLink className="ml-2 h-3.5 w-3.5" />
                            <a href={href} target="_blank" rel="noreferrer">
                              Open
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(endIndex, filteredMaterials.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{filteredMaterials.length}</span> resources
                </p>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={cn(
                          currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed"
                        )}
                      />
                    </PaginationItem>
                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={cn(
                          currentPage === totalPages && "pointer-events-none opacity-50 cursor-not-allowed"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
