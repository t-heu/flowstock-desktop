import { useEffect, useState } from "react"
import { UserPlus } from "lucide-react"

interface Branch {
  id: string
  name: string
}

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
}

export default function UsersPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<any>({ name: "", email: "", username: "", branchId: "", role: "user", password: "" })

  // 🔹 Carrega filiais e usuários
  useEffect(() => {
    const load = async () => {
      try {
        const [branchesData, usersData] = await Promise.all([window.api.getBranches(), window.api.getUsers()]);
        setBranches(branchesData);
        setUsers(usersData);
      } catch (err) {
        console.error("Erro ao carregar usuários ou filiais:", err);
        alert("Falha ao carregar dados. Tente novamente mais tarde.");
      }
    }
    load()
  }, [])

  // 🔹 Cria novo usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.branchId) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await window.api.createUser(formData);

      // Reseta formulário
      setFormData({ name: "", username: "", email: "", branchId: "", role: "user", password: "" });

      alert("Usuário criado com sucesso!");
    } catch (err: any) {
      alert(err.message || "Erro ao criar usuário");
    }
  };

  // 🔹 Remove usuário
  const handleDelete = async (id: string) => {
    try {
      await window.api.deleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch(e) {
      console.error("Falha ao salvar o movimento:", e)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Usuários</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie os usuários e atribua filiais</p>
      </div>

      {/* Formulário */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Usuário</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="username"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <input
            type="password"
            placeholder="Senha"
            value={formData.password || ""}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
            required
          />

          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
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
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "admin" | "user" | "manager" })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
            <option value="manager">Manager</option> 
          </select>

          <button
            type="submit"
            className="w-full px-6 py-2.5 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nome</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Username</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">E-mail</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
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
                  <td className="p-4 text-sm text-gray-900 dark:text-white">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
