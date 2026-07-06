import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApprovedMaterials, fetchPendingMaterials, updateMaterialStatus } from "@/services/study-service";
import { buildApiUrl, parseApiData } from "@/services/api";

export function useAdminDashboard() {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(buildApiUrl("/admin/stats"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return parseApiData(data, null);
    },
  });

  const pendingQuery = useQuery({
    queryKey: ["admin", "materials", "pending"],
    queryFn: fetchPendingMaterials, // Ideally this should accept pagination params!
  });

  const approvedQuery = useQuery({
    queryKey: ["admin", "materials", "approved"],
    queryFn: fetchApprovedMaterials,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) => 
      updateMaterialStatus(id, status),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data, or use onMutate for optimistic updates
      queryClient.invalidateQueries({ queryKey: ["admin", "materials"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  return {
    stats: statsQuery.data,
    pendingMaterials: pendingQuery.data ?? [],
    approvedMaterials: approvedQuery.data ?? [],
    isLoading: statsQuery.isLoading || pendingQuery.isLoading || approvedQuery.isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}