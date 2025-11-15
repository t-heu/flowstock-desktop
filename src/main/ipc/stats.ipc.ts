import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { getStats } from "../services/stats";

export function registerStatsIPC() {
  ipcMain.handle(
    "get-stats",
    authenticated(
      safeIpc(async (event, data) => {
        return await getStats(event, data); // { success, data?, error? }
      }, "Erro ao obter estatísticas")
    )
  );
}
