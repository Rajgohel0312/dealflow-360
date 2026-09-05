import { useState, useEffect } from "react";
import { getDealHealth } from "../../api/dealHealth.api";
import { Badge } from "../../components/ui/Badge";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  TrendingDown,
  Info,
} from "lucide-react";

export default function DealHealthWidget({ quotationId }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quotationId) {
      fetchHealthData();
    }
  }, [quotationId]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await getDealHealth(quotationId);
      setHealth(res.health || res);
    } catch (err) {
      console.error("Failed to load deal health score", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-neutral-50 rounded-2xl border border-border text-xs text-text-muted text-center animate-pulse">
        Evaluating 5 deal health risk factors...
      </div>
    );
  }

  if (!health) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case "HEALTHY":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> HEALTHY DEAL (🟢 {health.score}/100)
          </div>
        );
      case "AT_RISK":
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> DEAL AT RISK (🟡 {health.score}/100)
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-danger-50 text-danger-800 border border-danger-200">
            <AlertOctagon className="w-4 h-4 text-danger-600" /> CRITICAL RISK (🔴 {health.score}/100)
          </div>
        );
    }
  };

  return (
    <div className="bg-surface p-5 rounded-2xl border border-border space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-text-primary text-sm tracking-wide">
            Automated Commercial Deal Health Index
          </h3>
        </div>
        {getStatusBadge(health.status)}
      </div>

      {health.factors && health.factors.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Active Risk Factors ({health.factors.length})
          </p>
          <div className="space-y-2">
            {health.factors.map((f, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-neutral-50 border border-border text-xs flex items-start gap-2.5"
              >
                <TrendingDown className="w-4 h-4 text-danger-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">
                      {f.type.replace(/_/g, " ")}
                    </span>
                    <span className="font-extrabold text-danger-700 font-mono">
                      {f.impact} pts
                    </span>
                  </div>
                  <p className="text-text-muted mt-0.5 leading-relaxed">{f.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Zero risk penalties detected. Proposal margins, terms, and fulfillment pipeline are optimal.</span>
        </div>
      )}
    </div>
  );
}
