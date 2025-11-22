import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { readPersistedToken } from "../authSession";

export function registerBranchesIPC() {
  // 🔹 Obter filiais
  ipcMain.handle(
    "get-branches",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      const res = await apiFetch(`/branches`, {
        token
      });

      return { success: true, data: res.data };
    }, "Erro ao obter filiais")
  );

  // 🔹 Adicionar filial
  ipcMain.handle(
    "add-branch",
    safeIpc(async (_, branch) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      const res = await apiFetch(`/branches`, {
        method: "POST",
        token,
        body: branch
      });

      return { success: true, data: res };
    }, "Erro ao adicionar filial")
  );

  // 🔹 Excluir filial
  ipcMain.handle(
    "delete-branch",
    safeIpc(async (_, id) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      await apiFetch(`/branches/${id}`, {
        method: "DELETE",
        token
      });

      return { success: true };
    }, "Erro ao excluir filial")
  );
}
