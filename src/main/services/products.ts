import { adminDb } from "../firebase";
import { 
  loadCache, 
  getAllProductsFromCache,
  invalidateProductCache
} from "../cache";
import { Product } from "../../shared/types";
import { checkPermission } from "../checkPermission";

/**
 * 🔹 Buscar todos os produtos
 */
export const getProducts = async (user: any): Promise<Product[]> => {
  try {
    await loadCache();

    // ✅ Agora a filtragem é feita aqui: lista só produtos do departamento do usuário
     const products = getAllProductsFromCache();

    // ✅ Se for admin → retorna tudo, sem filtro
    if (user.role === "admin") {
      return products;
    }

    // ✅ Se não for admin → filtra pelo departamento
    return products.filter(p => p.department === user.department);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error("Erro ao buscar produtos");
  }
};

/**
 * 🔹 Criar novo produto
 */
export const createProduct = async (
  user: any,
  product: Omit<Product, "id" | "createdAt">
): Promise<{ success: boolean; error?: string }> => {

  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  try {
    const productData = {
      ...product,
      department: user.department,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("products").add(productData);
    invalidateProductCache();
    return { success: true };;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    throw new Error("Erro ao adicionar produto");
  }
};

/**
 * 🔹 Atualizar produto
 */
export const updateProduct = async (
  user: any,
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  try {
    const ref = adminDb.collection("products").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, error: "Produto não encontrado" };

    const product = doc.data() as Product;

    if (product.department !== user.department) {
      return { success: false, error: "Você não pode alterar produtos de outro departamento" };
    }

    await ref.update(updates);
    invalidateProductCache();
    return { success: true };;
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw new Error("Erro ao atualizar produto");
  }
};

/**
 * 🔹 Remover produto
 */
export const deleteProduct = async (
  user: any,
  id: string
): Promise<{ success: boolean; error?: string }> => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  try {
    const ref = adminDb.collection("products").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { success: false, error: "Produto não encontrado" };

    const product = doc.data() as Product;

    if (product.department !== user.department) {
      return { success: false, error: "Você não pode deletar produtos de outro departamento" };
    }

    await ref.delete();
    invalidateProductCache();
    return { success: true };;
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw new Error("Erro ao deletar produto");
  }
};
