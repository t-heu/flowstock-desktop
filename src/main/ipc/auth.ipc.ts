import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { 
  savePersistedToken,
  readPersistedToken,
  clearPersistedToken,
  savePersistedUser,
  clearPersistedUser,
  readPersistedUser
} from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerAuthIPC() {
  ipcMain.handle(
    "auth:login",
    safeIpc(async (_, { username, password }) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Credenciais inválidas" };
      
      // salva token e usuário localmente
      savePersistedToken(result.token);
      savePersistedUser(result.user);

      return { success: true, data: result };
    }, "Erro ao fazer login")
  );

   ipcMain.handle(
    "auth:load-session",
    safeIpc(async () => {
      const token = readPersistedToken();
      const user = readPersistedUser();
      
      if (!token || !user) {
        return { success: false, error: "session_missing" };
      }

      return {
        success: true,
        data: { token, user }
      };
    }, "Erro ao restaurar sessão")
  );

  ipcMain.handle(
    "auth:logout",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // limpa token e user localmente
      clearPersistedToken();
      clearPersistedUser();

      return { success: true };
    }, "Erro ao fazer logout")
  );

  ipcMain.handle(
    "auth:get-token",
    safeIpc(async () => {
      const token = readPersistedToken();
      return { success: true, data: token };
    }, "Erro ao obter token")
  );
}
