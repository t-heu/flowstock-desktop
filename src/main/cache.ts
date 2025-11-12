import { supabase } from "./supabaseClient";
import { Product, Branch } from "../shared/types";

let productsCache: Record<string, Product> | null = null;
let branchesCache: Record<string, Branch> | null = null;

export const loadCache = async () => {
  if (!productsCache) {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    productsCache = {};
    data.forEach(d => {
      if (d.id) productsCache![d.id] = d;
    });
  }

  if (!branchesCache) {
    const { data, error } = await supabase.from("branches").select("*");
    if (error) throw error;
    branchesCache = {};
    data.forEach(d => {
      if (d.id) branchesCache![d.id] = d;
    });
  }

  if (branchStockCache === null) {
    const { data, error } = await supabase.from("branch_stock").select("*");
    if (error) throw error;
    branchStockCache = data || [];
  }
};

export const getProductFromCache = (id: string): Product | null =>
  productsCache?.[id] ?? null;

export const getBranchFromCache = (id: string): Branch | null =>
  branchesCache?.[id] ?? null;

export const getAllProductsFromCache = (): Product[] =>
  productsCache ? Object.values(productsCache) : [];

export const getAllBranchesFromCache = (): Branch[] =>
  branchesCache ? Object.values(branchesCache) : [];

export const invalidateProductCache = () => { productsCache = null; };
export const invalidateBranchCache = () => { branchesCache = null; };

let branchStockCache: any[] | null = null;

export const getBranchStockCache = () => branchStockCache;

export const invalidateBranchStockCache = () => {
  branchStockCache = null;
};

let movementsCache: any[] | null = null;

export const getMovementsCache = () => movementsCache;
export const setMovementsCache = (data: any[]) => { movementsCache = data; };
export const invalidateMovementsCache = () => { movementsCache = null; };
