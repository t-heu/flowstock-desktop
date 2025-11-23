import { ipcMain } from "electron";
import { apiFetch } from "../apiClient";

export function initStatusIPC() {
  ipcMain.handle("get-service-status", async () => {
    try {
      const res = await apiFetch("/health");

      // garante que tenha api, database e status
      return {
        success: true,
        data: {
          api: res.api || "offline",
          database: res.database || "offline",
          auth: res.auth || "offline",
          status: res.status === "ok" ? "ok" : "error",
        },
      };
    } catch (err) {
      return {
        success: false,
        data: {
          api: "offline",
          auth: "offline",
          database: "offline",
          status: "error",
        },
      };
    }
  });
}
