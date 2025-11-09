import { adminDb } from "../../firebase";
/**
 * 🔹 Valida token JWT e retorna usuário atualizado do banco
 */
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
};
