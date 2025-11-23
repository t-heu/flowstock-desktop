import { useState } from "react";
import { TrendingUp, Package } from "lucide-react";

import { useToast } from "../context/ToastProvider";
import { Product, Branch } from "../../../shared/types";
import { useProductsAndBranches } from "../hooks/useProductsAndBranches";
import { useMovements } from "../hooks/useMovements";

export default function ProductInputPage() {
  const { showToast } = useToast();
  const { products, branches } = useProductsAndBranches();
  const { movements: recentEntries, loadMovements: loadRecentEntries } = useMovements("entrada");

  const [formData, setFormData] = useState({
    productId: "",
    branchId: "",
    quantity: "",
    notes: "",
    invoiceNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = Number.parseInt(formData.quantity);

    if (quantity <= 0) {
      showToast("A quantidade deve ser maior que zero", "error");
      return;
    }

    try {
      const res = await window.api.createMovement({
        product_id: formData.productId,
        branch_id: formData.branchId,
        type: "entrada",
        quantity,
        notes: formData.notes,
        invoice_number: formData.invoiceNumber,
      });

      if (!res.success) {
        showToast(res.error || "Falha ao registrar entrada", "error");
        return;
      }

      setFormData({ productId: "", branchId: "", quantity: "", notes: "", invoiceNumber: "" });
      await loadRecentEntries();
      showToast("Entrada registrada com sucesso!", "success");
    } catch (error: any) {
      console.error("Erro ao registrar entrada:", error);
      showToast(error?.message || "Erro desconhecido", "error");
    }
  };

  const isFormEmpty =
    !formData.productId || !formData.branchId || !formData.quantity || !formData.invoiceNumber;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrada de Estoque</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Registre a entrada de produtos no estoque
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-[#2c5396]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lançar Entrada</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produto
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filial
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              >
                <option value="">Selecione uma filial</option>
                {branches.map((branch: Branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantidade
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Digite a quantidade"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas sobre a entrada (opcional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número da Nota Fiscal
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              required
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="Digite o número da nota fiscal"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
            />
          </div>

          <button
            type="submit"
            disabled={isFormEmpty}
            className="px-6 py-2.5 flex items-center justify-center gap-2 bg-[#2c5396] hover:bg-[#666] text-white rounded-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingUp className="w-4 h-4" />
            Registrar Entrada
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas Entradas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Produto</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Qtd</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Observações</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nota Fiscal</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500 dark:text-gray-400">
                      <Package className="w-6 h-6 opacity-70" />
                      <p>Nenhuma entrada registrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentEntries.map((entry, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
                    <td className="p-4 text-sm text-gray-900 dark:text-white">
                      {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">
                      {entry.product_code} - {entry.product_name}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{entry.branch_name}</td>
                    <td className="p-4 text-sm">
                      <span className="font-semibold text-green-600 dark:text-green-400">+{entry.quantity}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{entry.notes || "-"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{entry.invoice_number || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
