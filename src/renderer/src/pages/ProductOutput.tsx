import type React from "react"
import { useEffect, useState, useRef, useMemo } from "react"
import { Package, AlertCircle, TrendingDown } from "lucide-react"
import toast from "react-hot-toast"

export interface Branch {
  id?: string;
  name: string;
  code: string;
  location?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  description?: string;
  unit: string;
  createdAt?: string;
}

export default function ProductOutputPage() {
  const [recentExits, setRecentExits] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedExits, setSelectedExits] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    productId: "",
    branchId: "",
    destinationBranchName: "",
    quantity: "",
    notes: "",
  });

  // 🔥 Pesados ficam fora do state para evitar renders
  const productsRef = useRef<Product[]>([]);
  const branchesRef = useRef<Branch[]>([]);
  const branchStockRef = useRef<any[]>([]);

  // =====================================================
  // 🔥 LOAD INITIAL DATA — 100% otimizado
  // =====================================================
  useEffect(() => {
    async function load() {
      const [productsRes, branchesRes, stockRes] = await Promise.all([
        window.api.getProducts(),
        window.api.getBranches(),
        window.api.getBranchStock(),
      ]);

      if (productsRes.success) productsRef.current = productsRes.data || [];
      else toast.error(productsRes.error || "Erro ao carregar produtos");

      if (branchesRes.success) branchesRef.current = branchesRes.data || [];
      else toast.error(branchesRes.error || "Erro ao carregar filiais");

      if (stockRes.success) branchStockRef.current = stockRes.data || [];
      else toast.error(stockRes.error || "Erro ao carregar estoque");

      loadRecentExits();
    }

    load();
  }, []);

  // =====================================================
  // 🔥 LOAD RECENT EXITS (leve — pode ficar no state)
  // =====================================================
  async function loadRecentExits() {
    const movementsRes = await window.api.getMovements("saida");
    if (movementsRes.success) setRecentExits(movementsRes.data || []);
    else toast.error(movementsRes.error || "Erro ao carregar saídas");
  }

  // =====================================================
  // 🔥 PRODUCT SELECT
  // =====================================================
  const handleProductChange = (productId: string) => {
    setFormData((prev) => ({ ...prev, productId }));
    const product = productsRef.current.find((p) => p.id === productId);
    setSelectedProduct(product || null);
  };

  // =====================================================
  // 🔥 AVAILABLE STOCK — MEMOIZED (não trava UI)
  // =====================================================
  const availableStock = useMemo(() => {
    if (!selectedProduct || !formData.branchId) return 0;

    return branchStockRef.current
      .filter(
        (item) =>
          String(item.productId) === String(selectedProduct.id) &&
          String(item.branchId) === String(formData.branchId)
      )
      .reduce((sum, item) => sum + Number(item.quantity), 0);
  }, [selectedProduct, formData.branchId]);

  const isFormEmpty = Object.values(formData).every((v) => !v);

  // =====================================================
  // 🔥 SUBMIT
  // =====================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = Number(formData.quantity);
    if (quantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }

    const selectedProduct = productsRef.current.find(
      (p) => p.id === formData.productId
    );

    const branchOrigem = branchesRef.current.find(
      (b) => b.id === formData.branchId
    );

    const branchDestino = branchesRef.current.find(
      (b) => b.name === formData.destinationBranchName
    );

    if (!selectedProduct || !branchOrigem || !branchDestino) {
      toast.error("Selecione produto e filiais válidos");
      return;
    }

    const res = await window.api.createMovement({
      product_id: formData.productId,
      branch_id: formData.branchId,
      destination_branch_id: branchDestino.id,
      type: "saida",
      quantity,
      notes: formData.notes,
    });

    if (!res.success) {
      toast.error(res.error || "Erro ao registrar saída");
      return;
    }

    // limpa form
    setFormData({
      productId: "",
      branchId: "",
      destinationBranchName: "",
      quantity: "",
      notes: "",
    });

    setSelectedProduct(null);

    // recarrega somente o necessário
    await loadRecentExits();

    toast.success("Saída registrada com sucesso!");
  };

  // =====================================================
  // 🔥 GERAR ROMANEIO
  // =====================================================
  async function handleGenerateRomaneio() {
    const selectedItems = recentExits.filter((item) =>
      selectedExits.includes(item.id)
    );

    if (selectedItems.length === 0) {
      toast.error("Selecione pelo menos uma saída!");
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
      toast.error("Erro ao gerar PDF");
      return;
    }

    toast.success("PDF gerado!");
  }

  // =====================================================
  // 🔥 TOGGLE SELECT EXIT
  // =====================================================
  function toggleSelectExit(id: string) {
    setSelectedExits((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saída de Estoque</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Registre a saída de produtos do estoque</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lançar Saída</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Grid com produto e filial origem */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Produto
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              >
                <option value="">Selecione um produto</option>
                {productsRef.current.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filial Origem
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              >
                <option value="">Selecione a filial</option>
                {branchesRef.current.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.code} - {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid com filial destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filial Destino
              <span className="text-red-600"> *</span>
            </label>
            <select
              value={formData.destinationBranchName} // agora guarda o nome
              onChange={(e) => setFormData({ ...formData, destinationBranchName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              required
            >
              <option value="">Selecione a filial destino</option>
              {branchesRef.current.map((branch) => (
                <option key={branch.id} value={branch.name}> {/* valor agora é o nome */}
                  {branch.code} - {branch.name}
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
              Quantidade
              <span className="text-red-600"> *</span>
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="Digite a quantidade"
              min="1"
              max={0 || undefined}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isFormEmpty}
            className="rounded-sm px-6 py-2.5  flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Registrar Saída
          </button>
        </form>
      </div>

      {/* Tabela de últimas saídas */}
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
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Checkbox</th>
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
                  <td colSpan={7} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500 dark:text-gray-400">
                      <Package className="w-6 h-6 opacity-70" />
                      <p>Nenhuma saída registrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentExits.map((exit, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
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
                    <td className="p-4 text-sm">
                      <span className="font-semibold text-red-600 dark:text-red-400">-{exit.quantity}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{exit.notes || "-"}</td>
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
