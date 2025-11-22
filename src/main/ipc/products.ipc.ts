import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { ProductSchema, UpdateProductSchema, IdSchema } from "../schemas";
import { readPersistedToken } from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerProductIPC() {
  // 🔹 Obter produtos
  ipcMain.handle(
    "get-products",
    safeIpc(async () => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const res = await fetch(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || "Erro ao carregar produtos" };
      }

      const data = await res.json();
      return { success: true, data: data.data };
    }, "Erro ao carregar produtos")
  );

  // 🔹 Criar produto
  ipcMain.handle(
    "create-product",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const valid = ProductSchema.parse(args);
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(valid),
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao criar produto" };
      return { success: true, data: result };
    }, "Erro ao criar produto")
  );

  // 🔹 Atualizar produto
  ipcMain.handle(
    "update-product",
    safeIpc(async (_, args) => {
      const token = readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const { id, updates } = UpdateProductSchema.parse(args);
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao atualizar produto" };
      return { success: true, data: result };
    }, "Erro ao atualizar produto")
  );

  // 🔹 Excluir produto
  ipcMain.handle(
    "delete-product",
    safeIpc(async (_, args) => {
      const token = args?.token ?? readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const validId = IdSchema.parse(args);
      const res = await fetch(`${API_URL}/products/${validId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao excluir produto" };
      return { success: true };
    }, "Erro ao excluir produto")
  );
}
