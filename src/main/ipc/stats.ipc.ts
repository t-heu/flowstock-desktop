import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { getStats } from "../services/stats";

export function registerStatsIPC() {
  ipcMain.handle(
    "get-stats",
    authenticated(safeIpc(getStats, "Erro ao obter estatísticas"))
  );
}
