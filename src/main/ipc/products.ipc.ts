import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../services/products";
import { ProductSchema, UpdateProductSchema, IdSchema } from "../schemas";

export function registerProductIPC() {
  ipcMain.handle("get-products", authenticated(safeIpc(getProducts, "Erro ao carregar produtos")));

  ipcMain.handle("create-product", authenticated(safeIpc(async (user, data) => {
    const product = ProductSchema.parse(data);
    return await createProduct(user, product);
  }, "Erro ao criar produto")));

  ipcMain.handle("update-product", authenticated(safeIpc(async (user, payload) => {
    const { id, updates } = UpdateProductSchema.parse(payload);
    
    return await updateProduct(user, id, updates);
  }, "Erro ao atualizar produto")));

  ipcMain.handle("delete-product", authenticated(safeIpc(async (user, id) => {
    const validId = IdSchema.parse(id);
    return await deleteProduct(user, validId);
  }, "Erro ao excluir produto")));
}
