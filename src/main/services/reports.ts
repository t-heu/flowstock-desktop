import { adminDb } from "../firebase"
import { DetailedReportItem } from "../../types";

/**
 * 🔹 Buscar relatório detalhado de saídas
 * @param branchId - ID da filial ou "all" para todas
 * @param startDate - Data inicial opcional (ISO string)
 * @param endDate - Data final opcional (ISO string)
 */
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
