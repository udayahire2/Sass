import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalAuth } from "@/hooks/use-local-auth";
import {
  fetchApprovedMaterials,
  fetchBookmarkedMaterials,
  toggleBookmark,
  type StudyMaterial,
} from "@/services/study-service";

export function useStudyStock() {
  const { user } = useLocalAuth();
  const [approvedUploads, setApprovedUploads] = useState<StudyMaterial[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);
  const [activeBranchFilter, setActiveBranchFilter] = useState<string>("All Branches");

  // Fetch approved materials
  useEffect(() => {
    let mounted = true;
    setLoadingUploads(true);
    fetchApprovedMaterials()
      .then((materials) => {
        if (mounted) setApprovedUploads(materials);
      })
      .catch((error) => {
        console.error("Failed to fetch approved uploads", error);
      })
      .finally(() => {
        if (mounted) setLoadingUploads(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    if (user) {
      let mounted = true;
      fetchBookmarkedMaterials()
        .then((materials) => {
          if (mounted) {
            const ids = new Set(materials.map((m) => String(m.id || m._id)));
            setBookmarkedIds(ids);
          }
        })
        .catch(console.error);
      return () => {
        mounted = false;
      };
    } else {
      setBookmarkedIds(new Set());
    }
  }, [user]);

  // Toggle bookmark handler
  const handleToggleBookmark = useCallback(async (materialId: string) => {
    if (!user) return;
    try {
      const result = await toggleBookmark(materialId);
      if (result.success) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (result.bookmarked) next.add(materialId);
          else next.delete(materialId);
          return next;
        });
      }
    } catch (error) {
      console.error("Failed to toggle bookmark", error);
    }
  }, [user]);

  // Available types based on fetched materials
  const types = useMemo(() => {
    const set = new Set(approvedUploads.map((m) => m.type));
    return Array.from(set).sort();
  }, [approvedUploads]);

  // Efficiently filtered materials
  const filteredMaterials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    return approvedUploads.filter((m) => {
      // 1. Check type filter
      if (activeTypeFilter && m.type !== activeTypeFilter) return false;
      
      // 2. Check branch filter
      const isMissingBranch = m.branch === null || m.branch === undefined;
      const matchesBranch =
        activeBranchFilter === "All Branches" ||
        m.branch === activeBranchFilter ||
        (isMissingBranch && activeBranchFilter === "All Branches");
      if (!matchesBranch) return false;
      
      // 3. Check search query (done last as string operations are more expensive)
      if (query) {
        return (
          m.title.toLowerCase().includes(query) ||
          m.subject.toLowerCase().includes(query) ||
          m.author.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [approvedUploads, searchQuery, activeTypeFilter, activeBranchFilter]);

  return {
    materials: approvedUploads,
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
  };
}
