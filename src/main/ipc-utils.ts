import { ZodError } from "zod";

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export function handleError(err: any, defaultMsg: string): ApiResponse {
  console.error("[IPC ERROR]", err);

  if (err instanceof ZodError) {
    return { success: false, error: err.issues?.[0]?.message ?? "Dados inválidos" };
  }

  if (err?.message) {
    return { success: false, error: err.message };
  }

  return { success: false, error: defaultMsg };
}

/**
 * 🔹 safeIpc — Envolve qualquer handler IPC em tratamento automático de erros.
 * 
 * @param handler  Função que será chamada pelo ipcMain.handle
 * @param defaultMsg Mensagem padrão caso ocorra erro
 */
export function safeIpc<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  defaultMsg: string
): (...args: Parameters<T>) => Promise<ApiResponse> {
  return async (...args: Parameters<T>) => {
    try {
      const result = await handler(...args);
      // se já for um objeto ApiResponse, retorna como está
      if (result && typeof result === "object" && "success" in result) return result;
      // se for algo direto (ex: array, string, etc.)
      return { success: true, data: result };
    } catch (err) {
      return handleError(err, defaultMsg);
    }
  };
}
