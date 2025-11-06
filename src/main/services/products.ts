import { adminDb } from "../firebase";
import { 
  loadCache, 
  getAllProductsFromCache,
  invalidateProductCache
} from "../cache";
import { Product } from "../../types";

/**
 * 🔹 Buscar todos os produtos
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    await loadCache(); // ✅ carrega produtos no cache se necessário
    return getAllProductsFromCache(); // ✅ retorna versão em memória (sem GET)
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

    invalidateProductCache();
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

    invalidateProductCache();
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

    invalidateProductCache();
    return { ok: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw new Error("Erro ao deletar produto");
  }
};
