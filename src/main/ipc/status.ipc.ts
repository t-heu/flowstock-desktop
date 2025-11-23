import { ipcMain } from "electron";
import { apiFetch } from "../apiClient";

export function initStatusIPC() {
  ipcMain.handle("get-service-status", async () => {
    try {
      const res = await apiFetch("/health");

      return {
        success: true,
        data: {
          api: res.api || "offline",
          database: res.database || "offline",
          status: res.status === "ok" ? "ok" : "error",
        },
      };
    } catch (err) {
      return {
        success: false,
        data: {
          api: "offline",
          database: "offline",
          status: "error",
        },
      };
    }
  });
}
