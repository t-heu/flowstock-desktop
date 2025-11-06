import jwt from "jsonwebtoken";
import { adminDb } from "../../firebase";
import { AuthUser } from "../../../types";
import { JWT_SECRET } from "../../config/jwt";

/**
 * 🔹 Valida token JWT e retorna usuário atualizado do banco
 */
export const getCurrentUser = async (token: string) => {
  try {
    if (!token) throw new Error("Token ausente");

    // Decodifica token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Busca usuário atualizado no Firestore
    const snap = await adminDb.collection("users").doc(decoded.id).get();
    if (!snap.exists) throw new Error("Usuário não encontrado");

    const userData = snap.data()!;

    // Retorna sempre versões atualizadas
    return {
      ok: true,
      user: {
        id: decoded.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        branchId: userData.branchId,
      },
    };
  } catch (error) {
    console.error("Token inválido:", error);
    return { ok: false, error: "Token inválido ou expirado" };
  }
};
