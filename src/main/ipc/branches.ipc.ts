// ipc/branches.ts
import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { readPersistedToken } from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerBranchesIPC() {
  // 🔹 Obter filiais
  ipcMain.handle(
    "get-branches",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      const res = await fetch(`${API_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error || "Erro ao obter filiais" };
      }

      const data = await res.json();
      return { success: true, data: data.data };
    }, "Erro ao obter filiais")
  );

  // 🔹 Adicionar filial
  ipcMain.handle(
    "add-branch",
    safeIpc(async (_, branch) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      const res = await fetch(`${API_URL}/branches`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(branch)
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao adicionar filial" };
      return { success: true, data: result };
    }, "Erro ao adicionar filial")
  );

  // 🔹 Excluir filial
  ipcMain.handle(
    "delete-branch",
    safeIpc(async (_, id) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Usuário não autenticado" };

      const res = await fetch(`${API_URL}/branches/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: result.error || "Erro ao excluir filial" };
      return { success: true };
    }, "Erro ao excluir filial")
  );
}
