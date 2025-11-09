import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { adminDb } from "../../firebase";
import { AuthUser } from "../../../shared/types";
import { JWT_SECRET, TOKEN_EXPIRES } from "../../config/jwt";

/**
 * 🔹 Login: autentica e gera token JWT
 */
export const loginUser = async (username: string, password: string) => {
  try {
    const usersSnap = await adminDb
      .collection("users")
      .where("username", "==", username)
      .get();

    if (usersSnap.empty) throw new Error("Usuário ou senha inválidos");

    const userDoc = usersSnap.docs[0];
    const userData = userDoc.data();

    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) throw new Error("Usuário ou senha inválidos");

    const user: AuthUser = {
      id: userDoc.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      branchId: userData.branchId,
      department: userData.department, // ✅ novo
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    return { success: true, user, token };
  } catch {
    throw new Error("Error 505");
  }
};
