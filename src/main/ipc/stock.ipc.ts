import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { readPersistedToken } from "../authSession";

export function registerStockIPC() {
  // 🔹 Obter estoque da filial
  ipcMain.handle(
    "get-stock",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await apiFetch(`/stock`, {
        token
      });

      return { success: true, data: res.data };
    }, "Erro ao obter estoque")
  );
}
