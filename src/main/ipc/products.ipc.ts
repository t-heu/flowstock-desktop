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
  // 🔹 Obter produtos
  ipcMain.handle(
    "get-products",
    authenticated(
      safeIpc(async (user) => {
        return await getProducts(user); // já retorna { success, data?, error? }
      }, "Erro ao carregar produtos")
    )
  );

  // 🔹 Criar produto
  ipcMain.handle(
    "create-product",
    authenticated(
      safeIpc(async (user, data) => {
        const product = ProductSchema.parse(data); // ZodError será capturado pelo safeIpc
        return await createProduct(user, product); // { success, data?, error? }
      }, "Erro ao criar produto")
    )
  );

  // 🔹 Atualizar produto
  ipcMain.handle(
    "update-product",
    authenticated(
      safeIpc(async (user, payload) => {
        const { id, updates } = UpdateProductSchema.parse(payload);
        return await updateProduct(user, id, updates);
      }, "Erro ao atualizar produto")
    )
  );

  // 🔹 Excluir produto
  ipcMain.handle(
    "delete-product",
    authenticated(
      safeIpc(async (user, id) => {
        const validId = IdSchema.parse(id);
        return await deleteProduct(user, validId);
      }, "Erro ao excluir produto")
    )
  );
}
