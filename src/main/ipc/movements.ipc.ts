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
  // 🔹 Obter movimentos
  ipcMain.handle(
    "get-movements",
    authenticated(
      safeIpc(async (user, typeFilter) => {
        return await getMovements(user, typeFilter);
      }, "Erro ao obter movimentos")
    )
  );

  // 🔹 Criar movimento
  ipcMain.handle(
    "create-movement",
    authenticated(
      safeIpc(async (_, movement) => {
        const valid = MovementSchema.parse(movement); // ZodError será capturado
        return await createMovement(valid); // { success, data?, error? }
      }, "Erro ao criar movimento")
    )
  );

  // 🔹 Excluir movimento
  ipcMain.handle(
    "delete-movement",
    authenticated(
      safeIpc(async (_, id) => {
        const validId = IdSchema.parse(id); // ZodError será capturado
        return await deleteMovement(validId); // { success, data?, error? }
      }, "Erro ao excluir movimento")
    )
  );

  // 🔹 Obter estoque da filial
  ipcMain.handle(
    "get-branch-stock",
    authenticated(
      safeIpc(async () => {
        return await getBranchStock(); // { success, data?, error? }
      }, "Erro ao obter estoque")
    )
  );
}
