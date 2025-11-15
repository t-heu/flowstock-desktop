import { useEffect, useState } from "react"
import { Download, Filter } from "lucide-react"
import toast from "react-hot-toast"

interface DetailedExit {
  created_at: string
  branchName: string
  destinationBranchName: string
  productCode: string
  productName: string
  quantity: number
  notes: string
  type: "entrada" | "saida",
  invoice_number: string
}

interface Branch {
  id: string
  name: string
  code: string
}

export default function ReportsPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [reportData, setReportData] = useState<DetailedExit[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState<"all" | "entrada" | "saida">("all");

  const [loaded, setLoaded] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    if (!loaded) return; // evita chamar antes da hora
    generateReport();
  }, [page, type, loaded]);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await window.api.getBranches();
        
        if (!response.success) toast.error(response.error);

        setBranches(response.data || []);
        setLoaded(true); // só libera o outro useEffect após carregar
      } catch (error: any) {
        console.error("Erro ao carregar filiais:", error);
        toast.error("Falha ao carregar filiais.");
      }
    }

    loadData();
  }, []);

  const generateReport = async () => {
    try {
      const result = await window.api.getDetailedReport({
        branchId: selectedBranch,
        startDate,
        endDate,
        page,
        pageSize: 10,
        type,
      });

      if (!result?.success) {
        toast.error(result.error || "Erro ao gerar relatório.");
        setReportData([]);
        return;
      }

      setReportData(result.data || []);
      setTotal(result.total || 0);

    } catch (error: any) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório: " + (error?.message || "Falha desconhecida"));
      setReportData([]);
    }
  };

  const handleFilter = () => generateReport()

  const handleExport = () => {
    let csv =
      "Data;Filial Origem;Filial Destino;Código Produto;Nome Produto;Quantidade;Entrada/Saída;NF Entrada;Observações\n";

    reportData.forEach((item) => {
      csv += `${new Date(item.created_at).toLocaleDateString("pt-BR")};${item.branchName};${item.destinationBranchName};${item.productCode};${item.productName};${item.quantity};${item.type};${item.invoice_number || "-"};${item.notes}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    a.download = `relatorio-detalhado-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;

    a.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios Detalhados</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Visualize cada saída registrada por filial</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="w-6 h-6 text-black dark:text-blue-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
        </div>

        {/* Tipo */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="all">Entradas + Saídas</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filial</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            >
              <option value="all">Todas as Filiais</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Data inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Inicial</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Data final */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Final</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>

          {/* Botão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">&nbsp;</label>
            <button
              onClick={handleFilter}
              className="w-full px-4 py-2 bg-black hover:bg-[#333] text-white rounded-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Export CSV */}
      {reportData.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
      )}

      {/* Tabela detalhada */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Movimentos Detalhadas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial Origem</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Filial Destino</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Código Produto</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Produto</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Qtd</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Entrada/Saída</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Nf de entrada</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-900 dark:text-white">Observações</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma saída registrada
                  </td>
                </tr>
              ) : (
                reportData.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{new Date(item.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{item.branchName}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{item.destinationBranchName}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{item.productCode}</td>
                    <td className="p-4 text-sm text-gray-900 dark:text-white">{item.productName}</td>
                    <td
                      className={`p-4 text-sm font-semibold ${
                        item.type === "saida"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {item.type === "saida" ? `-${item.quantity}` : `+${item.quantity}`}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.type || "-"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.invoice_number || "-"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{item.notes || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

         {total > pageSize && (
            <div className="flex items-center justify-center gap-3 mt-6 mb-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-full bg-[#111] dark:bg-slate-700 text-white dark:text-gray-200 
                          hover:bg-[#333] disabled:opacity-40 transition"
              >
                ← Anterior
              </button>

              <div className="px-4 py-2 rounded-full bg-black text-white font-medium shadow">
                {page} / {Math.ceil(total / pageSize)}
              </div>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * pageSize >= total}
                className="px-4 py-2 rounded-full bg-[#111] dark:bg-slate-700 text-white dark:text-gray-200 
                          hover:bg-[#333] disabled:opacity-40 transition"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
