import { adminDb } from "../firebase";
import { loadCache, getProductFromCache, getBranchFromCache } from "../cache";
import { Movement } from "../../types";
import { getCurrentUser } from "../authSession";
/**
 * 🔹 Buscar lista de movimentos (com produtos e filiais)
 */
export const getMovements = async (typeFilter?: "entrada" | "saida") => {
  try {
    await loadCache(); // carrega produtos e branches

    const user = getCurrentUser();
    if (!user) throw new Error("Não autenticado");

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

/**
 * 🔹 Criar um novo movimento e atualizar estoque
 */
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

/**
 * 🔹 Excluir movimento
 */
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
