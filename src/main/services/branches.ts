import { v4 as uuidv4 } from "uuid";
import { supabase } from "../supabaseClient";
import { Branch } from "../../shared/types";
import { 
  getAllBranchesFromCache, 
  setBranchesCache, 
  invalidateBranchCache 
} from "../cache";

/** 🔹 Listar filiais */
export const getBranches = async (): Promise<{ success: boolean; data?: Branch[]; error?: string }> => {
  try {
    let branches = getAllBranchesFromCache();
    if (!branches) {
      const { data, error } = await supabase.from("branches").select("*");
      if (error) throw error;
      setBranchesCache(data);
      branches = data;
    }

    return { success: true, data: branches };
  } catch (err: any) {
    console.error("Erro ao buscar filiais:", err);
    return { success: false, error: err?.message || "Erro ao buscar filiais" };
  }
};

/** 🔹 Adicionar filial */
export const addBranch = async (newBranch: Omit<Branch, "id" | "createdAt">): Promise<{ success: boolean; error?: string }> => {
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
  } catch (err: any) {
    console.error("Erro ao adicionar filial:", err);
    return { success: false, error: err?.message || "Erro ao adicionar filial" };
  }
};

/** 🔹 Atualizar filial */
export const updateBranch = async (id: string, updates: Partial<Branch>): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!id) throw new Error("ID é obrigatório");

    const { error } = await supabase.from("branches").update(updates).eq("id", id);
    if (error) throw error;

    invalidateBranchCache();
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao atualizar filial:", err);
    return { success: false, error: err?.message || "Erro ao atualizar filial" };
  }
};

/** 🔹 Deletar filial */
export const deleteBranch = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!id) throw new Error("ID é obrigatório");

    const { error } = await supabase.from("branches").delete().eq("id", id);
    if (error) throw error;

    invalidateBranchCache();
    return { success: true };
  } catch (err: any) {
    console.error("Erro ao deletar filial:", err);
    return { success: false, error: err?.message || "Erro ao deletar filial" };
  }
};
