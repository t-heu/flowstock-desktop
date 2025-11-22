import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { 
  readPersistedToken,
} from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerStatsIPC() {
  ipcMain.handle(
    "get-stats",
    safeIpc(async (_, args) => { // default = {}
      const branchFilter = args;
      const token = readPersistedToken();

      if (!token) return { success: false, error: "Falta de token" };
      
      const url = `${API_URL}/stats${branchFilter ? `?branch=${branchFilter}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || "Erro ao obter estatísticas" };
      }

      const data = await res.json();
      return { success: true, data: data.data };
    }, "Erro ao obter estatísticas")
  );
}
