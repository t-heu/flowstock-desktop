import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getBranches, addBranch, deleteBranch
} from "../services/branches";
import { BranchSchema, IdSchema } from "../schemas";

export function registerBranchesIPC() {
  ipcMain.handle("get-branches", authenticated(safeIpc(getBranches, "Erro ao obter filiais")));
  
  ipcMain.handle("add-branch", authenticated(safeIpc(async (_, data) => {
    const branch = BranchSchema.parse(data);
    return await addBranch(branch);
  }, "Erro ao adicionar filial")));

  ipcMain.handle("delete-branch", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteBranch(validId);
  }, "Erro ao excluir filial")));
}
