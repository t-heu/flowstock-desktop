import { useEffect, useState, useImperativeHandle, forwardRef, ForwardRefRenderFunction, useRef } from "react";

interface Props {
  serviceName: "api" | "auth" | "database";
  fetchStatusFn?: () => Promise<Record<string, "online" | "offline" | "instavel">>;
}

type StatusType = "online" | "offline" | "instavel";

const STATUS_COLORS: Record<StatusType, string> = {
  online: "bg-green-500",
  instavel: "bg-yellow-400",
  offline: "bg-red-600",
};

const MAX_HISTORY = 50;
const SHORT_INTERVAL = 10000; // 10s quando instável
const LONG_INTERVAL = 30000;  // 30s quando estável

export interface StatusBarRef {
  refresh: () => void;
}

const StatusBarHistory: ForwardRefRenderFunction<StatusBarRef, Props> = ({ serviceName, fetchStatusFn }, ref) => {
  const [history, setHistory] = useState<any[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateInstavel = (entries: any[]) => {
    const last10 = entries.slice(0, 10);
    let changes = 0;
    for (let i = 1; i < last10.length; i++) {
      if (last10[i].status !== last10[i - 1].status) changes++;
    }
    return changes;
  };

  const fetchStatus = async () => {
    try {
      const fetchFn = fetchStatusFn || window.api?.subscribeServiceStatus;
      if (!fetchFn) return;

      const res = await fetchFn();
      const rawStatus = res.data?.[serviceName] || "offline";
      const status: StatusType = ["online", "offline", "instavel"].includes(rawStatus) ? rawStatus : "offline";

      setHistory(prev => {
        const newHistory = [{ status, timestamp: new Date() }, ...prev].slice(0, MAX_HISTORY);

        // Ajustar intervalo adaptativo
        const instavelCount = calculateInstavel(newHistory);
        const nextInterval = instavelCount > 0 ? SHORT_INTERVAL : LONG_INTERVAL;

        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(fetchStatus, nextInterval);

        return newHistory;
      });
    } catch {
      setHistory(prev => [{ status: "offline", timestamp: new Date() }, ...prev].slice(0, MAX_HISTORY));
    }
  };

  // Expor refresh manual via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchStatus,
  }));

  // Inicializar polling
  useEffect(() => {
    fetchStatus();
    intervalRef.current = setInterval(fetchStatus, LONG_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Contadores
  const total = history.length;
  const onlineCount = history.filter(h => h.status === "online").length;
  const offlineCount = history.filter(h => h.status === "offline").length;
  const instavelCount = calculateInstavel(history);

  const onlineWidth = total ? ((onlineCount - instavelCount) / total) * 100 : 0;
  const instavelWidth = total ? (instavelCount / total) * 100 : 0;
  const offlineWidth = total ? ((offlineCount - instavelCount) / total) * 100 : 0;

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg shadow-md p-4 mb-2 w-full">
      <h2 className="font-bold text-xl mb-4">{serviceName.toUpperCase()}</h2>

      {/* Barra de vida */}
      <div className="w-full h-6 bg-gray-200 rounded overflow-hidden flex">
        {onlineWidth > 0 && <div className={`h-6 ${STATUS_COLORS.online}`} style={{ width: `${onlineWidth}%` }} />}
        {instavelWidth > 0 && <div className={`h-6 ${STATUS_COLORS.instavel}`} style={{ width: `${instavelWidth}%` }} />}
        {offlineWidth > 0 && <div className={`h-6 ${STATUS_COLORS.offline}`} style={{ width: `${offlineWidth}%` }} />}
      </div>

      {/* Legenda */}
      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>Online: {onlineCount}</span>
        <span>Instável: {instavelCount}</span>
        <span>Offline: {offlineCount}</span>
      </div>
    </div>
  );
};

export default forwardRef(StatusBarHistory);
