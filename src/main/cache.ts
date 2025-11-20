// ================= CACHE OTIMIZADO =================
import { Product, Branch, BranchStockItem, Stats, Movement } from "../shared/types";

let productsCache: Map<string, Product> | null = null;
let branchesCache: Map<string, Branch> | null = null;
let branchStockCache: Map<string, Map<string, BranchStockItem>> | null = null;
let movementsCache: Movement[] | null = null; // sempre os 30 movimentos mais recentes
let statsCacheInternal: Record<string, Stats> = {}
// chave: `${type}_${branchId}_${department}_${page}`
export let movementsPageCache: Map<string, Movement[]> = new Map();

// ======= PRODUCTS =======
export const getAllProductsFromCache = (): Product[] | null => productsCache ? Array.from(productsCache.values()) : null;
export const getProductFromCache = (id: string): Product | null => productsCache?.get(id) ?? null;
export const setProductsCache = (data: Product[]) => {
  productsCache = new Map(data.map(p => [p.id, p]));
};
export const invalidateProductCache = () => { productsCache = null; };

// ======= BRANCHES =======
export const getAllBranchesFromCache = (): Branch[] | null => branchesCache ? Array.from(branchesCache.values()) : null;
export const getBranchFromCache = (id: string): Branch | null => branchesCache?.get(id) ?? null;
export const setBranchesCache = (data: Branch[]) => {
  branchesCache = new Map(
    data
      .filter(b => b.id) // remove itens sem id
      .map(b => [b.id as string, b]) // garante string
  );
};
export const invalidateBranchCache = () => { branchesCache = null; };

// ======= BRANCH STOCK =======
export const getBranchStockCache = (): BranchStockItem[] | null => {
  if (!branchStockCache) return null;
  const result: BranchStockItem[] = [];
  branchStockCache.forEach(branchMap => branchMap.forEach(item => result.push(item)));
  return result;
};
export const setBranchStockCache = (items: BranchStockItem[] | any[]) => {
  branchStockCache = new Map();
  items.forEach(item => {
    if (!branchStockCache!.has(item.branchId)) branchStockCache!.set(item.branchId, new Map());
    branchStockCache!.get(item.branchId)!.set(item.productId, item);
  });
};
export const invalidateBranchStockCache = () => { branchStockCache = null; };

// ======= MOVEMENTS (30 RECENTES) =======
export const getMovementsCache = (): Movement[] | null => movementsCache;
export const setMovementsCache = (data: Movement[]) => {
  // Mantém apenas os 30 mais recentes
  movementsCache = data
  .filter(m => m.created_at) // remove itens sem created_at
  .sort(
    (a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
  )
  .slice(0, 30);
};
export const invalidateMovementsCache = () => { movementsCache = null; };

// ================= STATS =================
export const getStatsCache = (key: string): Stats | undefined => statsCacheInternal[key];

export const setStatsCache = (key: string, stats: Stats) => {
  statsCacheInternal[key] = stats;
};

export const invalidateStatsCache = (key?: string) => {
  if (key) delete statsCacheInternal[key];
  else statsCacheInternal = {};
};

export const getMovementsCacheKey = ({
  type,
  branchId,
  department,
  page,
}: {
  type?: string;
  branchId?: string;
  department?: string;
  page: number;
}) => `${type ?? "all"}_${branchId ?? "all"}_${department ?? "all"}_${page}`;
