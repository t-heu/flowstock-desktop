import { adminDb } from "../firebase";

export interface Movement {
  id?: string;
  productId: string;
  branchId: string;
  type: "entrada" | "saida";
  quantity: number;
  createdAt?: string;
  product?: any;
  branch?: any;
}

/**
 * 🔹 Buscar lista de movimentos (com produtos e filiais)
 */
export const getMovements = async (typeFilter?: "entrada" | "saida"): Promise<{
  ok: boolean;
  data?: Movement[];
  error?: string;
}> => {
  try {
    // Buscar movimentos
    const snapshot = await adminDb.collection("movements").orderBy("createdAt", "desc").get();
    let movements = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Movement[];

    // Filtrar por tipo, se necessário
    if (typeFilter) {
      movements = movements.filter((m) => m.type === typeFilter);
    }

    // Buscar produtos e filiais
    const [productsSnap, branchesSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("branches").get(),
    ]);

    const products: Record<string, any> = {};
    productsSnap.docs.forEach((doc) => {
      const data = doc.data();
      products[doc.id] = data;
    });

    const branches: Record<string, any> = {};
    branchesSnap.docs.forEach((doc) => {
      const data = doc.data();
      branches[doc.id] = data;
    });

    // Enriquecer movimentos
    const enriched = movements.map((m) => ({
      ...m,
      product: products[m.productId] || null,
      branch: branches[m.branchId] || null,
    }));

    return { ok: true, data: enriched };
  } catch (error) {
    console.error("Erro ao buscar movimentos:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

/**
 * 🔹 Criar um novo movimento e atualizar estoque
 */
export const createMovement = async (movement: Omit<Movement, "id" | "createdAt">): Promise<{
  ok: boolean;
  data?: Movement;
  error?: string;
}> => {
  try {
    const movementToAdd = {
      ...movement,
      createdAt: new Date().toISOString(),
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
    return { ok: true, data: { id: docRef.id, ...movementToAdd } };
  } catch (error) {
    console.error("Erro ao criar movimento:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

/**
 * 🔹 Excluir movimento
 */
export const deleteMovement = async (id: string): Promise<{
  ok: boolean;
  error?: string;
}> => {
  try {
    if (!id) return { ok: false, error: "ID é obrigatório" };
    await adminDb.collection("movements").doc(id).delete();
    return { ok: true };
  } catch (error) {
    console.error("Erro ao deletar movimento:", error);
    throw new Error("Erro ao buscar filiais");
  }
};
