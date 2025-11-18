import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { 
  getProductFromCache, 
  getAllProductsFromCache,
  setProductsCache,
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
    const applyFilters = (data: any[]) => {
      if (!typeFilter) return data;
      return data.filter(m => m.type === typeFilter);
    };

    // 🔥 Tenta cache primeiro
    const cached = getMovementsCache();
    if (cached) {
      return { success: true, data: applyFilters(cached) };
    }

    // 🔥 Join completo direto no DB
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
      .limit(30);

    if (user.role !== "admin") {
      query = query.eq("product_department", user.department);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const mapped = (rows || []).map((m: any) => ({
      ...m,
      branch_name: m.branch?.name ?? "-",
      product_name: m.product?.name ?? "-",
      product_code: m.product?.code ?? "-",
      destination_branch_name: m.destination_branch?.name ?? "-",
    }));

    // Salva no cache
    setMovementsCache(mapped);

    return { success: true, data: applyFilters(mapped) };
  } catch (err: any) {
    console.error("Erro ao buscar movimentos:", err);
    return { success: false, error: err.message || "Erro ao buscar movimentos" };
  }
};

export const createMovement = async (movement: {
  branch_id: string;
  destination_branch_id?: string;
  product_id: string;
  quantity: number;
  type: "entrada" | "saida" | "all";
  notes?: string;
  invoice_number?: string;
}) => {
  try {
    // 🔹 Produto via cache
    let product: any = getProductFromCache(movement.product_id);
    if (!product) {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", movement.product_id)
        .single();
      if (error || !data) return { success: false, error: "Produto não encontrado" };

      const currentCache = getAllProductsFromCache() ?? [];
      setProductsCache([...currentCache, data]);
      product = data;
    }

    const movementToAdd = {
      ...movement,
      id: uuidv4(),
      created_at: new Date().toISOString(),
      product_department: product.department,
    };

    // 🔹 Estoque da filial
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
      const newQty = movement.type === "entrada"
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

      const { error: insertErr } = await supabase.from("branch_stock").insert([{
        product_id: movement.product_id,
        branch_id: movement.branch_id,
        quantity: movement.quantity,
        updated_at: new Date().toISOString(),
      }]);
      if (insertErr) throw insertErr;
    }

    // Transferência para filial destino
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

    // 🔹 Invalida caches
    invalidateMovementsCache();
    invalidateBranchStockCache();

    return { success: true, data: inserted };
  } catch (err: any) {
    console.error("Erro ao criar movimento:", err);
    return { success: false, error: err.message || "Erro ao criar movimento" };
  }
};

export const deleteMovement = async (id: string) => {
  try {
    const { error } = await supabase.from("movements").delete().eq("id", id);
    if (error) throw error;

    // 🔹 Invalida caches
    invalidateMovementsCache();
    invalidateBranchStockCache();

    return { success: true };
  } catch (err: any) {
    console.error("Erro ao deletar movimento:", err);
    return { success: false, error: err.message || "Erro ao deletar movimento" };
  }
};
