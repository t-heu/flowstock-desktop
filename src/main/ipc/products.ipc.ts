import { ipcMain } from "electron";

import { apiFetch } from "../apiClient";
import { safeIpc } from "../ipc-utils";
import { ProductSchema, UpdateProductSchema, IdSchema } from "../schemas";
import { readPersistedToken } from "../authSession";

export function registerProductIPC() {
  // 🔹 Obter produtos
  ipcMain.handle(
    "get-products",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await apiFetch(`/products`, {
        token
      });

      return { success: true, data: res.data };
    }, "Erro ao carregar produtos")
  );

  // 🔹 Criar produto
  ipcMain.handle(
    "create-product",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const valid = ProductSchema.parse(args);
      const res = await apiFetch(`/products`, {
        method: "POST",
        token,
        body: valid,
      });

      return { success: true, data: res };
    }, "Erro ao criar produto")
  );

  // 🔹 Atualizar produto
  ipcMain.handle(
    "update-product",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const { id, updates } = UpdateProductSchema.parse(args);
      
      const res = await apiFetch(`/products/${id}`, {
        method: "PUT",
        token,
        body: updates,
      });

      return { success: true, data: res };
    }, "Erro ao atualizar produto")
  );

  // 🔹 Excluir produto
  ipcMain.handle(
    "delete-product",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const validId = IdSchema.parse(args);
      await apiFetch(`/products/${validId}`, {
        method: "DELETE",
        token
      });

      return { success: true };
    }, "Erro ao excluir produto")
  );
}
