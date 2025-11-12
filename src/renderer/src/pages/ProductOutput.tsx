import type React from "react"
import { useEffect, useState } from "react"
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
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [recentExits, setRecentExits] = useState<any[]>([])
  const [branchStock, setBranchStock] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    productId: "",
    branchId: "",
    destinationBranchName: "",
    quantity: "",
    notes: "",
  })

  useEffect(() => {
    async function loadData() {
      const productsRes = await window.api.getProducts();
      if (productsRes.success) {
        setProducts(productsRes.data || []);
      } else {
        toast.error(productsRes.error || "Erro ao carregar produtos");
      }

      const branchesRes = await window.api.getBranches();
      if (branchesRes.success) {
        setBranches(branchesRes.data || []);
      } else {
        toast.error(branchesRes.error || "Erro ao carregar filiais");
      }

      const stockRes = await window.api.getBranchStock();
      if (stockRes.success) {
        setBranchStock(stockRes.data || []);
      } else {
        toast.error(stockRes.error || "Erro ao carregar estoque das filiais");
      }

      loadRecentExits();
    }

    loadData();
  }, []);

  async function loadRecentExits() {
    const movementsRes = await window.api.getMovements("saida");
    if (movementsRes.success) {
      setRecentExits(movementsRes.data || []);
    } else {
      toast.error(movementsRes.error || "Erro ao carregar saídas recentes");
    }
  }

  const handleProductChange = (productId: string) => {
    setFormData({ ...formData, productId });
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = Number.parseInt(formData.quantity);
    if (quantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }

    const selectedProduct = products.find((p) => p.id === formData.productId);
    const branchOrigem = branches.find((b) => b.id === formData.branchId);
    const branchDestino = branches.find((b) => b.name === formData.destinationBranchName);

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
      product_name: selectedProduct.name,
      product_code: selectedProduct.code,
      branch_name: branchOrigem.name,
    });

    if (!res.success) {
      toast.error(res.error || "Erro ao registrar saída");
      return;
    }

    // Atualiza dados
    setFormData({
      productId: "",
      branchId: "",
      destinationBranchName: "",
      quantity: "",
      notes: "",
    });
    setSelectedProduct(null);

    const productsRes = await window.api.getProducts();
    if (productsRes.success) setProducts(productsRes.data || []);

    loadRecentExits();
    toast.success("Saída registrada com sucesso!");
  };

  // Dentro do componente, baseado no produto e filial selecionados
  const availableStock = selectedProduct && formData.branchId
  ? branchStock
      .filter(
        (item) =>
          String(item.productId) === String(selectedProduct.id) &&
          String(item.branchId) === String(formData.branchId)
      )
      .reduce((sum, item) => sum + Number(item.quantity), 0)
  : 0;

  const isFormEmpty = Object.values(formData).every(value => !value);

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
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                required
              >
                <option value="">Selecione a filial</option>
                {branches.map((branch) => (
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              required
            >
              <option value="">Selecione a filial destino</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.name}> {/* valor agora é o nome */}
                  {branch.code} - {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estoque disponível */}
          {selectedProduct && formData.branchId && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isFormEmpty}
            className="px-6 py-2.5 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            <TrendingDown className="w-4 h-4" />
            Registrar Saída
          </button>
        </form>
      </div>

      {/* Tabela de últimas saídas */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Últimas Saídas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
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
                  <td colSpan={6} className="p-8">
                    <div className="flex flex-col items-center justify-center text-center gap-2 text-gray-500 dark:text-gray-400">
                      <Package className="w-6 h-6 opacity-70" />
                      <p>Nenhuma saída registrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentExits.map((exit) => (
                  <tr
                    key={exit.id}
                    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                  >
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
