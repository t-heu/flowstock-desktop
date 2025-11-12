import { supabase } from "../supabaseClient";
import { Stats } from "../../shared/types";
import { loadCache, getAllProductsFromCache, getAllBranchesFromCache } from "../cache";

let statsCache: Record<string, Stats> = {};

export const getStats = async (user: any, branchFilter?: string): Promise<Stats> => {
  try {
    const cacheKey = `${user.role}-${user.department}-${branchFilter ?? "ALL"}`;
    if (statsCache[cacheKey]) return statsCache[cacheKey];

    // 🔹 Usa cache existente
    await loadCache();
    let products = getAllProductsFromCache();
    const branches = getAllBranchesFromCache();

    // 🔹 Carrega apenas o que depende de movimentação / estoque
    const [
      { data: movementsRows, error: movErr },
      { data: branchStockRows, error: stockErr }
    ] = await Promise.all([
      supabase.from("movements").select("*"),
      supabase.from("branch_stock").select("*"),
    ]);

    if (movErr || stockErr) {
      throw new Error("Erro ao carregar dados do Supabase");
    }

    let movements = movementsRows || [];
    let branchStock = branchStockRows || [];

    // 🔹 Se não for admin → filtra por departamento
    if (user.role !== "admin") {
      products = products.filter(p => p.department === user.department);
      const allowedProductIds = new Set(products.map(p => p.id));
      movements = movements.filter(m => allowedProductIds.has(m.product_id));
      branchStock = branchStock.filter(b => allowedProductIds.has(b.product_id));
    }

    // 🔹 Filtra filial
    if (branchFilter) {
      movements = movements.filter(m => m.branch_id === branchFilter);
      branchStock = branchStock.filter(b => b.branch_id === branchFilter);
    }

    const totalEntries = movements.filter(m => m.type === "entrada").length;
    const totalExits = movements.filter(m => m.type === "saida").length;
    const totalStock = branchStock.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

    const stats: Stats = {
      totalProducts: products.length,
      totalBranches: branches.length,
      totalEntries,
      totalExits,
      totalStock,
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
