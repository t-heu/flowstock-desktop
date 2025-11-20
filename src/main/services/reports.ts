import {fetchMovementsBase} from "./movementBase"

export const getDetailedReport = async (
  branchId: string = "all",
  startDate?: string,
  endDate?: string,
  page: number = 1,
  pageSize: number = 10,
  type: "entrada" | "saida" | "all" = "all",
  user?: { role: string; department: string }
) => {
  try {
    const dept = user && user.role !== "admin" ? user.department : undefined;

    const disableCache = false; // agora o cache por página funciona

    const movements = await fetchMovementsBase({
      limit: pageSize,
      page,
      department: dept,
      branchId: branchId !== "all" ? branchId : undefined,
      type: type !== "all" ? type : undefined,
      startDate,
      endDate,
      disableCache,
    });

    return {
      success: true,
      data: movements,
      total: movements.length,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};
