import { adminDb } from "../firebase";
import { Stats } from "../../types";

// Cache em memória
let statsCache: Stats | null = null;

/**
 * 🔹 Buscar estatísticas com cache
 */
export const getStats = async (): Promise<Stats> => {
  try {
    // Se cache existir → retorna direto (rápido)
    if (statsCache !== null) {
      return statsCache;
    }

    // Buscar Firestore em paralelo
    const [productsSnap, branchesSnap, movementsSnap, branchStockSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("branches").get(),
      adminDb.collection("movements").get(),
      adminDb.collection("branchStock").get(),
    ]);

    const movements = movementsSnap.docs.map((d) => d.data());
    const branchStock = branchStockSnap.docs.map((d) => d.data() as { quantity: number });

    const totalEntries = movements.filter((m: any) => m.type === "entrada").length;
    const totalExits = movements.filter((m: any) => m.type === "saida").length;
    const totalStock = branchStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Calcula estatísticas
    statsCache = {
      totalProducts: productsSnap.size,
      totalStock,
      totalEntries,
      totalExits,
      totalBranches: branchesSnap.size,
    };

    return statsCache;

  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas");
  }
};

/**
 * 🔄 Chame isso sempre que algo mudar (product / movement / branch)
 */
export const invalidateStatsCache = () => {
  statsCache = null;
};
