import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { getBranchFromCache } from "../cache";
import { User, UserDTO } from "../../shared/types";

import { supabase } from "../supabaseClient";

/** 🔹 Lista usuários */
export const getUsers = async (): Promise<{ success: boolean; data?: User[]; error?: string }> => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Erro Supabase getUsers:", error);
      return { success: false, error: error.message || "Erro ao carregar usuários" };
    }

    const users: User[] = data.map(user => {
      const branch = getBranchFromCache(user.branch_id);
      return {
        ...user,
        password: undefined,
        role: user.role ?? "operator",
        department: user.department ?? null,
        created_at: new Date().toISOString(),
        branch: branch ? { id: branch.id, name: branch.name, code: branch.code } : null,
      };
    });

    return { success: true, data: users };

  } catch (err: any) {
    console.error("Erro inesperado ao obter usuários:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};

/** 🔹 Criar usuário */
export const createUser = async (data: UserDTO): Promise<{ success: boolean; error?: string }> => {
  try {
    const hashedPassword = await bcrypt.hash("123", 10);

    const newUser = {
      id: uuidv4(),
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role ?? "operator",
      department: data.department ?? null,
      password: hashedPassword,
      branch_id: data.branchId,
    };

    const { error } = await supabase.from("users").insert([newUser]);
    if (error) {
      if (error.code === "23505") return { success: false, error: "Email ou username já cadastrado." };
      return { success: false, error: error.message || "Erro ao criar usuário" };
    }

    return { success: true };

  } catch (err: any) {
    console.error("Erro inesperado ao criar usuário:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};

/** 🔹 Atualizar usuário */
export const updateUser = async (
  id: string,
  updates: Partial<User> | any
): Promise<{ success: boolean; error?: string }> => {
  try {
    updates = updates ?? {};

    delete updates.branch;
    if (!updates.password) delete updates.password;
    else updates.password = await bcrypt.hash(updates.password, 10);

    if (updates.role === undefined) delete updates.role;
    if (updates.department === "") updates.department = null;
    if (updates.department === undefined) delete updates.department;

    const { error } = await supabase.from("users").update(updates).eq("id", id);
    if (error) return { success: false, error: error.message || "Erro ao atualizar usuário" };

    return { success: true };

  } catch (err: any) {
    console.error("Erro inesperado ao atualizar usuário:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};

/** 🔹 Excluir usuário */
export const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return { success: false, error: error.message || "Erro ao excluir usuário" };

    return { success: true };

  } catch (err: any) {
    console.error("Erro inesperado ao excluir usuário:", err);
    return { success: false, error: err?.message || "Erro inesperado" };
  }
};
