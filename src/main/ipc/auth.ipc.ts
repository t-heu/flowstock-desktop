import { ipcMain } from "electron";

import { safeIpc } from "../ipc-utils";
import { LoginSchema } from "../schemas";
import { loginUser } from "../services/auth/login";
import { getCurrentUser } from "../services/auth/profile";
import { authenticated } from "../authMiddleware";
import { 
  setTokenForWindow,
  clearTokenForWindow,
  getTokenForWindow 
} from "../authSession";
import { 
  invalidateBranchCache,
  invalidateBranchStockCache,
  invalidateMovementsCache,
  invalidateProductCache
} from "../cache";

export function registerAuthIPC() {
  // 🔹 Login
  ipcMain.handle(
    "auth:login",
    safeIpc(async (event, data) => {
      const { username, password } = LoginSchema.parse(data); // ZodError será capturado
      const result = await loginUser(username, password);

      if (!result?.success || !result.token) {
        return { success: false, error: result?.error || "Credenciais inválidas" };
      }

      setTokenForWindow(event.sender.id, result.token);

      return { success: true, data: { user: result.user, token: result.token } };
    }, "Erro ao fazer login")
  );

  // 🔹 Logout
  ipcMain.handle(
    "auth:logout",
    safeIpc(async (event) => {
      clearTokenForWindow(event.sender.id);

      invalidateProductCache();
      invalidateBranchCache();
      invalidateBranchStockCache();
      invalidateMovementsCache();

      return { success: true };
    }, "Erro ao fazer logout")
  );

  // 🔹 Obter token
  ipcMain.handle(
    "auth:get-token",
    safeIpc(async (event) => {
      const token = getTokenForWindow(event.sender.id) ?? null;
      return { success: true, data: token };
    }, "Erro ao obter token")
  );

  // 🔹 Obter usuário atual
  ipcMain.handle(
    "get-current-user",
    authenticated(
      safeIpc(async (userId) => {
        return await getCurrentUser(userId); // já retorna { success, user?, error? }
      }, "Erro ao obter usuário atual")
    )
  );
}
