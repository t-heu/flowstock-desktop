import React, { createContext, useContext, useEffect, useState } from "react"
import toast from "react-hot-toast"

export interface User {
  id: string
  username: string
  email: string
  name: string
  role: "admin" | "manager" | "operator"
  branchId: string
  department: "rh" | "transferencia"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await window.api.getCurrentUser()
        if (response?.success) setUser(response.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])
  
  async function login(username: string, password: string) {
    try {
      const res = await window.api.loginUser(username, password)

      if (res?.success) {
        setUser(res.user)
        toast.success("Login realizado com sucesso!")
        return true
      }

      return false
    } catch (err: any) {
      console.error("Erro no login:", err)
      toast.error("Falha ao tentar logar: " + (err?.message || "Erro desconhecido"))
      return false
    }
  }

  async function logout() {
    try {
      setUser(null)
      await window.api.logout() // ✅ remove token do store
      toast.success("Logout realizado com sucesso!")
    } catch (err: any) {
      console.error("Erro ao deslogar:", err)
      toast.error("Falha ao deslogar: " + (err?.message || "Erro desconhecido"))
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
