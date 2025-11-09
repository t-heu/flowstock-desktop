import { adminDb } from "./firebase";
import { Product, Branch } from "../shared/types";

let productsCache: Record<string, Product> | null = null;
let branchesCache: Record<string, Branch> | null = null;

export const loadCache = async () => {
  if (!productsCache) {
    const snap = await adminDb.collection("products").get();
    productsCache = {};
    snap.forEach(d => {
      const data = d.data();
      if (data.id) productsCache![data.id] = data as Product; // ✅ usa data.id
    });
  }

  if (!branchesCache) {
    const snap = await adminDb.collection("branches").get();
    branchesCache = {};
    snap.forEach(d => {
      const data = d.data();
      if (data.id) branchesCache![data.id] = data as Branch; // ✅ usa data.id
    });
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
