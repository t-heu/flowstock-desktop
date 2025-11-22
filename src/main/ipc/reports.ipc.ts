import { ipcMain } from "electron";
import { safeIpc } from "../ipc-utils";
import { ReportFilterSchema } from "../schemas";
import { readPersistedToken } from "../authSession";

const API_URL = import.meta.env.MAIN_VITE_API_URL;

export function registerReportIPC() {
  ipcMain.handle(
    "get-detailed-report",
    safeIpc(async (_, args) => {
      const token = args?.token ?? readPersistedToken();
      if (!token) return { success: false, error: "Falta de token" };

      const filter = args?.filter ?? {};
      const validData = ReportFilterSchema.parse(filter);
      const { branchId, startDate, endDate, page, pageSize, type } = validData;
      
      const queryParams = new URLSearchParams();
      if (branchId) queryParams.append("branchId", branchId);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      if (page) queryParams.append("page", page.toString());
      if (pageSize) queryParams.append("pageSize", pageSize.toString());
      if (type) queryParams.append("type", type);

      const res = await fetch(`${API_URL}/report/detailed?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) return { success: false, error: result.error || "Erro ao gerar relatório" };
      return { success: true, data: result.data };
    }, "Erro ao gerar relatório detalhado")
  );
}
