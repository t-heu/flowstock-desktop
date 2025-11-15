import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getBranches, addBranch, deleteBranch
} from "../services/branches";
import { BranchSchema, IdSchema } from "../schemas";

export function registerBranchesIPC() {
  // 🔹 Obter filiais
  ipcMain.handle(
    "get-branches",
    authenticated(
      safeIpc(async () => {
        return await getBranches(); // já retorna { success, data?, error? }
      }, "Erro ao obter filiais")
    )
  );

  // 🔹 Adicionar filial
  ipcMain.handle(
    "add-branch",
    authenticated(
      safeIpc(async (_, data) => {
        const branch = BranchSchema.parse(data); // ZodError será capturado pelo safeIpc
        return await addBranch(branch); // { success, data?, error? }
      }, "Erro ao adicionar filial")
    )
  );

  // 🔹 Excluir filial
  ipcMain.handle(
    "delete-branch",
    authenticated(
      safeIpc(async (_, id) => {
        const validId = IdSchema.parse(id); // ZodError será capturado
        return await deleteBranch(validId); // { success, data?, error? }
      }, "Erro ao excluir filial")
    )
  );
}
