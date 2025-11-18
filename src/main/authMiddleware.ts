import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config/jwt";

import { readPersistedToken, clearPersistedToken } from "./authSession";

export function authenticated(handler) {
  return async (_event, ...args) => {

    const token = readPersistedToken();
    if (!token) {
      return { success: false, error: "Não autenticado" };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      clearPersistedToken();
      return { success: false, error: "Sessão expirada, faça login novamente" };
    }

    return await handler(decoded, ...args);
  };
}
