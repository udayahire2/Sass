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

      <section className="space-y-6">
        {/* Header & Add Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit rounded-md bg-background/50 backdrop-blur-sm">
              Community uploads
            </Badge>
            <div>
              <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                Explore Resources
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Community submissions reviewed by admins.
              </p>
            </div>
          </div>
          {user && (
            <Button asChild className="w-full sm:w-auto shadow-sm" variant="default">
              <Link to="/dashboard/student/add-content">
                <UploadCloud className="h-4 w-4 mr-2" />
                Add Content
              </Link>
            </Button>
          )}
        </div>

        {!loadingUploads && materials.length > 0 && (
          <div className="flex flex-col gap-4 sticky top-0 z-10 bg-background/95 backdrop-blur-md py-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent">
            {/* Search & Branch Select (Optimized grid for mobile) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
              <InputGroup className="w-full shadow-sm">
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
                  className="text-base sm:text-sm" // 16px prevents iOS zoom on focus
                />
                {searchQuery && (
                  <InputGroupAddon align="inline-end">
                    <Button
                      onClick={() => setSearchQuery("")}
                      variant="ghost"
                      size="icon-xs"
                      className="h-7 w-7 rounded-md hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </InputGroupAddon>
                )}
              </InputGroup>

              <Select
                value={activeBranchFilter}
                onValueChange={(val) => val && setActiveBranchFilter(val)}
              >
                <SelectTrigger className="w-full shadow-sm text-base sm:text-sm bg-background">
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

            {/* Type Filters (Native mobile scroll feel) */}
            {types.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2 sm:pb-0 sm:mb-0 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <Button
                  variant={!activeTypeFilter ? "default" : "outline"}
                  size="sm"
                  className="shrink-0 snap-start rounded-full shadow-sm"
                  onClick={() => setActiveTypeFilter(null)}
                >
                  All
                </Button>
                {types.map((type) => (
                  <Button
                    key={type}
                    variant={activeTypeFilter === type ? "default" : "outline"}
                    size="sm"
                    className="shrink-0 snap-start rounded-full shadow-sm bg-background"
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
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-border/50 bg-muted/20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="group flex flex-col p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-lg sm:p-5"
                  >
                    {/* Top Section: Icon, Title, Bookmark */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 space-y-1 mt-0.5">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
                            {material.title}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">
                            {material.subject}
                          </p>
                        </div>
                      </div>
                      
                      {/* Mobile UX: Bookmark at top right for easy thumb access */}
                      {user && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-9 w-9 shrink-0 rounded-full transition-colors",
                            isBookmarked 
                              ? "bg-primary/10 text-primary hover:bg-primary/20" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          onClick={() => handleToggleBookmark(String(material.id || material._id))}
                        >
                          <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                        </Button>
                      )}
                    </div>

                    {/* Middle Section: Metadata */}
                    <div className="mt-4 flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="rounded-md text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 shrink-0"
                      >
                        {material.type}
                      </Badge>
                      <span className="text-muted-foreground text-xs">•</span>
                      <p className="truncate text-xs font-medium text-muted-foreground">
                        By {material.author}
                      </p>
                    </div>

                    {/* Bottom Section: Primary Action */}
                    {href && (
                      <div className="mt-5 pt-4 border-t border-border/40 mt-auto">
                        <Button 
                          asChild 
                          size="sm" 
                          variant="secondary" 
                          className="w-full group/btn sm:bg-transparent sm:hover:bg-muted"
                        >
                          <a href={href} target="_blank" rel="noreferrer">
                            Open Resource
                            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 text-muted-foreground" />
                          </a>
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 sm:flex-row">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(endIndex, filteredMaterials.length)}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{filteredMaterials.length}</span>
                </p>
                <Pagination className="mx-0 w-auto">
                  <PaginationContent className="gap-1 sm:gap-2">
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={cn(
                          "px-2 sm:px-4", // Smaller padding on mobile
                          currentPage === 1 && "pointer-events-none opacity-50 cursor-not-allowed"
                        )}
                      />
                    </PaginationItem>
                    
                    {/* Hide some numbers on very small screens to prevent overflow */}
                    <div className="hidden sm:flex gap-1">
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
                    </div>

                    {/* Mobile-only page indicator */}
                    <div className="sm:hidden flex items-center px-4 text-sm font-medium">
                      Page {currentPage} of {totalPages}
                    </div>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageChange(currentPage + 1);
                        }}
                        className={cn(
                           "px-2 sm:px-4",
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