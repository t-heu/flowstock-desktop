// realtime-cache.ts
import { supabase } from "./supabaseClient";
import { Product, Branch, BranchStockItem } from "../shared/types";
import {
  getAllProductsFromCache,
  setProductsCache,
  getAllBranchesFromCache,
  setBranchesCache,
  getBranchStockCache,
  setBranchStockCache,
  getMovementsCache,
  setMovementsCache,
} from "./cache";

export const initRealtimeCache = () => {
  // -------- Produtos --------
  supabase
    .channel("products")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "products" },
      (payload: any) => {
        let cache = getAllProductsFromCache() || [];
        switch (payload.eventType) {
          case "INSERT":
            cache = [...cache, payload.new];
            break;
          case "UPDATE":
            cache = cache.map(p => (p.id === payload.new.id ? payload.new : p));
            break;
          case "DELETE":
            cache = cache.filter(p => p.id !== payload.old.id);
            break;
        }
        setProductsCache(cache);
      }
    )
    .subscribe();

  // -------- Filiais --------
  supabase
    .channel("branches")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "branches" },
      (payload: any) => {
        let cache = getAllBranchesFromCache() || [];
        switch (payload.eventType) {
          case "INSERT":
            cache = [...cache, payload.new];
            break;
          case "UPDATE":
            cache = cache.map(b => (b.id === payload.new.id ? payload.new : b));
            break;
          case "DELETE":
            cache = cache.filter(b => b.id !== payload.old.id);
            break;
        }
        setBranchesCache(cache);
      }
    )
    .subscribe();

  // -------- Branch Stock --------
  supabase
    .channel("branch_stock")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "branch_stock" },
      (payload: any) => {
        let cache = getBranchStockCache() || [];
        switch (payload.eventType) {
          case "INSERT":
            cache = [...cache, payload.new];
            break;
          case "UPDATE":
            cache = cache.map((b: any)=> (b.id === payload.new.id ? payload.new : b));
            break;
          case "DELETE":
            cache = cache.filter((b: any) => b.id !== payload.old.id);
            break;
        }
        setBranchStockCache(cache);
      }
    )
    .subscribe();

  // -------- Movements --------
  supabase
    .channel("movements")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "movements" },
      (payload: any) => {
        let cache = getMovementsCache() || [];
        switch (payload.eventType) {
          case "INSERT":
            cache = [payload.new, ...cache].slice(0, 30); // mantém só os 30 mais recentes
            break;
          case "UPDATE":
            cache = cache.map(m => (m.id === payload.new.id ? payload.new : m));
            break;
          case "DELETE":
            cache = cache.filter(m => m.id !== payload.old.id);
            break;
        }
        setMovementsCache(cache);
      }
    )
    .subscribe();
};
