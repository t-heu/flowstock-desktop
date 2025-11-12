import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { loadCache, getAllBranchesFromCache, invalidateBranchCache } from "../cache";
import { Branch } from "../../shared/types";

export const getBranches = async (): Promise<Branch[]> => {
  try {
    await loadCache();
    return getAllBranchesFromCache();
  } catch (error) {
    console.error("Erro ao buscar filiais:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

export const addBranch = async (newBranch: Omit<Branch, "id" | "createdAt">): Promise<{ success: boolean }> => {
  try {
    const branchToAdd = {
      id: uuidv4(),
      ...newBranch,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("branches").insert([branchToAdd]);
    if (error) throw error;

    invalidateBranchCache();
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar filial:", error);
    throw new Error("Erro ao adicionar filial");
  }
};

export const deleteBranch = async (docId: string): Promise<{ success: boolean }> => {
  try {
    if (!docId) throw new Error("ID é obrigatório");

    const { error } = await supabase.from("branches").delete().eq("id", docId);
    if (error) throw error;

    invalidateBranchCache();
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar filial:", error);
    throw new Error("Erro ao deletar filial");
  }
};
