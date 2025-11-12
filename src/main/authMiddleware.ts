import jwt from "jsonwebtoken";

import { JWT_SECRET } from "./config/jwt";
import { getTokenForWindow, clearTokenForWindow } from "./authSession";
//import { store } from "./store";

export function requireAuth(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // retorna dados do usuário
  } catch {
    throw new Error("Não autorizado");
  }
}

/**
 * Wrapper para IPCs autenticados
 */
export function authenticated(handler) {
  return async (event, ...args) => {
    //const token = store.get("auth.token") as string | null;;
    const senderId = event.sender.id;
    const token = getTokenForWindow(senderId);

    if (!token) throw new Error("Não autenticado");

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      //store.delete("auth.token");
      clearTokenForWindow(senderId);
      throw new Error("Sessão expirada, faça login novamente");
    }

    return await handler(decoded, ...args); // `decoded` contém { id, role, department, branchId }
  };
}
