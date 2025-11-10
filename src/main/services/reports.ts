import { supabase } from "../supabaseClient";
import { DetailedReportItem } from "../../shared/types";
import { loadCache, getBranchFromCache } from "../cache";
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
    let query = supabase
      .from("movements")
      .select("*")
      .eq("type", "saida"); // Apenas saídas

    // Filtrar por filial se não for "all"
    if (branchId !== "all") {
      query = query.eq("branch_id", branchId);
    }

    // Filtro de data inicial
    if (startDate) {
      query = query.gte("date", startDate);
    }

    // Filtro de data final
    if (endDate) {
      query = query.lte("date", endDate);
    }

    const { data: movements, error } = await query;
    if (error) throw error;

    await loadCache(); // 🔹 Para conseguir pegar nomes das filiais no cache

    const report: DetailedReportItem[] = (movements || []).map((m: any) => ({
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

/*import { adminDb } from "../firebase"
import { DetailedReportItem } from "../../shared/types";

export const getDetailedReport = async (
  branchId: string = "all",
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean
  data?: DetailedReportItem[]
  error?: string
}> => {
  try {
    // Buscar todos os movimentos
    const movementsSnap = await adminDb.collection("movements").get()
    let movements = movementsSnap.docs.map((d) => d.data() as any)

    // Filtrar apenas saídas
    movements = movements.filter((m) => m.type === "saida")

    // Filtrar por filial
    if (branchId !== "all") {
      movements = movements.filter((m) => m.branchId === branchId)
    }

    // Filtrar por intervalo de datas
    if (startDate) {
      const start = new Date(startDate)
      movements = movements.filter((m) => new Date(m.date) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      movements = movements.filter((m) => new Date(m.date) <= end)
    }

    // Mapear para relatório formatado
    const report = movements.map((m) => ({
      date: m.date,
      branchName: m.branchName || "Desconhecida",
      destinationBranchName: m.destinationBranchName || "-",
      productCode: m.productCode || "-",
      productName: m.productName || "-",
      quantity: m.quantity,
      notes: m.notes || "-",
    }))

    // Ordenar por data (mais recente primeiro)
    report.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return { success: true, data: report }
  } catch (error) {
    console.error("Erro ao gerar relatório detalhado:", error);
    throw new Error("Erro ao gerar relatório detalhado");
  }
}
*/