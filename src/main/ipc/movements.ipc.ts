import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getMovements, createMovement, deleteMovement
} from "../services/movements";
import { 
  getBranchStock
} from "../services/branchStock";
import { IdSchema, MovementSchema } from "../schemas";

export function registerMovementsIPC() {
  ipcMain.handle("get-movements", authenticated(safeIpc(getMovements, "Erro ao obter movimentos")));
  
  ipcMain.handle("create-movement", authenticated(safeIpc(async (_, movement) => {
    const valid = MovementSchema.parse(movement);
    return await createMovement(valid);
  }, "Erro ao criar movimento")));

  ipcMain.handle("delete-movement", authenticated(safeIpc(async (_, id) => {
    const validId = IdSchema.parse(id);
    return await deleteMovement(validId);
  }, "Erro ao excluir movimento")));

  ipcMain.handle("get-branch-stock", authenticated(safeIpc(getBranchStock, "Erro ao obter estoque")));
}
