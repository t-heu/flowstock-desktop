import { supabase } from "../supabaseClient";
import { DetailedReportItem } from "../../shared/types";
import { 
  loadCache, 
} from "../cache";

export const getDetailedReport = async (
  branchId: string = "all",
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 10,
  type: "entrada" | "saida" | "all" = "all",
  user?: { role: string; department: string }
): Promise<{
  success: boolean;
  data?: DetailedReportItem[];
  total?: number;
  error?: string;
}> => {
  try {
    await loadCache();

    let query = supabase
      .from("movements")
      .select(`
        id,
        quantity,
        type,
        notes,
        created_at,
        invoice_number,

        product:product_id (
          id, code, name
        ),

        branch:branch_id (
          id, code, name
        ),

        destination_branch:destination_branch_id (
          id, code, name
        )
      `, { count: "exact" }) // 🔥 pega total para paginação
      .order("created_at", { ascending: false });

    // 🔥 Tipo (entrada/saida/tudo)
    if (type !== "all") {
      query = query.eq("type", type);
    }

    // 🔥 Filtro por filial
    if (branchId !== "all") {
      query = query.eq("branch_id", branchId);
    }

    if (user && user.role !== "admin") {
      query = query.eq("product_department", user.department);
    }

    // 🔥 Filtro por datas
    if (startDate) {
      query = query.gte("created_at", startDate + "T00:00:00");
    }
    if (endDate) {
      query = query.lte("created_at", endDate + "T23:59:59");
    }

    // 🔥 Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: rows, error, count } = await query;
    if (error) throw error;

    const normalize = (rel: any) =>
      Array.isArray(rel) ? rel[0] : rel;

    const mapped: DetailedReportItem[] = (rows || []).map((m: any) => {
      const branch = normalize(m.branch);
      const product = normalize(m.product);
      const dest = normalize(m.destination_branch);

      return {
        date: m.created_at,
        created_at: m.created_at,
        invoice_number: m.invoice_number || "-",

        branchName: branch?.name ?? "-",
        destinationBranchName: dest?.name ?? "-",

        productCode: product?.code ?? "-",
        productName: product?.name ?? "-",

        quantity: Number(m.quantity ?? 0),
        type: m.type,
        notes: m.notes ?? "-",
      };
    });

    return { success: true, data: mapped, total: count ?? 0 };
  } catch (err: any) {
    console.error("Erro ao gerar relatório detalhado:", err);
    return {
      success: false,
      error: err.message || "Erro ao gerar relatório detalhado",
    };
  }
};
