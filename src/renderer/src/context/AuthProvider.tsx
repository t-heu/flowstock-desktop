import React, { createContext, useContext, useEffect, useState } from "react";

import { useToast } from "./ToastProvider"

import departments from "../../../shared/config/departments.json";

export type DepartmentId = (typeof departments.allowed)[number]["id"];

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "operator";
  branchId: string;
  department: DepartmentId;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      try {
        const session = await window.api.loadSession();
        
        if (session.success) {
          setUser(session.data.user);
        } else {
          // sessão inválida (token expirado, etc)
          await logout();
        }

      } catch (err) {
        await logout();
        showToast("Conexão expirada!", "error");
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  async function logout() {
    await window.api.logout();
    setUser(null);
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
