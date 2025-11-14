import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  createUser, updateUser, getUsers, deleteUser
} from "../services/users";
import { CreateUserSchema, IdSchema } from "../schemas";

export function registerUserIPC() {
  ipcMain.handle("get-users", authenticated(safeIpc(getUsers, "Erro ao carregar usuários")));

  ipcMain.handle("create-user", authenticated(safeIpc(async (_, data) => {
    const parsed = CreateUserSchema.parse(data);
    await createUser(parsed);
    return { success: true };
  }, "Erro ao criar usuário")));

  ipcMain.handle("update-user", authenticated(safeIpc(async (_, { id, updates }) => {
    const validId = IdSchema.parse(id);
    return await updateUser(validId, updates);
  }, "Erro ao atualizar usuário")));

  ipcMain.handle("delete-user", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteUser(validId);
  }, "Erro ao excluir usuário")));
}
