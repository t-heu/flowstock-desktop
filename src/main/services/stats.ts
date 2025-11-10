import { supabase } from "../supabaseClient";
import { Stats } from "../../shared/types";

let statsCache: Record<string, Stats> = {};

export const getStats = async (user: any, branchFilter?: string): Promise<Stats> => {
  try {
    const cacheKey = `${user.role}-${user.department}-${branchFilter ?? "ALL"}`;
    if (statsCache[cacheKey]) return statsCache[cacheKey];

    const [
      { data: productsRows, error: prodErr },
      { data: branchesRows, error: branchErr },
      { data: movementsRows, error: movErr },
      { data: branchStockRows, error: stockErr }
    ] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("branches").select("*"),
      supabase.from("movements").select("*"),
      supabase.from("branch_stock").select("*"),
    ]);

    if (prodErr || branchErr || movErr || stockErr) {
      throw new Error("Erro ao carregar dados do Supabase");
    }

    let products = productsRows || [];
    let movements = movementsRows || [];
    let branchStock = branchStockRows || [];

    // 🔹 Se não for admin → filtra por departamento
    if (user.role !== "admin") {
      products = products.filter(p => p.department === user.department);

      const allowedProductIds = new Set(products.map(p => p.id));

      movements = movements.filter(m => allowedProductIds.has(m.product_id));
      branchStock = branchStock.filter(b => allowedProductIds.has(b.product_id));
    }

    // 🔹 Filtra filial
    if (branchFilter) {
      branchStock = branchStock.filter(b => b.branch_id === branchFilter);
      movements = movements.filter(m => m.branch_id === branchFilter);
    }

    // 🔹 Cálculo das estatísticas
    const totalEntries = movements.filter(m => m.type === "entrada").length;
    const totalExits = movements.filter(m => m.type === "saida").length;

    const totalStock = branchStock.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    const stats: Stats = {
      totalProducts: products.length,
      totalStock,
      totalEntries,
      totalExits,
      totalBranches: (branchesRows || []).length,
    };

    statsCache[cacheKey] = stats;
    return stats;
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas");
  }
};

export const invalidateStatsCache = () => {
  statsCache = {};
};


/*import { adminDb } from "../firebase";
import { Stats } from "../../shared/types";

let statsCache: Record<string, Stats> = {};

export const getStats = async (user: any, branchFilter?: string): Promise<Stats> => {
  try {
    const cacheKey = `${user.role}-${user.department}-${branchFilter ?? "ALL"}`;
    if (statsCache[cacheKey]) return statsCache[cacheKey];

    // 1) Carrega tudo como antes (sem filtro no Firestore)
    const [productsSnap, branchesSnap, movementsSnap, branchStockSnap] = await Promise.all([
      adminDb.collection("products").get(),
      adminDb.collection("branches").get(),
      adminDb.collection("movements").get(),
      adminDb.collection("branchStock").get(),
    ]);

    let products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
    let movements = movementsSnap.docs.map((d) => d.data() as any);
    let branchStock = branchStockSnap.docs.map((d) => d.data() as any);

    // 2) Se user não é admin → filtra por departamento
    if (user.role !== "admin") {
      products = products.filter(p => p.department === user.department);
      const allowedProductIds = new Set(products.map(p => p.id));

      movements = movements.filter(m => allowedProductIds.has(m.productId));
      branchStock = branchStock.filter(b => allowedProductIds.has(b.productId));
    }

    // 3) Se escolheu filial → filtra branchStock e movimentos
    if (branchFilter) {
      branchStock = branchStock.filter(b => b.branchId === branchFilter);
      movements = movements.filter(m => m.branchId === branchFilter);
    }

    // 4) Calcula estatísticas corretamente
    const totalEntries = movements.filter((m) => m.type === "entrada").length;
    const totalExits = movements.filter((m) => m.type === "saida").length;
    const totalStock = branchStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const stats: Stats = {
      totalProducts: products.length,
      totalStock,
      totalEntries,
      totalExits,
      totalBranches: branchesSnap.size,
    };

    statsCache[cacheKey] = stats;
    return stats;
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw new Error("Erro ao buscar estatísticas");
  }
};

export const invalidateStatsCache = () => {
  statsCache = {};
};
*/