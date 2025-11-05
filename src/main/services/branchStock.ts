import { adminDb } from "../firebase"; // ajuste conforme o caminho do seu firebase client

export interface BranchStockItem {
  branchId: string;
  branchName?: string;
  productId: string;
  productName?: string;
  quantity: number;
  createdAt?: string;
}

/**
 * 🔹 Buscar o estoque detalhado das filiais (branchStock)
 */
export const getBranchStock = async (): Promise<{
  ok: boolean;
  data?: BranchStockItem[];
  error?: string;
}> => {
  try {
    // Buscar coleções em paralelo
    const [branchStockSnap, branchesSnap, productsSnap] = await Promise.all([
      adminDb.collection("branchStock").get(),
      adminDb.collection("branches").get(),
      adminDb.collection("products").get(),
    ]);

    // Mapear resultados
    const branchStock = branchStockSnap.docs.map((d) => d.data()) as any[];
    const branches = branchesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
    const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

    // Enriquecer dados
    const detailedStock: BranchStockItem[] = branchStock.map((item) => {
      const branch = branches.find((b) => b.id === item.branchId);
      const product = products.find((p) => p.id === item.productId);

      return {
        branchId: item.branchId,
        branchName: branch?.name || "Desconhecida",
        productId: item.productId,
        productName: product?.name || "Sem nome",
        quantity: item.quantity || 0,
        createdAt: item.createdAt || null,
      };
    });

    return { ok: true, data: detailedStock };
  } catch (error) {
    console.error("Erro ao buscar branchStock detalhado:", error);
    return { ok: false, error: "Erro ao buscar branchStock detalhado" };
  }
};
