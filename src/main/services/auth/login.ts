import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { supabase } from "../../supabaseClient";
import { AuthUser } from "../../../shared/types";
import { JWT_SECRET, TOKEN_EXPIRES } from "../../config/jwt";

/** 🔹 Login */
export const loginUser = async (username: string, password: string) => {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
    if (error || !data) return { success: false, error: "Usuário ou senha inválidos" };

    const isValid = await bcrypt.compare(password, data.password);
    if (!isValid) return { success: false, error: "Usuário ou senha inválidos" };

    const user: AuthUser = {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      branchId: data.branch_id,
      department: data.department,
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

    return { success: true, user, token };
  } catch (err: any) {
    console.error("Erro inesperado ao logar usuário:", err);
    return { success: false, error: err?.message || "Erro inesperado ao logar usuário" };
  }
};
