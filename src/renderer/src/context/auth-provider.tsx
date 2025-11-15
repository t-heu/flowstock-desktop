import React, { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"

import departments from "../../../shared/config/departments.json";

export type DepartmentId = (typeof departments.allowed)[number]["id"];

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "admin" | "manager" | "operator"
  branchId: string
  department: DepartmentId
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  setUser: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const response = await window.api.getCurrentUser();

      if (response?.success) {
        setUser(response.user);
      } else {
        if (user !== null) {
          toast.error(response?.error || "Falha ao obter usuário atual");
        }
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  async function logout() {
    try {
      setUser(null)
      await window.api.logout()
      toast.success("Logout realizado com sucesso!")
    } catch (err: any) {
      console.error("Erro ao deslogar:", err)
      toast.error("Falha ao deslogar: " + (err?.message || "Erro desconhecido"))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
