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
  if (user.role !== 'admin' && product.department !== user.department) return { success: false, error: "Você não pode alterar produtos de outro departamento" };

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
  if (user.role !== 'admin' && product.department !== user.department) {
    return { success: false, error: "Você não pode deletar produtos de outro departamento" };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;

  invalidateProductCache();
  return { success: true };
};
