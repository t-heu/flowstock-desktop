import { adminDb } from "../firebase";
import bcrypt from "bcryptjs";
import { loadCache, getBranchFromCache } from "../cache";
import { User } from "../../types";

/**
 * 🔹 Lista todos os usuários com filial usando cache (sem GET extra)
 */
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

/**
 * 🔹 Criar usuário
 */
export const createUser = async (data: User): Promise<User> => {
  try {
    const hashedPassword = await bcrypt.hash(data.password || "", 10);

    const newUser: User = {
      ...data,
      role: data.role ?? "operator", // ✅ nível padrão
      department: data.department ?? null, // ✅ setor opcional
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("users").add(newUser);

    return { ...newUser, id: docRef.id, password: undefined };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Erro ao criar usuário");
  }
};

/**
 * 🔹 Atualizar usuário
 */
export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
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

    const updated = await ref.get();
    return { id, ...updated.data(), password: undefined } as User;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
};

/**
 * 🔹 Excluir usuário
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await adminDb.collection("users").doc(id).delete();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw new Error("Erro ao deletar usuário");
  }
};
