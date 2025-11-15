import { supabase } from "../../supabaseClient";

/** 🔹 Retorna usuário atual a partir do ID */
export const getCurrentUser = async (userId: string) => {
  try {
    if (!userId) return { success: false, error: "ID do usuário não recebido do token" };

    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
    if (error || !data) return { success: false, error: "Usuário não encontrado" };

    return {
      success: true,
      user: {
        id: data.id,
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        branchId: data.branch_id,
        department: data.department,
      },
    };
  } catch (err: any) {
    console.error("Erro inesperado ao buscar usuário:", err);
    return { success: false, error: err?.message || "Erro inesperado ao obter usuário" };
  }
};
