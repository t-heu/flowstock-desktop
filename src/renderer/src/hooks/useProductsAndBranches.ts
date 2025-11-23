import useSWR from "swr";

import { useToast } from "../context/ToastProvider";

export function useProductsAndBranches() {
  const { showToast } = useToast();

  const fetchProducts = async () => {
    try {
      const res = await window.api.getProducts();
      if (!res.success) {
        showToast(res.error || "Erro ao carregar produtos", "error");
        return [];
      }
      return res.data || [];
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || "Erro desconhecido ao carregar produtos", "error");
      return [];
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await window.api.getBranches();
      if (!res.success) {
        showToast(res.error || "Erro ao carregar filiais", "error");
        return [];
      }
      return res.data || [];
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || "Erro desconhecido ao carregar filiais", "error");
      return [];
    }
  };

  const { data: products = [], error: productsError, mutate: mutateProducts } = useSWR(
    "products",
    fetchProducts,
    { revalidateOnFocus: false }
  );

  const { data: branches = [], error: branchesError, mutate: mutateBranches } = useSWR(
    "branches",
    fetchBranches,
    { revalidateOnFocus: false }
  );

  return {
    products,
    branches,
    loading: (!products && !productsError) || (!branches && !branchesError),
    refresh: () => {
      mutateProducts();
      mutateBranches();
    },
  };
}
