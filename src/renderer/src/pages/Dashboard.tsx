import { useState, useEffect, useMemo, useCallback } from 'react';
import { Package, TrendingUp, TrendingDown } from "lucide-react";
import toast from "react-hot-toast";

import LoadingSpinner from "../components/LoadingSpinner";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalEntries: 0,
    totalExits: 0,
    totalBranches: 0,
  });
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // -------- Carregar branches apenas uma vez --------
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const result = await window.api.getBranches();
        const data = Array.isArray(result) ? result : result?.data || [];
        if (!result.success) toast.error(result.error);
        setBranches(data);
      } catch (error: any) {
        console.error("Erro ao carregar filiais:", error);
        toast.error("Falha ao carregar filiais: " + (error?.message || "Erro desconhecido"));
        setBranches([]);
      }
    };
    loadBranches();
  }, []);

  // -------- Carregar stats sempre que selectedBranch mudar --------
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const branchId = selectedBranch === 'ALL' ? null : selectedBranch;
      const result = await window.api.getStats(branchId ?? undefined);
      const data = result?.data || result || {};
      setStats({
        totalProducts: data.totalProducts || 0,
        totalStock: data.totalStock || 0,
        totalEntries: data.totalEntries || 0,
        totalExits: data.totalExits || 0,
        totalBranches: data.totalBranches || 0,
      });
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Falha ao carregar estatísticas: " + (error?.message || "Erro desconhecido"));
      setStats({ totalProducts: 0, totalStock: 0, totalEntries: 0, totalExits: 0, totalBranches: 0 });
    } finally {
      setLoading(false);
    }
  }, [selectedBranch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // -------- Cards memoizados --------
  const cards = useMemo(() => [
    { title: "Total de Produtos", value: stats.totalProducts, icon: Package, iconColor: "text-[#2b7fff]", textColor: "text-black" },
    { title: "Estoque Total", value: stats.totalStock, icon: Package, iconColor: "text-[#00c951]", textColor: "text-black" },
    { title: "Entradas", value: stats.totalEntries, icon: TrendingUp, iconColor: "text-[#00bc7d]", textColor: "text-black" },
    { title: "Saídas", value: stats.totalExits, icon: TrendingDown, iconColor: "text-[#fb2c36]", textColor: "text-black" },
  ], [stats]);

  if (loading) {
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
        <p className="text-2xl font-bold text-black">{stats.totalBranches}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Filiais ativas no sistema</p>
      </div>
    </div>
  );
}
