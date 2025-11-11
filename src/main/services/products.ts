import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { IProduct, Product } from "../../shared/types";
import { loadCache, getAllProductsFromCache, invalidateProductCache } from "../cache";
import { checkPermission } from "../checkPermission";

/** 🔹 Listar produtos */
export const getProducts = async (user: any): Promise<Product[]> => {
  await loadCache();
  const products = getAllProductsFromCache();
  if (user.role === "admin") return products;
  return products.filter(p => p.department === user.department);
};

/** 🔹 Criar produto */
export const createProduct = async (user: any, product: Omit<IProduct, "id" | "createdAt">) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  const productData = { 
    id: uuidv4(),
    ...product,  
    created_at: new Date().toISOString() 
  };
  const { error } = await supabase.from("products").insert([productData]);
  if (error) throw error;

  invalidateProductCache();
  return { success: true };
};

/** 🔹 Atualizar produto */
export const updateProduct = async (user: any, id: string, updates: Partial<Product>) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  const { data: product, error: fetchErr } = await supabase.from("products").select("*").eq("id", id).single();
  if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
  if (product.department !== user.department) return { success: false, error: "Você não pode alterar produtos de outro departamento" };

  const { error } = await supabase.from("products").update(updates).eq("id", id);
  if (error) throw error;

  invalidateProductCache();
  return { success: true };
};

/** 🔹 Deletar produto */
export const deleteProduct = async (user: any, id: string) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  const { data: product, error: fetchErr } = await supabase.from("products").select("*").eq("id", id).single();
  if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
  if (product.department !== user.department) return { success: false, error: "Você não pode deletar produtos de outro departamento" };

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  invalidateProductCache();
  return { success: true };
};

/*import { adminDb } from "../firebase";
import { 
  loadCache, 
  getAllProductsFromCache,
  invalidateProductCache
} from "../cache";
import { Product } from "../../shared/types";
import { checkPermission } from "../checkPermission";

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
*/