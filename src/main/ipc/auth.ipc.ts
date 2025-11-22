import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { 
  savePersistedToken,
  readPersistedToken,
  clearPersistedToken,
  savePersistedUser,
  clearPersistedUser,
  readPersistedUser
} from "../authSession";

export function registerAuthIPC() {
  ipcMain.handle(
    "auth:login",
    safeIpc(async (_, { username, password }) => {
      const res = await apiFetch(`/auth/login`, {
        method: "POST",
        body: { username, password },
      });
      
      // salva token e usuário localmente
      savePersistedToken(res.token);
      savePersistedUser(res.user);

      return { success: true, data: res };
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
