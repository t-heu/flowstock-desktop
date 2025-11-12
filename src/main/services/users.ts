import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { loadCache, getBranchFromCache } from "../cache";
import { User, IUser } from "../../shared/types";

import { supabase } from "../supabaseClient";

/** 🔹 Lista usuários */
export const getUsers = async (): Promise<User[]> => {
  await loadCache();

  const { data, error } = await supabase.from("users").select("*");
  if (error) throw error;

  return data.map(user => {
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
};

/** 🔹 Criar usuário */
export const createUser = async (data: IUser): Promise<{ success: true }> => {
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
    if (error.code === "23505") {
      throw new Error("Email ou username já cadastrado.");
    }
    throw error;
  }

  return { success: true };
};

/** 🔹 Atualizar usuário */
export const updateUser = async (id: string, updates: Partial<User> | any): Promise<{ success: true }> => {
  updates = updates ?? {};

  // Remover campos que não existem no banco
  delete updates.branch;

  if (!updates.password) {
    delete updates.password;
  } else {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  if (updates.role === undefined) delete updates.role;

  if (updates.department === "") updates.department = null;
  if (updates.department === undefined) delete updates.department;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id);

  if (error) throw error;

  return { success: true };
};

/** 🔹 Excluir usuário */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
};
