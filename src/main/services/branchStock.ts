import { supabase } from "../supabaseClient";
import { BranchStockItem } from "../../shared/types";
import { getBranchStockCache, setBranchStockCache } from "../cache";

/** 🔹 Listar branch_stock usando o mesmo padrão do getProducts */
export const getBranchStock = async () => {
  try {
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
        products!inner(name, description)
      `);

    if (error) throw error;

    // 3️⃣ Converte para BranchStockItem (formato único)
    const normalized: BranchStockItem[] = (data || []).map((raw: any) => ({
      branch_id: raw.branch_id,
      branch_name: raw.branches?.name ?? "Desconhecida",
      product_id: raw.product_id,
      product_name: raw.products?.name ?? "Sem nome",
      product_description: raw.products?.description ?? "-",
      quantity: Number(raw.quantity ?? 0),
    }));

    // 4️⃣ Salva no cache
    setBranchStockCache(normalized);

    return { success: true, data: normalized };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao carregar estoque por filial" };
  }
};
