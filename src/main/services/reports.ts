import { supabase } from "../supabaseClient";
import { DetailedReportItem } from "../../shared/types";
import { 
  loadCache, 
  getBranchFromCache, 
  getMovementsCache, 
  setMovementsCache 
} from "../cache";

/**
 * 🔹 Buscar relatório detalhado de saídas (type: "saida")
 */
export const getDetailedReport = async (
  branchId: string = "all",
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data?: DetailedReportItem[];
  error?: string;
}> => {
  try {
    await loadCache();

    let movements = getMovementsCache();

    if (!movements) {
      // Se não temos → busca uma vez no banco
      const { data, error } = await supabase
        .from("movements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setMovementsCache(data || []);
      movements = data || [];
    }

    // 2️⃣ Filtra apenas saídas
    let filtered = movements.filter(m => m.type === "saida");

    // Filtrar por filial se não for "all"
    if (branchId !== "all") {
      filtered = filtered.filter(m => m.branch_id === branchId);
    }

    if (startDate) {
      const start = new Date(startDate + "T00:00:00");
      filtered = filtered.filter(m => new Date(m.created_at) >= start);
    }

    if (endDate) {
      const end = new Date(endDate + "T23:59:59");
      filtered = filtered.filter(m => new Date(m.created_at) <= end);
    }

    // 3️⃣ Monta o relatório usando cache de filiais
    const report: DetailedReportItem[] = filtered.map((m: any) => ({
      date: m.date,
      branchName:
        m.branch_name ??
        getBranchFromCache(m.branch_id)?.name ??
        "Desconhecida",
      destinationBranchName:
        m.destination_branch_name ??
        (m.destination_branch_id
          ? getBranchFromCache(m.destination_branch_id)?.name
          : "-") ??
        "-",
      productCode: m.product_code ?? m.productCode ?? "-",
      productName: m.product_name ?? m.productName ?? "-",
      quantity: Number(m.quantity ?? 0),
      notes: m.notes ?? "-",
      created_at: m.created_at,
    }));

    // Ordenar por data (mais recente primeiro)
    report.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { success: true, data: report };
  } catch (err: any) {
    console.error("Erro ao gerar relatório detalhado:", err);
    return { success: false, error: err.message || "Erro ao gerar relatório detalhado" };
  }
};
