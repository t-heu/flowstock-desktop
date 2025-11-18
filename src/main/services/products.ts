import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { IProduct, Product } from "../../shared/types";
import { getAllProductsFromCache, invalidateProductCache, setProductsCache } from "../cache";
import { checkPermission } from "../checkPermission";

/** 🔹 Listar produtos */
export const getProducts = async (user: any) => {
  try {
    if (!getAllProductsFromCache()) {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;
      setProductsCache(data);
    }

    const products: Product[] = getAllProductsFromCache() ?? [];

    return {
      success: true,
      data: user.role === "admin" 
        ? products 
        : products.filter(p => p.department === user.department)
    };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erro ao carregar produtos" };
  }
};

export const createProduct = async (user: any, product: Omit<IProduct, "id" | "createdAt">) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  const productData = { id: uuidv4(), ...product, created_at: new Date().toISOString() };
  const { error } = await supabase.from("products").insert([productData]);
  if (error) return { success: false, error: error.message || "Erro ao criar produto" };

  invalidateProductCache();
  return { success: true };
};

export const deleteProduct = async (user: any, id: string) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
  if (user.role !== "admin" && product.department !== user.department) {
    return { success: false, error: "Você não pode deletar produtos de outro departamento" };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { success: false, error: error.message || "Erro ao deletar produto" };

  // Invalida cache para forçar recarregamento na próxima leitura
  invalidateProductCache();

  return { success: true };
};

export const updateProduct = async (user: any, id: string, updates: Partial<Product>) => {
  const perm = checkPermission(user, ["admin", "manager"]);
  if (!perm.success) return perm;

  // Busca produto existente
  const { data: product, error: fetchErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !product) return { success: false, error: "Produto não encontrado" };
  if (user.role !== "admin" && product.department !== user.department) {
    return { success: false, error: "Você não pode alterar produtos de outro departamento" };
  }

  // Atualiza produto
  const { error } = await supabase.from("products").update(updates).eq("id", id);
  if (error) return { success: false, error: error.message || "Erro ao atualizar produto" };

  // Invalida cache para forçar recarregamento na próxima leitura
  invalidateProductCache();

  return { success: true };
};
