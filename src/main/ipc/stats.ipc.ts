import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { 
  readPersistedToken,
} from "../authSession";

export function registerStatsIPC() {
  ipcMain.handle(
    "get-stats",
    safeIpc(async (_, args) => { // default = {}
      const branchFilter = args;
      const token = readPersistedToken();

      if (!token) return { success: false, error: "Falta de token" };
      
      const url = `/stats${branchFilter ? `?branch=${branchFilter}` : ""}`;
      const res = await apiFetch(url, {token});

      const data = res;
      return { success: true, data: data.data };
    }, "Erro ao obter estatísticas")
  );
}
