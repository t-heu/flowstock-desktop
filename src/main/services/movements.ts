import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";

/**
 * 🔹 Buscar lista de movimentos (com produtos e filiais)
 */
export const getMovements = async (user: any, typeFilter?: "entrada" | "saida") => {
  try {
    await loadCache();

    let query = supabase
      .from("movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (typeFilter) {
      query = query.eq("type", typeFilter);
    }

    if (user.role !== "admin") {
      query = query.eq("product_department", user.department);
    }

    const { data: rows, error } = await query;
    if (error) throw error;

    const movements = (rows || []).map((m) => ({
      ...m,
      product: getProductFromCache(m.product_id),
      branch: getBranchFromCache(m.branch_id),
      destination_branch_name: m.destination_branch_id
        ? (getBranchFromCache(m.destination_branch_id)?.name ?? "-")
        : "-",
    }));

    return { success: true, data: movements };
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
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar movimento:", error);
    throw new Error("Erro ao deletar movimento");
  }
};

/*import { adminDb } from "../firebase";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { Movement } from "../../shared/types";

export const getMovements = async (user: any, typeFilter?: "entrada" | "saida") => {
  try {
    await loadCache(); // carrega produtos e branches

    // Monta query
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
      adminDb.collection("movements")
        .orderBy("createdAt", "desc")
        .limit(50);

    if (typeFilter) query = query.where("type", "==", typeFilter);

    // Filtra por departamento direto no Firestore se não for admin
    if (user.role !== "admin") {
      query = query.where("productDepartment", "==", user.department);
    }

    const snapshot = await query.get();

    // Mapeia movimentos
    const movements = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Movement[];

    // Faz o "join" com produto e branch via cache
    const enriched = movements.map(m => ({
      ...m,
      product: getProductFromCache(m.productId),
      branch: getBranchFromCache(m.branchId),
    }));

    return { success: true, data: enriched };
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    throw new Error("Erro ao buscar movimentos");
  }
};

export const createMovement = async (movement: Omit<Movement, "id" | "createdAt">): Promise<{
  success: boolean;
  data?: Movement;
  error?: string;
}> => {
  try {
    const product = getProductFromCache(movement.productId);
    if (!product) throw new Error("Produto não encontrado");

    const movementToAdd = {
      ...movement,
      createdAt: new Date().toISOString(),
      productDepartment: product.department,
    };

    // Atualizar estoque da filial
    if (movement.productId && movement.branchId) {
      const stockRef = adminDb.collection("branchStock");
      const stockSnap = await stockRef
        .where("productId", "==", movement.productId)
        .where("branchId", "==", movement.branchId)
        .get();

      let updatedQty = 0;

      if (!stockSnap.empty) {
        const stockDoc = stockSnap.docs[0];
        const data = stockDoc.data();
        const currentQty = data.quantity || 0;

        // Impedir saída sem saldo
        if (movement.type === "saida" && currentQty < Number(movement.quantity)) {
          throw new Error(`Estoque insuficiente (disponível: ${currentQty})`);
        }

        // Atualiza quantidade
        if (movement.type === "entrada") updatedQty = currentQty + Number(movement.quantity);
        else if (movement.type === "saida") updatedQty = currentQty - Number(movement.quantity);

        await stockDoc.ref.update({ quantity: Math.max(0, updatedQty) });
      } else {
        // Impedir saída sem registro
        if (movement.type === "saida") {
          throw new Error("Filial sem estoque desse produto");
        }

        // Criar novo registro
        await stockRef.add({
          productId: movement.productId,
          branchId: movement.branchId,
          quantity: Number(movement.quantity),
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Criar o movimento
    const docRef = await adminDb.collection("movements").add(movementToAdd);
    return { success: true, data: { id: docRef.id, ...movementToAdd } };
  } catch (error) {
    console.error("Erro ao criar movimento:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

export const deleteMovement = async (id: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    if (!id) return { success: false, error: "ID é obrigatório" };
    await adminDb.collection("movements").doc(id).delete();
    return { success: true };;
  } catch (error) {
    console.error("Erro ao deletar movimento:", error);
    throw new Error("Erro ao buscar filiais");
  }
};
*/