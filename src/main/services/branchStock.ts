import { adminDb } from "../firebase";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { BranchStockItem } from "../../types";

export const getBranchStock = async (): Promise<{
  ok: boolean;
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

    return { ok: true, data: detailedStock };
  } catch (error) {
    console.error("Erro ao buscar branchStock detalhado:", error);
    throw new Error("Erro ao buscar branchStock");
  }
};
