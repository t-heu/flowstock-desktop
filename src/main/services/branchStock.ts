import { supabase } from "../supabaseClient";
import { BranchStockItem } from "../../shared/types";
import { getBranchStockCache, setBranchStockCache } from "../cache";

/** 🔹 Listar branch_stock usando o mesmo padrão do getProducts */
export const getBranchStock = async () => {
  try {
    // 1️⃣ Se já existe cache → usa ele
    const cache = getBranchStockCache();

    if (cache) {
      return { success: true, data: cache };
    }

    // 2️⃣ Não tem cache → busca do banco
    const { data, error } = await supabase
      .from("branch_stock")
      .select(`
        branch_id,
        product_id,
        quantity,
        branches!inner(name),
        products!inner(name)
      `);

    if (error) throw error;

    // 3️⃣ Converte para BranchStockItem (formato único)
    const normalized: BranchStockItem[] = (data || []).map((raw: any) => ({
      branchId: raw.branch_id,
      branchName: raw.branches?.name ?? "Desconhecida",
      productId: raw.product_id,
      productName: raw.products?.name ?? "Sem nome",
      quantity: Number(raw.quantity ?? 0),
    }));

    // 4️⃣ Salva no cache
    setBranchStockCache(normalized);

    return { success: true, data: normalized };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao carregar estoque por filial" };
  }
};
