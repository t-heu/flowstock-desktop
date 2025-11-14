import { supabase } from "./supabaseClient";
import { Product, Branch } from "../shared/types";

let productsCache: Record<string, Product> | null = null;
let branchesCache: Record<string, Branch> | null = null;

const PAGE_SIZE = 2000;

// Função genérica para fazer paginação
async function fetchAll(table: string) {
  let from = 0;
  let all: any[] = [];
  let finished = false;

  while (!finished) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;

    all = all.concat(data);

    if (data.length < PAGE_SIZE) {
      finished = true;
    } else {
      from += PAGE_SIZE;
    }
  }

  return all;
}

export const loadCache = async () => {
  // PRODUCTS CACHE
  if (!productsCache) {
    const data = await fetchAll("products");

    const cache: Record<string, Product> = {}; // <-- variável local derivada

    data.forEach(d => {
      if (d.id) cache[d.id] = d;
    });

    productsCache = cache; // <-- agora atribui de uma vez só
  }

  // BRANCHES CACHE
  if (!branchesCache) {
    const data = await fetchAll("branches");

    const cache: Record<string, Branch> = {};

    data.forEach(d => {
      if (d.id) cache[d.id] = d;
    });

    branchesCache = cache;
  }

  // BRANCH STOCK CACHE
  if (branchStockCache === null) {
    branchStockCache = await fetchAll("branch_stock");
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
