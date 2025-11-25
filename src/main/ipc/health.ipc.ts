import { ipcMain } from "electron";
import { apiFetch } from "../apiClient";

export function initHealthIPC() {
  ipcMain.handle("healthcheck", async () => {
    try {
      const res = await apiFetch("/health");

      return {
        success: true,
        data: {
          api: {
            status: res.api?.status ?? "unknown",
            uptime: res.api?.uptime ?? null,
            version: res.api?.version ?? null,
          },
          database: {
            status: res.database?.status ?? "unknown",
            latency_ms: res.database?.latency_ms ?? null,
            version: res.database?.version ?? null,
          },
          status:
            res.api?.status === "healthy" &&
            res.database?.status === "healthy"
              ? "ok"
              : "error",
        },
      };
    } catch (err) {
      return {
        success: false,
        data: {
          api: {
            status: "offline",
            uptime: null,
            version: null,
          },
          database: {
            status: "offline",
            latency_ms: null,
            version: null,
          },
          status: "error",
        },
      };
    }
  });
}
