import { supabase } from "../../supabaseClient";

/** 🔹 Retorna usuário atual a partir do ID */
export const getCurrentUser = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error || !data) throw new Error("Usuário não encontrado");

  return {
    success: true,
    user: {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      branchId: data.branchId,
      department: data.department,
    },
  };
};
/*import { adminDb } from "../../firebase";

export const getCurrentUser = async (userId: string) => {
  try {
    const snap = await adminDb.collection("users").doc(userId).get();
    if (!snap.exists) throw new Error("Usuário não encontrado");

    const userData = snap.data()!;

    return {
      success: true,
      user: {
        id: userId,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        branchId: userData.branchId,
        department: userData.department, // ✅ importante
      },
    };
  } catch {
    throw new Error("Token inválido ou expirado");
  }
};*/
