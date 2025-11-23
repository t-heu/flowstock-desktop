import useSWR from "swr";
import { useToast } from "../context/ToastProvider";

export function useMovements(type: "entrada" | "saida") {
  const { showToast } = useToast();

  const fetchMovements = async () => {
    try {
      const res = await window.api.getMovements(type);
      if (!res.success) {
        showToast(res.error || `Erro ao carregar ${type}s`, "error");
        return [];
      }
      return res.data || [];
    } catch (error: any) {
      console.error(error);
      showToast(error?.message || "Erro desconhecido", "error");
      return [];
    }
  };

  const { data: movements = [], error, mutate } = useSWR(
    ["movements", type],
    fetchMovements,
    { revalidateOnFocus: false }
  );

  return {
    movements,
    loadMovements: mutate, // função para recarregar manualmente
    loading: !movements && !error,
  };
}
