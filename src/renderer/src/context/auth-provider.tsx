import React, { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  username: string
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

      if (res.success) {
        await window.api.saveToken(res.token) // ✅ agora salva no electron-store
        setUser(res.user)
        return true
      }

      return false
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async function logout() {
    setUser(null)
    await window.api.logout() // ✅ remove token do store
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
