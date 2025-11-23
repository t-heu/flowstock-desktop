import { ChartNoAxesColumn, RefreshCw } from "lucide-react";
import StatusBarHistory, { StatusBarRef } from "../components/StatusBarHistory";
import { useRef } from "react";

export default function StatusPage() {
  const services = ["api", "auth", "database"] as const;

  // refs para cada serviço
  const refs: Record<string, React.RefObject<StatusBarRef | null>> = {
    api: useRef<StatusBarRef | null>(null),
    auth: useRef<StatusBarRef | null>(null),
    database: useRef<StatusBarRef | null>(null),
  };

  const handleRefresh = () => {
    services.forEach(s => refs[s].current?.refresh());
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ChartNoAxesColumn className="w-8 h-8" /> Status Page
        </h1>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-[#2c5396] text-white rounded hover:bg-[#3a63a0] transition-colors"
        >
          <RefreshCw className="w-5 h-5" /> Refresh
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl mx-auto py-6 px-4">
        {services.map((s) => (
          <StatusBarHistory
            key={s}
            serviceName={s}
            ref={refs[s]}
          />
        ))}
      </div>
    </div>
  );
}
