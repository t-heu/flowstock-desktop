import useSWR from "swr";

import { useToast } from "../context/ToastProvider";
import { BranchStockItem } from "../../../shared/types";

export function useStock() {
  const { showToast } = useToast();

  const fetchBranchStock = async () => {
    const res = await window.api.getStock();
    if (!res.success) {
      showToast(res.error || "Falha ao carregar estoque", "error")
      return
    };
    return res.data;
  };

  const { data, error, isLoading, mutate } = useSWR<BranchStockItem[]>(
    "branch-stock",
    fetchBranchStock,
    { revalidateOnFocus: false }
  );

  return {
    branchStock: data || [],
    loading: isLoading,
    error,
    refresh: mutate, // para recarregar manualmente
  };
}
