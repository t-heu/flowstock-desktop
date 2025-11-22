import { useEffect, useState } from "react";

export default function StatusBarHistory({ serviceName = "API" }) {
  const [history, setHistory] = useState<string[]>(
    Array(60).fill("online")
  );

  const COLORS = {
    online: "bg-green-500",
    instavel: "bg-yellow-400",
    offline: "bg-red-600",
  };

  useEffect(() => {
    window.api.subscribeServiceStatus();

    const unsubscribe = window.api.onServiceStatus((status: string) => {
      setHistory(prev => [...prev.slice(-59), status]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-3 capitalize">
        {serviceName}
      </h2>

      <div className="flex gap-1 overflow-hidden">
        {history.map((h, i) => (
          <div key={i} className={`${COLORS[h]} w-2 h-6 rounded-md`} />
        ))}
      </div>
    </div>
  );
}
