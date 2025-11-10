import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { loadCache, getBranchFromCache } from "../cache";
import { User } from "../../shared/types";

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
export const createUser = async (data: User): Promise<{ success: true }> => {
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
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("users").insert([newUser]);
  if (error) throw error;

  return { success: true };
};

/** 🔹 Atualizar usuário */
export const updateUser = async (id: string, updates: Partial<User>): Promise<{ success: true }> => {
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  if (updates.role === undefined) updates.role = "operator";
  if (updates.department === undefined) updates.department = null;

  const { error } = await supabase.from("users").update(updates).eq("id", id);
  if (error) throw error;

  return { success: true };
};

/** 🔹 Excluir usuário */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw error;
};

/*import { adminDb } from "../firebase";
import bcrypt from "bcryptjs";
import { loadCache, getBranchFromCache } from "../cache";
import { User } from "../../shared/types";

export const getUsers = async (): Promise<User[]> => {
  try {
    await loadCache();

    const usersSnap = await adminDb.collection("users").get();
    const users = usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    return users.map((user) => {
      const branch = getBranchFromCache(user.branchId);

      return {
        ...user,
        password: undefined,
        role: user.role ?? "operator", // ✅ Garantir valor padrão
        department: user.department ?? null, // ✅ Garantir que exista setor, mesmo que null
        branch: branch
          ? { id: user.branchId, name: branch.name, code: branch.code }
          : null,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }
};

export const createUser = async (data: User): Promise<{ success: true }> => {
  try {
    const hashedPassword = await bcrypt.hash("123", 10);

    const newUser: User = {
      ...data,
      role: data.role ?? "operator", // ✅ nível padrão
      department: data.department ?? null, // ✅ setor opcional
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("users").add(newUser);

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Erro ao criar usuário");
  }
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<{ success: true }> => {
  try {
    const ref = adminDb.collection("users").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new Error("Usuário não encontrado");
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // ✅ Garante valores válidos ao atualizar
    if (updates.role === undefined) updates.role = "operator";
    if (updates.department === undefined) updates.department = null;

    await ref.update(updates);

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await adminDb.collection("users").doc(id).delete();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw new Error("Erro ao deletar usuário");
  }
};
*/