import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  createUser, updateUser, getUsers, deleteUser
} from "../services/users";
import { CreateUserSchema, IdSchema } from "../schemas";

export function registerUserIPC() {
  // 🔹 Obter usuários
  ipcMain.handle(
    "get-users",
    authenticated(
      safeIpc(async () => {
        return await getUsers(); // já retorna { success, data?, error? }
      }, "Erro ao carregar usuários")
    )
  );

  // 🔹 Criar usuário
  ipcMain.handle(
    "create-user",
    authenticated(
      safeIpc(async (_, data) => {
        const parsed = CreateUserSchema.parse(data); // ZodError será capturado
        return await createUser(parsed); // { success, data?, error? }
      }, "Erro ao criar usuário")
    )
  );

  // 🔹 Atualizar usuário
  ipcMain.handle(
    "update-user",
    authenticated(
      safeIpc(async (_, { id, updates }) => {
        const validId = IdSchema.parse(id); // ZodError será capturado
        return await updateUser(validId, updates); // { success, data?, error? }
      }, "Erro ao atualizar usuário")
    )
  );

  // 🔹 Excluir usuário
  ipcMain.handle(
    "delete-user",
    authenticated(
      safeIpc(async (_, id) => {
        const validId = IdSchema.parse(id); // ZodError será capturado
        return await deleteUser(validId); // { success, data?, error? }
      }, "Erro ao excluir usuário")
    )
  );
}
