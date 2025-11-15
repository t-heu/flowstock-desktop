import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { IProduct, Product } from "../../shared/types";
import { loadCache, getAllProductsFromCache, invalidateProductCache } from "../cache";
import { checkPermission } from "../checkPermission";

/** 🔹 Listar produtos */
export const getProducts = async (user: any): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
  try {
    await loadCache();
    const products = getAllProductsFromCache();

    const filtered = user.role === "admin"
      ? products
      : products.filter(p => p.department === user.department);

    return { success: true, data: filtered };

  } catch (err: any) {
    console.error("Erro ao buscar produtos:", err);
    return { success: false, error: err?.message || "Erro ao carregar produtos" };
  }
};

/** 🔹 Criar produto */
export const createProduct = async (
  user: any,
  product: Omit<IProduct, "id" | "createdAt">
) => {
  try {
    const perm = checkPermission(user, ["admin", "manager"]);
    if (!perm.success) return perm;

    const productData = { 
      id: uuidv4(),
      ...product,  
      created_at: new Date().toISOString() 
    };

    const { error } = await supabase.from("products").insert([productData]);
    if (error) {
      console.error("Erro ao criar produto:", error);
      return { success: false, error: error.message || "Erro ao criar produto" };
    }

    invalidateProductCache();
    return { success: true };

  } catch (err: any) {
    console.error("Erro inesperado ao criar produto:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};

/** 🔹 Atualizar produto */
export const updateProduct = async (user: any, id: string, updates: Partial<Product>) => {
  try {
    const perm = checkPermission(user, ["admin", "manager"]);
    if (!perm.success) return perm;

    const { data: product, error: fetchErr } = await supabase.from("products").select("*").eq("id", id).single();
    if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
    if (user.role !== 'admin' && product.department !== user.department) return { success: false, error: "Você não pode alterar produtos de outro departamento" };

    const { error } = await supabase.from("products").update(updates).eq("id", id);
    if (error) {
      console.error("Erro ao atualizar produto:", error);
      return { success: false, error: error.message || "Erro ao atualizar produto" };
    }

    invalidateProductCache();
    return { success: true };

  } catch (err: any) {
    console.error("Erro inesperado ao atualizar produto:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};

/** 🔹 Deletar produto */
export const deleteProduct = async (user: any, id: string) => {
  try {
    const perm = checkPermission(user, ["admin", "manager"]);
    if (!perm.success) return perm;

    const { data: product, error: fetchErr } = await supabase.from("products").select("*").eq("id", id).single();
    if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
    if (user.role !== 'admin' && product.department !== user.department) {
      return { success: false, error: "Você não pode deletar produtos de outro departamento" };
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;

    invalidateProductCache();
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao deletar produto:", err);
    return { success: false, error: err.message || "Erro ao deletar produto"};
  }
};
