import { ipcMain } from "electron";
import { authenticated } from "../authMiddleware";
import { safeIpc } from "../ipc-utils";
import { 
  getDetailedReport
} from "../services/reports";
import { ReportFilterSchema } from "../schemas";

export function registerReportIPC() {
  ipcMain.handle(
    "get-detailed-report",
    authenticated(
      safeIpc(async (event, raw) => {
        const validData = ReportFilterSchema.parse(raw); // ZodError será capturado
        const user = { role: event.role, department: event.department };
        const { branchId, startDate, endDate, page, pageSize, type } = validData;

        return await getDetailedReport(
          branchId ?? "all",
          startDate,
          endDate,
          page ?? 1,
          pageSize ?? 50,
          type ?? "all",
          user
        ); // retorna { success, data?, error? }
      }, "Erro ao gerar relatório detalhado")
    )
  );
}
