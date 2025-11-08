import { adminDb } from "../firebase";
import { Stats } from "../../types";
import { getCurrentUser } from "../authSession";

let statsCache: Record<string, Stats> = {};

/**
 * 🔹 Buscar estatísticas com suporte a:
 * - Filtrar por departamento (se não for admin)
 * - Filtrar por filial (opcional)
 */
export const getStats = async (branchFilter?: string): Promise<Stats> => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("Não autenticado");

    // Chave do cache (admin pode ver todas, user só seu dep)
    const cacheKey = `${user.role}-${user.department}-${branchFilter ?? "ALL"}`;
    if (statsCache[cacheKey]) return statsCache[cacheKey];

    // 1) Carrega tudo como antes (sem filtro no Firestore)
    const [productsSnap, branchesSnap, movementsSnap, branchStockSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("branches").get(),
      adminDb.collection("movements").get(),
      adminDb.collection("branchStock").get(),
    ]);

    let products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    let movements = movementsSnap.docs.map((d) => d.data() as any);
    let branchStock = branchStockSnap.docs.map((d) => d.data() as any);

    // 2) Se user não é admin → filtra por departamento
    if (user.role !== "admin") {
      products = products.filter(p => p.department === user.department);
      const allowedProductIds = new Set(products.map(p => p.id));

      movements = movements.filter(m => allowedProductIds.has(m.productId));
      branchStock = branchStock.filter(b => allowedProductIds.has(b.productId));
    }

    // 3) Se escolheu filial → filtra branchStock e movimentos
    if (branchFilter) {
      branchStock = branchStock.filter(b => b.branchId === branchFilter);
      movements = movements.filter(m => m.branchId === branchFilter);
    }

    // 4) Calcula estatísticas corretamente
    const totalEntries = movements.filter((m) => m.type === "entrada").length;
    const totalExits = movements.filter((m) => m.type === "saida").length;
    const totalStock = branchStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const stats: Stats = {
      totalProducts: products.length,
      totalStock,
      totalEntries,
      totalExits,
      totalBranches: branchesSnap.size,
    };

    statsCache[cacheKey] = stats;
    return stats;
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas");
  }
};

export const invalidateStatsCache = () => {
  statsCache = {};
};
