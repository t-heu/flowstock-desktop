import { supabase } from "../supabaseClient";
import { Stats } from "../../shared/types";
import { 
  getAllProductsFromCache, 
  setProductsCache, 
  getAllBranchesFromCache, 
  setBranchesCache,
  getStatsCache,
  setStatsCache
} from "../cache";

export const getStats = async (
  user: any, 
  branchFilter?: string
): Promise<{ success: boolean; data?: Stats; error?: any }> => {
  try {
    const cacheKey = `${user.role}-${user.department}-${branchFilter ?? "ALL"}`;

    // 🔹 Tenta cache via função
    const cachedStats = getStatsCache(cacheKey);
    if (cachedStats) return { success: true, data: cachedStats };

    // 🔹 Busca produtos e filiais do DB se cache vazio
    let products = getAllProductsFromCache();
    if (!products) {
      const { data: productData, error: prodErr } = await supabase.from("products").select("*");
      if (prodErr) throw prodErr;
      products = productData || [];
      setProductsCache(products);
    }

    let branches = getAllBranchesFromCache();
    if (!branches) {
      const { data: branchData, error: branchErr } = await supabase.from("branches").select("*");
      if (branchErr) throw branchErr;
      branches = branchData || [];
      setBranchesCache(branches);
    }

    // 🔹 Movements e branch_stock
    const [{ data: movementsRows, error: movErr }, { data: branchStockRows, error: stockErr }] = await Promise.all([
      supabase.from("movements").select("*"),
      supabase.from("branch_stock").select("*"),
    ]);
    if (movErr || stockErr) throw new Error("Erro ao carregar dados do Supabase");

    let movements = movementsRows || [];
    let branchStock = branchStockRows || [];

    // 🔹 Filtra por departamento se não for admin
    if (user.role !== "admin") {
      products = products.filter(p => p.department === user.department);
      const allowedIds = new Set(products.map(p => p.id));
      movements = movements.filter(m => allowedIds.has(m.product_id));
      branchStock = branchStock.filter(b => allowedIds.has(b.product_id));
    }

    // 🔹 Filtra por filial se especificado
    if (branchFilter && branchFilter !== "ALL") {
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

    // 🔹 Salva cache via função
    setStatsCache(cacheKey, stats);

    return { success: true, data: stats };
  } catch (err: any) {
    console.error("Erro ao buscar estatísticas:", err);
    return { success: false, error: err?.message || "Erro ao buscar estatísticas" };
  }
};
