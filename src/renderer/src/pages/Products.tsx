import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Package, Pencil, Ban } from "lucide-react";

import { useToast } from "../context/ToastProvider";
import { useAuth } from "../context/AuthProvider";
import departments from "../../../shared/config/departments.json";
import { ProductDTO, Product } from "../../../shared/types";
import { useProductsAndBranches } from "../hooks/useProductsAndBranches";

export default function ProductsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const { products, refresh } = useProductsAndBranches();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<ProductDTO>({
    code: "",
    name: "",
    description: "",
    unit: "UN",
    department: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFormOpen && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isFormOpen]);

  // ----------------------------------------------
  // HANDLE SUBMIT (CREATE / UPDATE)
  // ----------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const result = await window.api.updateProduct({
          id: editingProduct.id,
          updates: formData,
        });
        if (!result.success) {
          showToast("Erro ao atualizar", "error")
          return;
        };
        showToast("Produto atualizado!", "success");
      } else {
        const result = await window.api.createProduct(formData);
        if (!result.success) {
          showToast("Erro ao criar", "error")
          return
        };
        showToast("Produto criado!", "success");
      }

      // Recarrega a lista via hook
      refresh();

      // Reset form
      setFormData({
        code: "",
        name: "",
        description: "",
        unit: "UN",
        department: "",
      });
      setEditingProduct(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Falha ao salvar", "error");
    }
  };

  // ----------------------------------------------
  // DELETE PRODUCT
  // ----------------------------------------------
  const handleDelete = async (id: string) => {
    try {
      const confirm = await window.api.confirmDialog({
        message: "Deseja excluir este produto?",
      });
      if (!confirm) return;

      const result = await window.api.deleteProduct(id);
      if (!result.success) {
        showToast("Erro ao excluir", "error")
        return
      };

      showToast("Produto excluído!", "success");
      refresh();
    } catch (err) {
      console.error(err);
      showToast("Falha ao excluir", "error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsFormOpen(true);
  };

  if (!products) return <div>Carregando...</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Produtos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie os produtos do estoque</p>
        </div>
        {["admin", "manager"].includes(user?.role ?? "") && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="pointer flex items-center gap-2 px-4 py-2.5 bg-[#2c5396] hover:bg-[#333] text-white rounded-sm font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Produto
          </button>
        )}
      </div>

      {isFormOpen && (
        <div ref={formRef} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingProduct ? "Editar Produto" : "Adicionar Produto"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código
                  <span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: PROD-001"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unidade
                  <span className="text-red-600"> *</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                  required
                >
                  <option value="UN">Unidade</option>
                  <option value="CX">Caixa</option>
                  <option value="KG">Quilograma</option>
                  <option value="LT">Litro</option>
                  <option value="MT">Metro</option>
                  <option value="FD">Fardo</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Produto
                <span className="text-red-600"> *</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Caneta Azul"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Departamento
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as ProductDTO["department"] })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              >
                <option value="" disabled>Selecione...</option>
                {departments.allowed.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do produto"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#2c5396] hover:bg-[#333] text-white rounded-sm font-medium transition-colors"
              >
                {editingProduct ? "Atualizar Produto" : "Salvar Produto"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Código</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nome</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Descrição</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Unidade</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Departamento</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500 dark:text-gray-400">
                      <Package className="w-6 h-6 opacity-70" />
                      <p>Nenhuma saída registrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">{product.code}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{product.name}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{product.description}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{product.unit}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{product.department}</td>
                    <td className="p-4 flex justify-center items-center gap-3">
                      {["admin", "manager"].includes(user?.role ?? "") ? (
                        <>
                          <button
                            title="editar"
                            onClick={() => handleEdit(product)}
                            className="text-[#2c5396] hover:text-blue-800 transition-colors"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            title="delete"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      ): (
                        <Ban color="red" className="w-5 h-5" />
                      )}
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
