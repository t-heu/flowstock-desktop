import {
  ChartNoAxesColumn 
} from "lucide-react"

import StatusBarHistory from "../components/StatusBarHistory";

export default function StatusPage() {
  const services = ["api"];

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <ChartNoAxesColumn className="w-8 h-8" /> Status Page
      </h1>

      <div className="space-y-4">
        {services.map(s => (
          <StatusBarHistory key={s} serviceName={s} />
        ))}
      </div>
    </div>
  );
}
