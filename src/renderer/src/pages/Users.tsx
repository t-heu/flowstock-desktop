import { useEffect, useState } from "react"
import { UserPlus } from "lucide-react"
import { Trash2, Pencil } from "lucide-react"

import { useToast } from "../context/ToastProvider"
import {Branch} from "../../../shared/types"
import departments from "../../../shared/config/departments.json";

interface User {
  id: string
  name: string
  email: string
  username: string
  branchId: string
  branch?: {
    name: string
  }
  role: "admin" | "user" | "manager"
  department: string | null
  password?: string
}

export default function UsersPage() {
  const { showToast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<any>({ name: "", email: "", department: "", username: "", branchId: "", role: "operator" })
  const [editUser, setEditUser] = useState<User | null>(null);

  // 🔹 Carrega filiais e usuários
  useEffect(() => {
    const load = async () => {
      try {
        const [branchesData, usersData] = await Promise.all([
          window.api.getBranches(),
          window.api.getUsers()
        ])

        setBranches(branchesData.data || [])
        setUsers(usersData.data || [])
      } catch (error: any) {
        console.error("Erro ao carregar dados iniciais:", error)
        showToast("Falha ao carregar dados. Tente novamente mais tarde.", "error")
      }
    }

    load()
  }, [])

  // 🔹 Criar novo usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.branchId) {
      showToast("Preencha todos os campos obrigatórios.", "error")
      return
    }

    try {
      const result = await window.api.createUser(formData)
      
      if (!result?.success) {
        const msg = result?.error || "Erro ao criar usuário."
        showToast(msg, "error")
        return
      }

      // ✅ Reseta formulário
      setFormData({
        name: "",
        username: "",
        email: "",
        department: "",
        branchId: "",
        role: "operator"
      })

      // Atualiza lista local sem recarregar toda a página
      const updatedUsers = await window.api.getUsers()
      setUsers(updatedUsers.data || [])

      showToast("Usuário criado com sucesso!", "success")
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error)
      showToast("Erro: " + (error?.message || "Falha ao criar usuário.", "error"))
    }
  }

  // 🔹 Editar usuário
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return

    const payload = { ...editUser }
    if (!payload.password) delete payload.password

    try {
      const result = await window.api.updateUser({
        id: editUser.id,
        updates: payload
      })

      if (!result?.success) {
        const msg = result?.error || "Erro ao atualizar usuário."
        showToast(msg, "error")
        return
      }

      // Atualiza lista local
      const data = users.map(u => (u.id === editUser.id ? { ...u, ...payload } : u)) || [];
      setUsers(data)
      setEditUser(null)

      showToast("Usuário atualizado com sucesso!", "success")
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error)
      showToast("Erro: " + (error?.message || "Falha ao atualizar usuário.", "error"))
    }
  }

  // 🔹 Remover usuário
  const handleDelete = async (id: string) => {
    const response = await window.api.confirmDialog({
      message: "Tem certeza que deseja excluir este usuário?"
    })

    if (!response) return

    try {
      const result = await window.api.deleteUser(id)

      if (!result?.success) {
        const msg = result?.error || "Erro ao excluir usuário."
        showToast(msg, "error")
        return
      }

      setUsers(users.filter(u => u.id !== id))
      showToast("Usuário excluído com sucesso!", "success")
    } catch (error: any) {
      console.error("Erro ao excluir usuário:", error)
      showToast("Falha ao excluir usuário: " + (error?.message || "Erro desconhecido", "error"))
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-sm shadow-lg max-w-md w-full space-y-4">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Editar Usuário</h2>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                type="text"
                className="w-full px-3 py-2 rounded border dark:bg-slate-700 dark:text-white"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />

              <input
                type="email"
                className="w-full px-3 py-2 rounded border dark:bg-slate-700 dark:text-white"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />

              <input
                type="password"
                placeholder="Nova senha (opcional)"
                className="w-full px-3 py-2 rounded border dark:bg-slate-700 dark:text-white"
                value={editUser.password ?? ""}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              />

              <select
                className="w-full px-3 py-2 rounded border dark:bg-slate-700 dark:text-white"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value as User["role"] })}
              >
                <option value="operator">Operador</option>
                <option value="admin">Administrador</option>
                <option value="manager">Manager</option>
              </select>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 bg-gray-500 hover:bg-[#666] text-white rounded">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-[#2c5396] hover:bg-[#666] text-white rounded">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie os usuários e atribua filiais</p>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-[#2c5396] dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Usuário</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="username"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          >
            <option value="">Selecione uma filial</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={formData.role}
            required
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "operator" | "manager" })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="operator">Operador</option>
            <option value="admin">Administrador</option>
            <option value="manager">Manager</option> 
          </select>

          <select
            value={formData.department}
            required
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="" disabled>Selecione...</option>
            {departments.allowed.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full px-6 py-2.5 flex items-center justify-center gap-2 bg-[#2c5396] hover:bg-[#666] text-white rounded-sm font-medium transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        </form>
      </div>

      {/* Lista de usuários */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Usuários Cadastrados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nome</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Username</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">E-mail</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Departamento</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(users) || users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 dark:border-slate-700">
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{u.name}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{u.username}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">
                      {u.branch?.name}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{u.role}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{u.department}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white flex gap-3">
                      <button
                        title="Editar"
                        onClick={() => setEditUser(u)}
                        className="text-[#2c5396] hover:text-blue-800 transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>

                      <button
                        title="Excluir"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
