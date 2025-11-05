import { adminDb } from "../firebase";

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  createdAt?: string;
}

/**
 * 🔹 Buscar todos os produtos
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await adminDb.collection("products").get();
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
    return products;
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error("Erro ao buscar produtos");
  }
};

/**
 * 🔹 Criar novo produto
 */
export const createProduct = async (product: Omit<Product, "id" | "createdAt">): Promise<{
  ok: boolean;
  error?: string;
}> => {
  try {
    await adminDb.collection("products").add({
      ...product,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    throw new Error("Erro ao adicionar produto");
  }
};

/**
 * 🔹 Atualizar produto existente
 */
export const updateProduct = async (id: string, updates: Partial<Product>): Promise<{
  ok: boolean;
  error?: string;
}> => {
  try {
    if (!id || !updates) return { ok: false, error: "ID e updates são obrigatórios" };
    await adminDb.collection("products").doc(id).update(updates);
    return { ok: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error("Erro ao atualizar produto");
  }
};

/**
 * 🔹 Deletar produto
 */
export const deleteProduct = async (id: string): Promise<{
  ok: boolean;
  error?: string;
}> => {
  try {
    if (!id) return { ok: false, error: "ID é obrigatório" };
    await adminDb.collection("products").doc(id).delete();
    return { ok: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw new Error("Erro ao deletar produto");
  }
};
