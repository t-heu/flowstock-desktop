import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Package, TrendingUp, TrendingDown } from "lucide-react";

import { useToast } from "../context/ToastProvider";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProductsAndBranches } from "../hooks/useProductsAndBranches";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');

  // ---------- Hook de produtos e filiais ----------
  const { branches } = useProductsAndBranches();

  // ---------- SWR: Stats ----------
  const fetchStats = async () => {
    const res = selectedBranch === 'ALL' 
      ? await window.api.getStats() 
      : await window.api.getStats(selectedBranch);

    if (!res.success) {
      showToast(res.error || "Erro ao carregar estatísticas.", "error")
      return
    };
    return res.data || {};
  };

  // Mantém o SWR só para stats
  const { data: stats = {}, isLoading, error: statsError } = useSWR(
    ['stats', selectedBranch],
    fetchStats,
    { revalidateOnFocus: false }
  );
  
  if (statsError) showToast(statsError.message, "error");

  const cards = useMemo(() => [
    { title: "Total de Produtos", value: stats.totalProducts || 0, icon: Package, iconColor: "text-[#2b7fff]", textColor: "text-black" },
    { title: "Estoque Total", value: stats.totalStock || 0, icon: Package, iconColor: "text-[#00c951]", textColor: "text-black" },
    { title: "Entradas", value: stats.totalEntries || 0, icon: TrendingUp, iconColor: "text-[#00bc7d]", textColor: "text-black" },
    { title: "Saídas", value: stats.totalExits || 0, icon: TrendingDown, iconColor: "text-[#fb2c36]", textColor: "text-black" },
  ], [stats]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header + Filtro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Visão geral do sistema de controle de estoque</p>
        </div>
        <select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white w-full md:w-64"
        >
          <option value="ALL">Todas as Filiais</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white border-[#ddd] border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#737373]">{card.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
                </div>
                <Icon className={`w-10 h-10 ${card.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Filiais */}
      <div className="mt-5 bg-white dark:bg-slate-800 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-black" />
          <h2 className="text-xl font-bold text-gray-900">Filiais Cadastradas</h2>
        </div>
        <p className="text-2xl font-bold text-black">{branches.length}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Filiais ativas no sistema</p>
      </div>
    </div>
  );
}
