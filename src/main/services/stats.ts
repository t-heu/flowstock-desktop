import { adminDb } from "../firebase"; // sua instância do Firestore client-side

export interface Stats {
  totalProducts: number;
  totalStock: number;
  totalEntries: number;
  totalExits: number;
  totalBranches: number;
}

// 🔹 Buscar estatísticas diretamente do Firestore
export const getStats = async (): Promise<Stats> => {
  try {
    const [productsSnap, branchesSnap, movementsSnap, branchStockSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("branches").get(),
      adminDb.collection("movements").get(),
      adminDb.collection("branchStock").get(),
    ]);

    const products = productsSnap.docs.map((d) => d.data());
    const movements = movementsSnap.docs.map((d) => d.data());
    const branchStock = branchStockSnap.docs.map((d) => d.data() as { quantity: number });

    const totalEntries = movements.filter((m: any) => m.type === "entrada").length;
    const totalExits = movements.filter((m: any) => m.type === "saida").length;
    const totalStock = branchStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
      totalProducts: products.length,
      totalStock,
      totalEntries,
      totalExits,
      totalBranches: branchesSnap.size,
    };
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas");
  }
};
