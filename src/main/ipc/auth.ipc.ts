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

export function registerAuthIPC() {
  ipcMain.handle("auth:login", safeIpc(async (event, data) => {
    const { username, password } = LoginSchema.parse(data);

    const result = await loginUser(username, password);

    if (!result?.success) throw new Error("Credenciais inválidas");

    setTokenForWindow(event.sender.id, result.token);
    return result;
  }, "Erro ao fazer login"));

  ipcMain.handle("auth:logout", safeIpc(async (event) => {
    clearTokenForWindow(event.sender.id);
    return { success: true };
  }, "Erro ao fazer logout"));

  ipcMain.handle("auth:get-token", safeIpc(async (event) => {
    return getTokenForWindow(event.sender.id) ?? null;
  }, "Erro ao obter token"));

  ipcMain.handle("get-current-user",
    authenticated(safeIpc(getCurrentUser, "Erro ao obter usuário atual"))
  );
}
