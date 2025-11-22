import { useEffect, useState, useMemo, useCallback } from "react";
import { AlertCircle } from "lucide-react";

import { useToast } from "../context/ToastProvider"

import {BranchStockItem} from "../../../shared/types";

const BranchStockRow = ({ item }: { item: BranchStockItem }) => (
  <tr
    className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
  >
    <td className="p-4 text-gray-900 dark:text-white">{item.branch_name}</td>
    <td className="p-4 text-gray-900 dark:text-white">{item.product_name}</td>
    <td className="p-4 text-gray-600 dark:text-gray-400">{item.product_description}</td>
    <td className="p-4 text-right font-semibold text-black dark:text-blue-400">{item.quantity}</td>
  </tr>
);

export default function BranchStockPage() {
  const { showToast } = useToast();
  const [dados, setDados] = useState<BranchStockItem[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.api.getBranchStock();
        if (!result?.success) {
          showToast(result?.error || "Erro ao carregar branch stock.", "error");
          
          return;
        }
        setDados(result.data || []);
      } catch (error: any) {
        console.error("Erro ao carregar branchStock:", error);
        showToast("Falha ao carregar branchStock: " + (error?.message || "Erro desconhecido"), "error");
      }
    };
    load();
  }, []);

  // -------- Memoizações --------
  const filiais = useMemo(
    () => Array.from(new Set(dados.map((d) => d.branch_name))),
    [dados]
  );

  const dadosFiltrados = useMemo(
    () => (filialSelecionada ? dados.filter((d) => d.branch_name === filialSelecionada) : dados),
    [dados, filialSelecionada]
  );

  const limparFiltro = useCallback(() => setFilialSelecionada(""), []);

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Estoque por Filial</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Visualize o estoque disponível em cada filial
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-[#2c5396]" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={filialSelecionada}
            onChange={(e) => setFilialSelecionada(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#2c5396] focus:border-[#2c5396]"
          >
            <option value="">Todas as filiais</option>
            {filiais.map((filial, i) => (
              <option key={`${filial}-${i}`} value={filial}>
                {filial}
              </option>
            ))}
          </select>

          <button
            onClick={limparFiltro}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-700 dark:text-white"
          >
            Limpar filtro
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estoque Atual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Produto</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Descrição</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-900 dark:text-white">Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                dadosFiltrados.map((item) => <BranchStockRow key={`${item.branch_id}-${item.product_id}`} item={item} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
