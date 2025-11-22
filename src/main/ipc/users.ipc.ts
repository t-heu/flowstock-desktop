import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { CreateUserSchema, IdSchema } from "../schemas";
import { readPersistedToken } from "../authSession";

export function registerUserIPC() {
  // 🔹 Obter usuários
  ipcMain.handle(
    "get-users",
    safeIpc(async (_, args) => {
      const token = args?.token ?? readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await apiFetch(`/users`, {
        token,
      });
      
      return { success: true, data: res.data };
    }, "Erro ao carregar usuários")
  );

  // 🔹 Criar usuário
  ipcMain.handle(
    "create-user",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };
      
      const parsed = CreateUserSchema.parse(args ?? {});
      const res = await apiFetch(`/users`, {
        method: "POST",
        token,
        body: parsed,
      });
      
      return { success: true, data: res };
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

      const res = await apiFetch(`/users/${validId}`, {
        method: "PUT",
        token,
        body,
      });

      return { success: true, data: res };
    }, "Erro ao atualizar usuário")
  );

  // 🔹 Excluir usuário
  ipcMain.handle(
    "delete-user",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const validId = IdSchema.parse(args);
      const res = await apiFetch(`/users/${validId}`, {
        method: "DELETE",
        token
      });

      return { success: true, data: res };
    }, "Erro ao excluir usuário")
  );
}
