import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown } from "lucide-react"

export default function Home() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    totalEntries: 0,
    totalExits: 0,
    totalBranches: 0,
  })

   useEffect(() => {
    async function loadStats() {
      try {
        const data = await window.api.getStats();
        setStats(data);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      }
    }

    loadStats();
  }, []);

  if (!stats) return <p>Carregando...</p>;

  const cards = [
    {
      title: "Total de Produtos",
      value: stats.totalProducts,
      icon: Package,
      iconColor: "text-[#2b7fff]",
      color: "bg-white border-[#ddd]",
      textColor: "text-black",
    },
    {
      title: "Estoque Total",
      value: stats.totalStock,
      icon: Package,
      iconColor: "text-[#00c951]",
      color: "bg-white border-[#ddd]",
      textColor: "text-black",
    },
    {
      title: "Entradas",
      value: stats.totalEntries,
      icon: TrendingUp,
      iconColor: "text-[#00bc7d]",
      color: "bg-white border-[#ddd]",
      textColor: "text-black",
    },
    {
      title: "Saídas",
      value: stats.totalExits,
      icon: TrendingDown,
      iconColor: "text-[#fb2c36]",
      color: "bg-white border-[#ddd]",
      textColor: "text-black",
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Visão geral do sistema de controle de estoque</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className={`${card.color} border rounded-xl p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#737373]">{card.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
                </div>
                <Icon className={`w-10 h-10 ${card.iconColor}`}/>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 bg-white dark:bg-slate-800 border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-6 h-6 text-black" />
          <h2 className="text-xl font-bold text-gray-900">Filiais Cadastradas</h2>
        </div>
        <p className="text-2xl font-bold text-black">{stats.totalBranches}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Filiais ativas no sistema</p>
      </div>
    </div>
  )
}
