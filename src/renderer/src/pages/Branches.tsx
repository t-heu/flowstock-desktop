import { useEffect, useState, useCallback } from "react";
import { Building2, PlusCircle, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Branch {
  id: string;
  name: string;
  code: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const loadBranches = useCallback(async () => {
    try {
      const response = await window.api.getBranches();
      if (response?.success && Array.isArray(response.data)) {
        setBranches(response.data);
      } else {
        toast.error(response?.error || "Erro ao carregar filiais 😢");
        setBranches([]);
      }
    } catch (e) {
      console.log(e)
    }
  }, []);

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return toast.error("Preencha todos os campos ⚠️");

    const { error, success } = await window.api.addBranch(formData);
    if (success) {
      setFormData({ name: "", code: "" });
      await loadBranches();
      toast.success("Filial criada com sucesso! 🎉");
    } else {
      toast.error(error || "Erro ao criar filial ❌");
    }
  };

  const handleDelete = useCallback(
    async (id: string) => {
      const confirmed = await window.api.confirmDialog({
        message: "Tem certeza que deseja excluir esta filial? 🏢",
      });
      if (!confirmed) return;

      const result = await window.api.deleteBranch(id);
      if (result.success) {
        await loadBranches();
        toast.success("Filial removida 🗑️");
      } else {
        toast.error(result.error || "Erro ao excluir filial ❌");
      }
    },
    [loadBranches]
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Filiais</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie as filiais da sua empresa</p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-6 h-6 text-[#111]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nova Filial</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="code"
            placeholder="Código"
            value={formData.code}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 focus:outline-none bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-black dark:text-white"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Nome da Filial"
            value={formData.name}
            onChange={handleChange}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 focus:outline-none bg-white dark:bg-slate-700 rounded-sm focus:ring-2 focus:ring-black dark:text-white"
            required
          />
          <button
            type="submit"
            className="col-span-2 px-6 py-2.5 flex items-center justify-center gap-2 bg-[#111] hover:bg-[#333] text-white rounded-sm font-medium transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Adicionar Filial
          </button>
        </form>
      </div>

      {/* Branch Table */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filiais Cadastradas</h3>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Código</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nome</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma filial cadastrada.
                </td>
              </tr>
            ) : (
              branches.map((b) => (
                <tr key={b.id} className="border-b border-gray-200 dark:border-slate-700">
                  <td className="p-4 text-sm text-gray-900 dark:text-white">{b.code}</td>
                  <td className="p-4 text-sm text-gray-900 dark:text-white">{b.name}</td>
                  <td className="p-4">
                    <button
                      title="delete"
                      onClick={() => handleDelete(b.id)}
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
  );
}
