import { v4 as uuidv4 } from "uuid";

import { supabase } from "../supabaseClient";
import { loadCache, getAllBranchesFromCache, invalidateBranchCache } from "../cache";
import { Branch } from "../../shared/types";

/**
 * 🔹 Buscar todas as filiais (com cache)
 */
export const getBranches = async (): Promise<Branch[]> => {
  try {
    await loadCache();
    return getAllBranchesFromCache();
  } catch (error) {
    console.error("Erro ao buscar filiais:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

/**
 * 🔹 Criar nova filial (e atualizar cache)
 */
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

/**
 * 🔹 Excluir filial (e atualizar cache)
 */
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

/*import { adminDb } from "../firebase";
import {
  loadCache,
  getAllBranchesFromCache,
  invalidateBranchCache
} from "../cache";
import { Branch } from "../../shared/types";

export const getBranches = async (): Promise<Branch[]> => {
  try {
    // Se já estiver no cache, ótimo → retorna
    await loadCache();
    return getAllBranchesFromCache();
  } catch (error) {
    console.error("Erro ao buscar filiais:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

export const addBranch = async (
  newBranch: Omit<Branch, "id" | "createdAt">
): Promise<{ success: boolean }> => {
  try {
    const branchToAdd = {
      ...newBranch,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("branches").add(branchToAdd);

    // ⚠️ Filial mudou → cache inválido
    invalidateBranchCache();

    return { success: true };;

  } catch (error) {
    console.error("Erro ao adicionar filial:", error);
    throw new Error("Erro ao adicionar filial");
  }
};

export const deleteBranch = async (docId: string): Promise<{ success: boolean }> => {
  try {
    if (!docId) throw new Error("ID é obrigatório");

    await adminDb.collection("branches").doc(docId).delete();

    // ⚠️ Filial removida → cache inválido
    invalidateBranchCache();

    return { success: true };;

  } catch (error) {
    console.error("Erro ao deletar filial:", error);
    throw new Error("Erro ao deletar filial");
  }
};
*/