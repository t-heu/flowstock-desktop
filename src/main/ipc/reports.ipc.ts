import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getDetailedReport
} from "../services/reports";
import { ReportFilterSchema } from "../schemas";

export function registerReportIPC() {
  ipcMain.handle("get-detailed-report", authenticated(safeIpc(async (_, raw) => {
    const { branchId, startDate, endDate } = ReportFilterSchema.parse(raw);
    return await getDetailedReport(branchId, startDate, endDate);
  }, "Erro ao gerar relatório detalhado")));
}
