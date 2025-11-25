import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useMemo,
} from "react";
import useSWR from "swr";

interface Props {
  serviceName: "api" | "auth" | "database";
}

type StatusType = "online" | "offline" | "instavel";

const STATUS_COLORS: Record<StatusType, string> = {
  online: "bg-green-500",
  instavel: "bg-yellow-400",
  offline: "bg-red-600",
};

const MAX_HISTORY = 50;

export interface StatusBarRef {
  refresh: () => void;
}

function mapApiStatusToClient(serviceName: string, data: any): StatusType {
  const svc = data?.[serviceName];
  if (!svc || !svc.status) return "offline";

  switch (svc.status) {
    case "healthy":
      return "online";

    case "unstable":
    case "warning":
      return "instavel";

    default:
      return "offline";
  }
}

const StatusBarHistory: ForwardRefRenderFunction<StatusBarRef, Props> = (
  { serviceName },
  ref
) => {
  const [history, setHistory] = useState<any[]>([]);
  const lastStatusRef = useRef<StatusType | null>(null);

  // SWR fetcher usando IPC
  const fetcher = async () => {
    const res = await window.api.subscribeServiceStatus();
    return res.data;
  };

  // SWR pollando automaticamente
  const { data, mutate } = useSWR(
    "service-status",
    fetcher,
    {
      refreshInterval: 10_000, // 10s fixo (o SWR cuida)
    }
  );

  // Atualiza histórico quando SWR receber um novo status
  useMemo(() => {
    if (!data) return;

    const status = mapApiStatusToClient(serviceName, data);

    // evita duplicar se o status for o mesmo no tick
    if (lastStatusRef.current === status) return;
    lastStatusRef.current = status;

    setHistory(prev => {
      const next = [
        { status, timestamp: new Date() },
        ...prev,
      ].slice(0, MAX_HISTORY);

      return next;
    });
  }, [data]);

  // permite refresh manual
  useImperativeHandle(ref, () => ({
    refresh: () => mutate(),
  }));

  // Cálculo de instabilidade
  const calculateInstavel = (entries: any[]) => {
    const last10 = entries.slice(0, 10);
    let changes = 0;
    for (let i = 1; i < last10.length; i++) {
      if (last10[i].status !== last10[i - 1].status) changes++;
    }
    return changes;
  };

  const instavelCount = calculateInstavel(history);
  const onlineCount = history.filter(h => h.status === "online").length;
  const offlineCount = history.filter(h => h.status === "offline").length;

  const total = history.length || 1;
  const onlineWidth = ((onlineCount - instavelCount) / total) * 100;
  const instavelWidth = (instavelCount / total) * 100;
  const offlineWidth = ((offlineCount - instavelCount) / total) * 100;

  return (
    <div className="flex flex-col border border-gray-200 rounded-lg shadow-md p-4 mb-2 w-full">
      <h2 className="font-bold text-xl mb-4">{serviceName.toUpperCase()}</h2>

      <div className="w-full h-6 bg-gray-200 rounded overflow-hidden flex">
        {onlineWidth > 0 && (
          <div
            className={`h-6 ${STATUS_COLORS.online}`}
            style={{ width: `${onlineWidth}%` }}
          />
        )}
        {instavelWidth > 0 && (
          <div
            className={`h-6 ${STATUS_COLORS.instavel}`}
            style={{ width: `${instavelWidth}%` }}
          />
        )}
        {offlineWidth > 0 && (
          <div
            className={`h-6 ${STATUS_COLORS.offline}`}
            style={{ width: `${offlineWidth}%` }}
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-600">
        <span>Online: {onlineCount}</span>
        <span>Instável: {instavelCount}</span>
        <span>Offline: {offlineCount}</span>
      </div>
    </div>
  );
};

export default forwardRef(StatusBarHistory);
