import { adminDb } from "../firebase"; // ajuste o caminho conforme sua estrutura

export interface Branch {
  id?: string;
  name: string;
  code: string;
  location?: string;
  createdAt?: string;
}

/**
 * 🔹 Buscar todas as filiais (branches)
 */
export const getBranches = async (): Promise<Branch[]> => {
  try {
    const snapshot = await adminDb.collection("branches").get();
    const branches = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Branch[];

    return branches;
  } catch (error) {
    console.error("Erro ao buscar filiais:", error);
    throw new Error("Erro ao buscar filiais");
  }
};

/**
 * 🔹 Criar nova filial
 */
export const addBranch = async (
  newBranch: Omit<Branch, "id" | "createdAt">
): Promise<{ ok: boolean;}> => {
  try {
    const branchToAdd = {
      ...newBranch,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("branches").add(branchToAdd);
    return { ok: true };//{ id: docRef.id, ...branchToAdd };
  } catch (error) {
    console.error("Erro ao adicionar filial:", error);
    throw new Error("Erro ao adicionar filial");
  }
};

/**
 * 🔹 Excluir filial pelo ID
 */
export const deleteBranch = async (id: string): Promise<{ ok: boolean;}> => {
  try {
    if (!id) throw new Error("ID é obrigatório");

    await adminDb.collection("branches").doc(id).delete();
    return { ok: true };
  } catch (error) {
    console.error("Erro ao deletar filial:", error);
    throw new Error("Erro ao deletar filial");
  }
};
