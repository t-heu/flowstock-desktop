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

export const getMovements = async (
  user: { role: string; department: string },
  typeFilter?: "entrada" | "saida"
) => {
  try {
    await loadCache();

    // Filtros dinâmicos (por request)
    const applyFilters = (data: any[]) => {
      if (!typeFilter) return data;
      return data.filter(m => m.type === typeFilter);
    };

    // 🔥 CACHE GLOBAL → usado imediatamente
    const cached = getMovementsCache();
    if (cached) {
      return { success: true, data: applyFilters(cached) };
    }

    // 🔥 JOIN COMPLETO — sem getProductFromCache
    let query = supabase
      .from("movements")
      .select(`
        id,
        product_id,
        branch_id,
        destination_branch_id,
        quantity,
        type,
        invoice_number,
        product_department,
        notes,
        created_at,

        product:product_id (
          id, code, name, description, department, unit, created_at
        ),

        branch:branch_id (
          id, code, name, created_at
        ),

        destination_branch:destination_branch_id (
          id, code, name, created_at
        )
      `)
      .order("created_at", { ascending: false })
      .limit(30);;

    // 🔵 APLICAR department *DIRETO NA QUERY*
    // (só é aplicado se o usuário NÃO for admin)
    if (user.role !== "admin") {
      query = query.eq("product_department", user.department);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    // 🔧 Ajustar template final (igual ao seu retorno)
    const mapped = (rows || []).map((m: any) => ({
      ...m,
      branch_name: m.branch?.name ?? "-",
      product_name: m.product?.name ?? "-",
      product_code: m.product?.code ?? "-",
      destination_branch_name: m.destination_branch?.name ?? "-",
    }));

    // 🗄️ Salva no cache
    setMovementsCache(mapped);

    return { success: true, data: applyFilters(mapped) };
  } catch (err: any) {
    console.error("Erro ao buscar movimentos:", err);
    return { success: false, error: err.message || "Erro ao buscar movimentos"};
  }
};

export const createMovement = async (movement: {
  branch_id: string;
  destination_branch_id?: string; // ✅ opcional
  product_id: string;
  quantity: number;
  type: "entrada" | "saida" | "all";
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
    return { success: false, error: error.message || "Erro ao criar movimento"};
  }
};

export const deleteMovement = async (id: string) => {
  try {
    const { error } = await supabase.from("movements").delete().eq("id", id);

    if (error) throw error;

    invalidateMovementsCache();
    invalidateBranchStockCache();

    return { success: true };
  } catch (error: any) {
    console.error("Erro ao deletar movimento:", error);
    return { success: false, error: error.message || "Erro ao deletar movimento"};
  }
};
