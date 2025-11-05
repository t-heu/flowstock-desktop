import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  branchId: string;
}

/**
 * 🔹 Valida token JWT e retorna o usuário
 */
export const getCurrentUser = async (token: string) => {
  try {
    if (!token) {
      throw new Error("Token ausente");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return { ok: true, user: decoded };
  } catch (error) {
    console.error("Token inválido:", error);
    throw new Error("Token inválido");
  }
};
