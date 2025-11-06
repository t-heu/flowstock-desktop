import { adminDb } from "../firebase";
import {
  loadCache,
  getAllBranchesFromCache,
  invalidateBranchCache
} from "../cache";
import { Branch } from "../../types";

/**
 * 🔹 Buscar todas as filiais (com cache)
 */
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

/**
 * 🔹 Criar nova filial (e atualizar cache)
 */
export const addBranch = async (
  newBranch: Omit<Branch, "id" | "createdAt">
): Promise<{ ok: boolean }> => {
  try {
    const branchToAdd = {
      ...newBranch,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("branches").add(branchToAdd);

    // ⚠️ Filial mudou → cache inválido
    invalidateBranchCache();

    return { ok: true };

  } catch (error) {
    console.error("Erro ao adicionar filial:", error);
    throw new Error("Erro ao adicionar filial");
  }
};

/**
 * 🔹 Excluir filial (e atualizar cache)
 */
export const deleteBranch = async (docId: string): Promise<{ ok: boolean }> => {
  try {
    if (!docId) throw new Error("ID é obrigatório");

    await adminDb.collection("branches").doc(docId).delete();

    // ⚠️ Filial removida → cache inválido
    invalidateBranchCache();

    return { ok: true };

  } catch (error) {
    console.error("Erro ao deletar filial:", error);
    throw new Error("Erro ao deletar filial");
  }
};
