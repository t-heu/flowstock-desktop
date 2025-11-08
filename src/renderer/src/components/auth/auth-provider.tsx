import React, { createContext, useContext, useEffect, useState } from "react"

export interface User {
  id: string
  username: string
  name: string
  role: "admin" | "manager" | "operator"
  branchId: string
  department: "rh" | "transferencia" // ✅ novo
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
  const [token, setToken] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const current = await window.api.getCurrentUser(token)
        if (current.success) setUser(current.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [token])

  async function login(username: string, password: string) {
    try {
      const loggedUser = await window.api.loginUser(username, password)
      if (loggedUser.success) {
        setToken(loggedUser.token)
        setUser(loggedUser.user)
        return true
      }
      return false
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async function logout() {
    setUser(null)
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
