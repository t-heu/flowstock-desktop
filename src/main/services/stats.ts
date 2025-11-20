import { supabase } from "../supabaseClient";
import { Stats } from "../../shared/types";
import { 
  getStatsCache,
  setStatsCache
} from "../cache";

export const getStats = async (user, branchFilter?) => {
  try {
    const cacheKey = `stats-${user.role}-${user.department}-${branchFilter ?? "ALL"}`;
    const cached = getStatsCache(cacheKey);
    if (cached) return { success: true, data: cached };

    const dept = user.role !== "admin" ? user.department : undefined;
    const branch = branchFilter !== "ALL" ? branchFilter : undefined;

    // PRODUCTS COUNT
    let query_products = supabase
      .from("products")
      .select("*", { count: "exact", head: true });

      // se tiver departamento → filtra
      if (dept) {
        query_products = query_products.eq("department", dept);
      }

    const { count: prodCount, error: prodErr } = await query_products;

    if (prodErr) return { success: false, data: prodErr };

    // BRANCHES COUNT
    const { count: branchCount, error: branchErr } = await supabase
      .from("branches")
      .select("*", { count: "exact", head: true });

    if (branchErr) return { success: false, data: branchErr };

    // ENTRIES COUNT
    const { count: entriesCount } = await supabase
      .from("movements")
      .select("*", { count: "exact", head: true })
      .eq("type", "entrada")
      .match({
        ...(dept ? { product_department: dept } : {}),
        ...(branch ? { branch_id: branch } : {})
      });

    // EXITS COUNT
    const { count: exitsCount } = await supabase
      .from("movements")
      .select("*", { count: "exact", head: true })
      .eq("type", "saida")
      .match({
        ...(dept ? { product_department: dept } : {}),
        ...(branch ? { branch_id: branch } : {})
      });

    // STOCK SUM
    let query = supabase
      .from("branch_stock")
      .select(`
        quantity,
        branch_id,
        products!inner (department)
      `);

    // Filtrar por filial, se existir
    if (branch) {
      query = query.eq("branch_id", branch);
    }

    // Filtrar por departamento, se existir
    if (dept) {
      query = query.eq("products.department", dept);
    }

    const { data, error } = await query;
    if (error) throw error;

    const totalStock = (data ?? []).reduce(
      (sum, row) => sum + Number(row.quantity),
      0
    );

    const stats: Stats = {
      totalProducts: prodCount ?? 0,
      totalBranches: branchCount ?? 0,
      totalEntries: entriesCount ?? 0,
      totalExits: exitsCount ?? 0,
      totalStock,
    };

    setStatsCache(cacheKey, stats);

    return { success: true, data: stats };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};
