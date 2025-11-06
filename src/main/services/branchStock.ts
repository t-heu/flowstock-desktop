import { adminDb } from "../firebase";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { BranchStockItem, Product, Branch } from "../../types"; // ajuste o caminho

export const getBranchStock = async (): Promise<{
  ok: boolean;
  data?: BranchStockItem[];
  error?: string;
}> => {
  try {
    // 🔹 Garantir que cache está carregada
    await loadCache();

    // 🔹 Buscar somente branchStock
    const branchStockSnap = await adminDb.collection("branchStock").get();
    const branchStock = branchStockSnap.docs.map(d => d.data()) as any[];

    // 🔹 Enriquecer com cache
    const detailedStock: BranchStockItem[] = branchStock.map(item => {
      const branch: Branch | null = getBranchFromCache(item.branchId);
      const product: Product | null = getProductFromCache(item.productId);

      return {
        branchId: item.branchId,
        branchName: branch?.name ?? "Desconhecida",
        productId: item.productId,
        productName: product?.name ?? "Sem nome",
        quantity: item.quantity ?? 0,
        createdAt: item.createdAt
          ? (item.createdAt.toDate ? item.createdAt.toDate().toISOString() : item.createdAt)
          : undefined,
      };
    });
    
    return { ok: true, data: detailedStock };
  } catch (error) {
    console.error("Erro ao buscar branchStock detalhado:", error);
    return { ok: false, error: "Erro ao buscar branchStock detalhado" };
  }
};
