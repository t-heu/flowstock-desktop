import { User } from "../types";

type UserSession = {
  uid: string;
  role: "admin" | "manager" | "operator"; 
  department: string; // ex: "RH", "Transporte", "Logística", etc
}

export function checkPermission(
  user: UserSession | null,
  allowedRoles: Array<User["role"]>
) {
  if (!user) {
    return { ok: false, error: "Usuário não autenticado" };
  }

  if (!allowedRoles.includes(user.role)) {
    return { ok: false, error: "Você não tem permissão para realizar esta ação" };
  }

  return { ok: true };
}
