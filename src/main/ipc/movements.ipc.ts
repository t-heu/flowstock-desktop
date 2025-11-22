import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { readPersistedToken } from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerMovementsIPC() {
  // 🔹 Obter movimentos
  ipcMain.handle(
    "get-movements",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const typeFilter = args || "";
      const res = await fetch(`${API_URL}/movements?type=${typeFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || "Erro ao obter movimentos" };
      }

      const data = await res.json();
      return { success: true, data: data.data };
    }, "Erro ao obter movimentos")
  );

  // 🔹 Criar movimento
  ipcMain.handle(
    "create-movement",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const movement = args;
      const res = await fetch(`${API_URL}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(movement),
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao criar movimento" };
      return { success: true, data: result };
    }, "Erro ao criar movimento")
  );

  // 🔹 Excluir movimento
  ipcMain.handle(
    "delete-movement",
    safeIpc(async (_, args) => {
      const token = args?.token ?? readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const id = args;
      const res = await fetch(`${API_URL}/movements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao excluir movimento" };
      return { success: true };
    }, "Erro ao excluir movimento")
  );

  // 🔹 Obter estoque da filial
  ipcMain.handle(
    "get-branch-stock",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await fetch(`${API_URL}/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || "Erro ao obter estoque" };
      }

      const data = await res.json();
      return { success: true, data: data.data };
    }, "Erro ao obter estoque")
  );
}
