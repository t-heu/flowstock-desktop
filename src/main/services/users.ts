import { adminDb } from "../firebase"; // instância do Firestore client-side
import bcrypt from "bcryptjs";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  username: string;
  branchId: string;
  password?: string;
  createdAt?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
}

/**
 * 🔹 Lista todos os usuários com a filial vinculada
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const [usersSnap, branchesSnap] = await Promise.all([
      adminDb.collection("users").get(),
      adminDb.collection("branches").get(),
    ]);

    const users = usersSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];

    const branches = branchesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Branch[];

    // vincula a filial a cada usuário
    const usersWithBranch = users.map((user) => {
      const branch = branches.find((b) => b.id === user.branchId);
      return {
        ...user,
        password: undefined,
        branch: branch ? { id: branch.id, name: branch.name, code: branch.code } : null,
      };
    });

    return usersWithBranch;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    throw new Error("Erro ao buscar usuários");
  }
};

/**
 * 🔹 Cria novo usuário
 */
export const createUser = async (data: User): Promise<User> => {
  try {
    const hashedPassword = await bcrypt.hash(data.password || "", 10);

    const newUser: User = {
      ...data,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection("users").add(newUser);

    return { id: docRef.id, ...newUser, password: undefined };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Erro ao criar usuário");
  }
};

/**
 * 🔹 Atualiza usuário
 */
export const updateUser = async (id: string, updates: Partial<User>): Promise<User> => {
  try {
    const userRef = adminDb.collection("users").doc(id);
    const snap = await userRef.get();

    if (!snap.exists) {
      throw new Error("Usuário não encontrado");
    }

    // Se for atualizar a senha, hash antes
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    await userRef.update(updates);
    const updatedSnap = await userRef.get();

    return { id: updatedSnap.id, ...updatedSnap.data(), password: undefined } as User;
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
};

/**
 * 🔹 Remove usuário
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await adminDb.collection("users").doc(id).delete();
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw new Error("Erro ao deletar usuário");
  }
};
