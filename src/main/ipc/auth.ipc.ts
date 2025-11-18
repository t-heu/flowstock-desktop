import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { LoginSchema } from "../schemas";
import { loginUser } from "../services/login";

import {
  savePersistedToken,
  readPersistedToken,
  clearPersistedToken,
  savePersistedUser,
  readPersistedUser,
  clearPersistedUser
} from "../authSession";

import {
  invalidateBranchCache,
  invalidateBranchStockCache,
  invalidateMovementsCache,
  invalidateProductCache
} from "../cache";

export function registerAuthIPC() {

  // ============================================================
  // LOGIN
  // ============================================================
  ipcMain.handle(
    "auth:login",
    safeIpc(async (event, data) => {
      const { username, password } = LoginSchema.parse(data);
      const result = await loginUser(username, password);

      if (!result?.success || !result.token) {
        return { success: false, error: result?.error || "Credenciais inválidas" };
      }

      // Salva token e user
      savePersistedToken(result.token);
      savePersistedUser(result.user);

      return {
        success: true,
        data: {
          user: result.user,
          token: result.token
        }
      };
    }, "Erro ao fazer login")
  );

  // ============================================================
  // RESTAURAR SESSÃO (startup)
  // ============================================================
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

  // ============================================================
  // LOGOUT
  // ============================================================
  ipcMain.handle(
    "auth:logout",
    safeIpc(async () => {

      clearPersistedToken();
      clearPersistedUser();

      invalidateProductCache();
      invalidateBranchCache();
      invalidateBranchStockCache();
      invalidateMovementsCache();

      return { success: true };
    }, "Erro ao fazer logout")
  );

  // ============================================================
  // GET TOKEN
  // ============================================================
  ipcMain.handle(
    "auth:get-token",
    safeIpc(async () => {
      return {
        success: true,
        data: readPersistedToken() ?? null
      };
    }, "Erro ao obter token")
  );
}
