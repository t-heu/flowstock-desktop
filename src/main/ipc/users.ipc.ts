import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { CreateUserSchema, IdSchema } from "../schemas";
import { readPersistedToken } from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerUserIPC() {
  // 🔹 Obter usuários
  ipcMain.handle(
    "get-users",
    safeIpc(async (_, args) => {
      const token = args?.token ?? readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await fetch(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao carregar usuários" };
      return { success: true, data: result.data };
    }, "Erro ao carregar usuários")
  );

  // 🔹 Criar usuário
  ipcMain.handle(
    "create-user",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };
      
      const parsed = CreateUserSchema.parse(args ?? {});
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(parsed),
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao criar usuário" };
      return { success: true, data: result };
    }, "Erro ao criar usuário")
  );

  // 🔹 Atualizar usuário
  ipcMain.handle(
    "update-user",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const validId = IdSchema.parse(args.id);

      // Pega apenas o objeto updates
      const { updates } = args;

      // Remove campos que não existem na tabela
      const body = {
        username: updates.username,
        name: updates.name,
        email: updates.email,
        role: updates.role,
        department: updates.department,
        branch_id: updates.branch_id,
        created_at: updates.created_at
      };

      const res = await fetch(`${API_URL}/users/${validId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar usuário" };

      return { success: true, data: result };
    }, "Erro ao atualizar usuário")
  );

  // 🔹 Excluir usuário
  ipcMain.handle(
    "delete-user",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const validId = IdSchema.parse(args);
      const res = await fetch(`${API_URL}/users/${validId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao excluir usuário" };
      return { success: true, data: result };
    }, "Erro ao excluir usuário")
  );
}
