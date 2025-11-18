import { supabase } from "../supabaseClient";
import { BranchStockItem } from "../../shared/types";
import { getBranchStockCache, setBranchStockCache } from "../cache";

/** 🔹 Listar branch_stock com cache e merge para não perder dados */
export const getBranchStock = async (): Promise<{ success: boolean; data?: BranchStockItem[]; error?: string }> => {
  try {
    // Tenta pegar do cache
    let rows: any = getBranchStockCache();

    // Se não tiver cache, busca do banco
    if (!rows || rows.length === 0) {
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

      // Inicializa cache com os dados do Supabase
      setBranchStockCache(data || []);
      rows = data || [];
    } else {
      // Cache existente: busca do banco apenas para atualizar/mesclar
      const { data, error } = await supabase
        .from("branch_stock")
        .select(`
          branch_id,
          product_id,
          quantity,
          branches!inner(name),
          products!inner(name)
        `);

      if (!error && data) {
        const merged = [...rows];

        data.forEach((item: any) => {
          const index = merged.findIndex(
            (i: any) => i.branch_id === item.branch_id && i.product_id === item.product_id
          );

          if (index > -1) {
            merged[index] = item; // atualiza
          } else {
            merged.push(item); // adiciona novo
          }
        });

        setBranchStockCache(merged);
        rows = merged;
      }
    }

    // Mapeia para BranchStockItem
    const branchStock: BranchStockItem[] = (rows || []).map((item: any): BranchStockItem => ({
      branchId: item.branch_id,
      branchName: item.branches?.name ?? "Desconhecida",
      productId: item.product_id,
      productName: item.products?.name ?? "Sem nome",
      quantity: Number(item.quantity ?? 0),
    }));

    return { success: true, data: branchStock };
  } catch (err: any) {
    console.error("Erro ao buscar branchStock:", err);
    return { success: false, error: err?.message || "Erro ao carregar estoque por filial" };
  }
};
