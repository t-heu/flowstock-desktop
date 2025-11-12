import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { 
  loadCache, 
  getProductFromCache, 
  getBranchFromCache, 
  invalidateBranchStockCache,
  invalidateMovementsCache,
  getMovementsCache,
  setMovementsCache
} from "../cache";

export const getMovements = async (user: any, typeFilter?: "entrada" | "saida") => {
  try {
    await loadCache();

    // ⚡ Usa getter em vez de referencia direta
    const cached = getMovementsCache();
    if (cached) {
      let data = cached;

      if (typeFilter) {
        data = data.filter(m => m.type === typeFilter);
      }

      if (user.role !== "admin") {
        data = data.filter(m => m.product_department === user.department);
      }

      return { success: true, data };
    }

    // 🔹 Busca do banco (apenas uma vez)
    const { data: rows, error } = await supabase
      .from("movements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (rows || []).map((m) => ({
      ...m,
      product: getProductFromCache(m.product_id),
      branch: getBranchFromCache(m.branch_id),
      destination_branch_name: m.destination_branch_id
        ? (getBranchFromCache(m.destination_branch_id)?.name ?? "-")
        : "-",
    }));

    // salva no cache via setter
    setMovementsCache(mapped);

    // aplica filtros de retorno (se a chamada pediu)
    let result = mapped;
    if (typeFilter) result = result.filter(m => m.type === typeFilter);
    if (user.role !== "admin") result = result.filter(m => m.product_department === user.department);

    return { success: true, data: result };
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    throw new Error("Erro ao buscar movimentos");
  }
};

export const createMovement = async (movement: {
  branch_id: string;
  destination_branch_id?: string; // ✅ opcional
  product_id: string;
  quantity: number;
  type: "entrada" | "saida";
  notes?: string;
  invoice_number?: string;
}) => {
  try {
    await loadCache();

    const product = getProductFromCache(movement.product_id);
    if (!product) return { success: false, error: "Produto não encontrado" };

    const movementToAdd = {
      ...movement,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      product_department: product.department,
      product_name: product.name,
      product_code: product.code,
      branch_name: getBranchFromCache(movement.branch_id)?.name || "-",
    };

    // --- ESTOQUE ---
    const { data: stockRows, error: stockErr } = await supabase
      .from("branch_stock")
      .select("*")
      .eq("product_id", movement.product_id)
      .eq("branch_id", movement.branch_id)
      .maybeSingle();
    if (stockErr) throw stockErr;

    const currentQty = stockRows ? Number(stockRows.quantity) : null;

    if (movement.type === "saida") {
      if (currentQty === null || currentQty < movement.quantity) {
        return { success: false, error: `Estoque insuficiente (disponível: ${currentQty ?? 0})` };
      }
    }

    // Atualiza estoque origem
    if (currentQty !== null) {
      const newQty =
        movement.type === "entrada"
          ? currentQty + movement.quantity
          : currentQty - movement.quantity;

      const { error: updateErr } = await supabase
        .from("branch_stock")
        .update({
          quantity: Math.max(0, newQty),
          updated_at: new Date().toISOString(),
        })
        .eq("product_id", movement.product_id)
        .eq("branch_id", movement.branch_id);
      if (updateErr) throw updateErr;
    } else {
      if (movement.type === "saida") {
        return { success: false, error: "Filial sem estoque desse produto" };
      }

      const { error: insertErr } = await supabase.from("branch_stock").insert([
        {
          product_id: movement.product_id,
          branch_id: movement.branch_id,
          quantity: movement.quantity,
          updated_at: new Date().toISOString(),
        },
      ]);
      if (insertErr) throw insertErr;
    }

    // ✅ Se for transferência (saida + destino existe), adiciona na filial destino
    if (movement.type === "saida" && movement.destination_branch_id) {
      await supabase.rpc("adjust_stock_transfer", {
        p_product_id: movement.product_id,
        p_from_branch: movement.branch_id,
        p_to_branch: movement.destination_branch_id,
        p_qty: movement.quantity,
      });
    }

    // Insere movimento
    const { data: inserted, error: insertMovementErr } = await supabase
      .from("movements")
      .insert([movementToAdd])
      .select()
      .single();

    if (insertMovementErr) throw insertMovementErr;

    invalidateMovementsCache();
    invalidateBranchStockCache();

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Erro ao criar movimento:", error);
    return { success: false, error: error.message };
  }
};

export const deleteMovement = async (id: string) => {
  try {
    const { error } = await supabase.from("movements").delete().eq("id", id);

    if (error) throw error;

    invalidateMovementsCache();
    invalidateBranchStockCache();

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar movimento:", error);
    throw new Error("Erro ao deletar movimento");
  }
};
