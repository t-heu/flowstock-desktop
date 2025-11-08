import jwt from "jsonwebtoken";
import { adminDb } from "../../firebase";
import { AuthUser } from "../../../types";
import { JWT_SECRET } from "../../config/jwt";

/**
 * 🔹 Valida token JWT e retorna usuário atualizado do banco
 */
export const getCurrentUser = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    const snap = await adminDb.collection("users").doc(decoded.id).get();
    if (!snap.exists) throw new Error("Usuário não encontrado");

    const userData = snap.data()!;

    return {
      ok: true,
      user: {
        id: decoded.id,
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
