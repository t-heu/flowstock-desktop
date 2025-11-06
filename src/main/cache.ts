import { adminDb } from "./firebase";
import { Product, Branch } from "../types";

let productsCache: Record<string, any> | null = null;
let branchesCache: Record<string, any> | null = null;

export const loadCache = async () => {
  if (!productsCache) {
    //console.log("🔄 Carregando produtos do Firestore...");
    const snap = await adminDb.collection("products").get();
    productsCache = {};
    snap.forEach(d => {
      const data = d.data();
      productsCache![data.id] = { ...data } as Product; // ✅ usar data.id
    });
  }// else {
    //console.log("✅ Produtos carregados do cache");
  //}

  if (!branchesCache) {
    //console.log("🔄 Carregando filiais do Firestore...");
    const snap = await adminDb.collection("branches").get();
    branchesCache = {};
    snap.forEach(d => {
      const data = d.data();
      branchesCache![data.id] = { ...data } as Branch; // ✅ usar data.id
    });
  }// else {
    //console.log("✅ Filiais carregadas do cache");
  //}
};

export const getProductFromCache = (id: string) => productsCache?.[id] ?? null;

export const getBranchFromCache = (id: string) => branchesCache?.[id] ?? null;

export const getAllProductsFromCache = () =>
  productsCache ? Object.entries(productsCache).map(([id, data]) => ({ id, ...data })) : [];

export const getAllBranchesFromCache = (): Branch[] => {
  if (!branchesCache) return []; // ✅ usa a variável correta
  return Object.entries(branchesCache).map(([id, data]) => ({
    id,
    ...data
  })) as Branch[];
};

export const invalidateProductCache = () => { productsCache = null; };
export const invalidateBranchCache = () => { branchesCache = null; };
