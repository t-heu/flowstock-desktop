import { adminDb } from "../../firebase"; // sua instância do Firestore
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const TOKEN_EXPIRES = "7d"; // 7 dias

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  branchId: string;
}

/**
 * 🔹 Login: autentica e gera token JWT
 */
export const loginUser = async (username: string, password: string) => {
  try {
    if (!username || !password) {
      throw new Error("Usuário e senha são obrigatórios");
    }

    const usersSnap = await adminDb
      .collection("users")
      .where("username", "==", username)
      .get();

    if (usersSnap.empty) {
      throw new Error("Usuário ou senha inválidos");
    }

    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) {
      throw new Error("Usuário ou senha inválidos");
    }

    const user: AuthUser = {
      id: userDoc.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      branchId: userData.branchId,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    return { ok: true, user, token };
  } catch (error) {
    console.error("Erro no login:", error);
    throw new Error("Error 505");
  }
};
