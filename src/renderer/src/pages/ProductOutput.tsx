import { useState, useMemo } from "react";
import { TrendingDown, Package, AlertCircle } from "lucide-react";

import { useToast } from "../context/ToastProvider";
import { useProductsAndBranches } from "../hooks/useProductsAndBranches";
import { useMovements } from "../hooks/useMovements";
import { useStock } from "../hooks/useStock";

export default function ProductOutputPage() {
  const { showToast } = useToast();

  // Dados principais
  const { products, branches } = useProductsAndBranches();
  const { movements: recentExits, loadMovements: loadRecentExits } = useMovements("saida");
  const { branchStock } = useStock();

  const [formData, setFormData] = useState({
    productId: "",
    branchId: "",
    destinationBranchId: "",
    quantity: "",
    notes: "",
  });

  const [selectedExits, setSelectedExits] = useState<string[]>([]);

  // Produto selecionado
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === formData.productId) || null,
    [formData.productId, products]
  );

  // Estoque disponível
  const availableStock = useMemo(() => {
    if (!selectedProduct || !formData.branchId) return 0;
    return branchStock
      .filter(
        (item) =>
          String(item.product_id) === String(selectedProduct.id) &&
          String(item.branch_id) === String(formData.branchId)
      )
      .reduce((sum, item) => sum + Number(item.quantity), 0);
  }, [selectedProduct, formData.branchId, branchStock]);

  const isFormEmpty = !formData.productId || !formData.branchId || !formData.destinationBranchId || !formData.quantity;

  // ----------------------- Submit -----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = Number(formData.quantity);
    if (quantity <= 0) {
      showToast("A quantidade deve ser maior que zero", "error");
      return;
    }

    const res = await window.api.createMovement({
      product_id: formData.productId,
      branch_id: formData.branchId,
      destination_branch_id: formData.destinationBranchId,
      type: "saida",
      quantity,
      notes: formData.notes,
    });

    if (!res.success) {
      showToast(res.error || "Erro ao registrar saída", "error");
      return;
    }

    setFormData({
      productId: "",
      branchId: "",
      destinationBranchId: "",
      quantity: "",
      notes: "",
    });

    await loadRecentExits();
    showToast("Saída registrada com sucesso!", "success");
  };

  // ----------------------- Romaneio -----------------------
  const handleGenerateRomaneio = async () => {
    const selectedItems = recentExits.filter((item) => selectedExits.includes(item.id));
    if (selectedItems.length === 0) {
      showToast("Selecione pelo menos uma saída!", "error");
      return;
    }

    const payload = {
      romaneioNumber: Date.now(),
      items: selectedItems.map((x) => ({
        fromBranch: x.branch_name,
        toBranch: x.destination_branch_name,
        product: `${x.product_code} - ${x.product_name}`,
        quantity: x.quantity,
        notes: x.notes || "-",
        date: new Date(x.created_at).toLocaleDateString("pt-BR"),
      })),
    };

    const res = await window.api.generateRomaneio(payload);
    if (!res.success) {
      showToast("Erro ao gerar PDF", "error");
      return;
    }

    showToast("PDF gerado!", "success");
  };

  const toggleSelectExit = (id: string) => {
    setSelectedExits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saída de Estoque</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Registre a saída de produtos do estoque</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-6 h-6 text-[#2c5396]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lançar Saída</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Produto e Filial Origem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produto <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filial Origem <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
                required
              >
                <option value="">Selecione a filial</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} - {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filial Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filial Destino <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.destinationBranchId}
              onChange={(e) => setFormData({ ...formData, destinationBranchId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
              required
            >
              <option value="">Selecione a filial destino</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} - {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estoque disponível */}
          {selectedProduct && formData.branchId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-sm p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Estoque Disponível</p>
                  <p className="text-2xl font-bold text-black dark:text-blue-400 mt-1">
                    {availableStock} {selectedProduct.unit}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantidade <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              min={1}
              max={availableStock || undefined}
              placeholder="Digite a quantidade"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
              required
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas sobre a saída (opcional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
            />
          </div>

          <button
            type="submit"
            disabled={isFormEmpty}
            className="rounded-sm px-6 py-2.5  flex items-center justify-center gap-2 bg-[#2c5396] hover:bg-[#666] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Registrar Saída
          </button>
        </form>
      </div>

      {/* Tabela de saídas */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas Saídas</h3>
          {selectedExits.length > 0 && (
            <button
              onClick={handleGenerateRomaneio}
              className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition"
            >
              Gerar Romaneio ({selectedExits.length})
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Selecionar</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Produto</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial Origem</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial Destino</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Qtd</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Observações</th>
              </tr>
            </thead>
            <tbody>
              {recentExits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <Package className="w-6 h-6 mx-auto mb-2 opacity-70" />
                    Nenhuma saída registrada
                  </td>
                </tr>
              ) : (
                recentExits.map((exit) => (
                  <tr key={exit.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedExits.includes(exit.id)}
                        onChange={() => toggleSelectExit(exit.id)}
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">
                      {new Date(exit.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">
                      {exit.product_code} - {exit.product_name}
                    </td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{exit.branch_name}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{exit.destination_branch_name || "-"}</td>
                    <td className="p-4 text-sm text-red-600 dark:text-red-400">-{exit.quantity}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{exit.notes || "-"}</td>
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
