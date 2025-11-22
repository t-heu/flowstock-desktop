import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { readPersistedToken } from "../authSession";

export function registerMovementsIPC() {
  // 🔹 Obter movimentos
  ipcMain.handle(
    "get-movements",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const typeFilter = args || "";
      const res = await apiFetch(`/movements?type=${typeFilter}`, {
        token,
      });

      return { success: true, data: res.data };
    }, "Erro ao obter movimentos")
  );

  // 🔹 Criar movimento
  ipcMain.handle(
    "create-movement",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const movement = args;
      const res = await apiFetch(`/movements`, {
        method: "POST",
        token,
        body: movement,
      });

      return { success: true, data: res };
    }, "Erro ao criar movimento")
  );

  // 🔹 Excluir movimento
  ipcMain.handle(
    "delete-movement",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const id = args;
      await apiFetch(`/movements/${id}`, {
        method: "DELETE",
        token
      });

      return { success: true };
    }, "Erro ao excluir movimento")
  );
}
