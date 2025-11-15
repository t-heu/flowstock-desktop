import { 
  loadCache, 
  getProductFromCache, 
  getBranchFromCache, 
  getBranchStockCache
} from "../cache";
import { BranchStockItem } from "../../shared/types";

export const getBranchStock = async (): Promise<{
  success: boolean;
  data?: BranchStockItem[];
  error?: string;
}> => {
  try {
    await loadCache(); // garante que produtos, branches e branch_stock estão carregados

    const rows = getBranchStockCache(); // ✅ agora pega da memória
    if (!rows) return { success: true, data: [] };

    const branchStock = rows.map((item: any) => {
      const branch = getBranchFromCache(item.branch_id);
      const product = getProductFromCache(item.product_id);

      const createdAt = item.created_at
        ? new Date(item.created_at).toISOString()
        : undefined;

      const br: BranchStockItem = {
        branchId: item.branch_id,
        branchName: branch?.name ?? "Desconhecida",
        productId: item.product_id,
        productName: product?.name ?? "Sem nome",
        quantity: Number(item.quantity ?? 0),
        createdAt: createdAt ?? item.updated_at ?? null,
      };

      return br;
    });

    return { success: true, data: branchStock };

  } catch (err: any) {
    console.error("Erro ao buscar branchStock detalhado:", err);
    return {
      success: false,
      error: err?.message || "Erro ao carregar estoque por filial"
    };
  }
};
