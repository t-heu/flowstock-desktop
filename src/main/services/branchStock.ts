import { supabase } from "../supabaseClient";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { BranchStockItem } from "../../shared/types";

/**
 * 🔹 Buscar branchStock detalhado
 */
export const getBranchStock = async (): Promise<{
  success: boolean;
  data?: BranchStockItem[];
  error?: string;
}> => {
  try {
    await loadCache();

    const { data: rows, error } = await supabase
      .from("branch_stock")
      .select("*");

    if (error) throw error;

    const branchStock = (rows || []).map((item: any) => {
      const branch = getBranchFromCache(item.branch_id);
      const product = getProductFromCache(item.product_id);

      const createdAt = item.created_at
        ? new Date(item.created_at).toISOString()
        : undefined;

      const br: BranchStockItem = {
        branchId: item.branch_id, // ✅ corrigido
        branchName: branch?.name ?? "Desconhecida",
        productId: item.product_id, // ✅ corrigido
        productName: product?.name ?? "Sem nome",
        quantity: Number(item.quantity ?? 0),
        createdAt: createdAt ?? item.updated_at ?? null, // ✅ padronizado
      };

      return br;
    });

    return { success: true, data: branchStock };
  } catch (error) {
    console.error("Erro ao buscar branchStock detalhado:", error);
    throw new Error("Erro ao buscar branchStock");
  }
};

/*import { adminDb } from "../firebase";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { BranchStockItem } from "../../shared/types";

export const getBranchStock = async (): Promise<{
  success: boolean;
  data?: BranchStockItem[];
  error?: string;
}> => {
  try {
    await loadCache();

    const branchStockSnap = await adminDb.collection("branchStock").get();
    const branchStock = branchStockSnap.docs.map(d => d.data()) as any[];

    const detailedStock: BranchStockItem[] = branchStock.map(item => {
      const branch = getBranchFromCache(item.branchId);
      const product = getProductFromCache(item.productId);

      return {
        branchId: item.branchId,
        branchName: branch?.name ?? "Desconhecida",
        productId: item.productId,
        productName: product?.name ?? "Sem nome",
        quantity: item.quantity ?? 0,
        createdAt: item.createdAt?.toDate
          ? item.createdAt.toDate().toISOString()
          : item.createdAt,
      };
    });

    return { success: true, data: detailedStock };
  } catch (error) {
    console.error("Erro ao buscar branchStock detalhado:", error);
    throw new Error("Erro ao buscar branchStock");
  }
};
*/