import { useState } from "react"
import toast from "react-hot-toast"
import { User as UserIcon, Save } from "lucide-react"

import { useAuth } from "../context/auth-provider"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Usuário não autenticado.")
      return
    }

    setIsSaving(true)

    try {
      const payload: Record<string, string> = { name: formData.name }
      if (formData.password.trim()) payload.password = formData.password

      const result = await window.api.updateUser({
        id: user.id,
        updates: payload,
      })

      if (result?.success) {
        toast.success("Perfil atualizado com sucesso!")

        // 🔹 Atualiza state global do usuário
        setUser({ ...user, ...payload })
        localStorage.setItem("auth_user", JSON.stringify(result.data.user));

        // 🔹 Limpa senha do form
        setFormData(prev => ({ ...prev, password: "" }))
      } else {
        toast.error(result?.error || "Erro ao atualizar perfil.")
      }
    } catch (err: any) {
      console.error("Erro ao atualizar perfil:", err)
      toast.error(err?.message || "Falha ao atualizar perfil.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <UserIcon className="w-8 h-8 text-[#111]" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="email"
            disabled
            placeholder="E-mail"
            value={user?.email || ""}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-[#eee] dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          />

          <input
            type="password"
            placeholder="Nova senha (opcional)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-6 py-2.5 flex items-center justify-center gap-2 bg-[#2c5396] hover:bg-[#666] text-white rounded-sm font-medium transition-colors disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </div>
  )
}
