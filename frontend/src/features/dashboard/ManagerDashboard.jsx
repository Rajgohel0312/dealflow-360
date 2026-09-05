import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShoppingBag,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Clock,
  UserCheck,
} from "lucide-react";

export default function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardData();
      setData(res.dashboard);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load Manager Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const kpis = data?.kpis || {};
  const queue = data?.approval_queue || [];
  const risk = data?.risk_dashboard || { reasons: [] };
  const perf = data?.sales_rep_performance || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Manager Executive Command Center
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Review pending discount approvals, monitor deal risk factors, and track sales performance.
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-neutral-50 text-sm font-semibold text-text-secondary transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Data
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Manager KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pending Approvals"
            value={kpis.pending_approvals}
            icon={CheckSquare}
            color="warning"
            description="Requires manager sign-off"
          />
          <StatsCard
            title="High Risk Deals"
            value={kpis.high_risk_deals}
            icon={ShieldAlert}
            color="danger"
            description="Exceeds risk score 60"
          />
          <StatsCard
            title="Approved Today"
            value={kpis.approved_today}
            icon={CheckCircle2}
            color="success"
            description="Commercial quotes approved"
          />
          <StatsCard
            title="Pipeline Value"
            value={`₹${(kpis.pipeline_value / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="primary"
            description="Total active pipeline"
          />
        </div>

        {/* PROMINENT SECTION: Approval Queue */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-text-primary">
                  Pending Approvals Queue
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Quotations waiting for manager discount & risk clearance
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/approvals"
              className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1"
            >
              View Complete Queue <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <CheckCircle2 className="w-12 h-12 text-success-500 mx-auto mb-2" />
              <p className="font-bold text-text-primary">All Clear!</p>
              <p className="text-xs mt-1">No pending quotations in your approval queue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-3.5 px-6">Quotation</th>
                    <th className="py-3.5 px-6">Customer / Tier</th>
                    <th className="py-3.5 px-6">Discount</th>
                    <th className="py-3.5 px-6">Risk Level</th>
                    <th className="py-3.5 px-6">Sales Rep</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {queue.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-text-primary">
                        <Link to={`/dashboard/quotations/${item.id}`} className="hover:text-primary-700">
                          {item.quote_number}
                        </Link>
                        <div className="text-xs text-text-muted font-normal">₹{item.total_amount}</div>
                      </td>
                      <td className="py-4 px-6 font-medium">
                        {item.customer_name}
                        <div className="mt-0.5">
                          <Badge variant={item.customer_tier?.toLowerCase() === "gold" ? "gold" : "silver"}>
                            {item.customer_tier || "Standard"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-danger-600">
                        {item.discount_percent}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={item.risk_level === "HIGH" ? "danger" : item.risk_level === "MEDIUM" ? "warning" : "success"}>
                          {item.risk_level} (Score {item.risk_score})
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {item.sales_rep || "—"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/dashboard/quotations/${item.id}`}>
                          <Button size="xs" variant="primary">
                            Review & Approve
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Risk & Performance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Risk Dashboard */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-danger-600" /> Risk Distribution & Factors
              </h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-success-50 border border-success-200">
                <p className="text-2xl font-black text-success-700">{risk.low}</p>
                <p className="text-xs font-bold text-success-800 mt-1">LOW RISK</p>
              </div>
              <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
                <p className="text-2xl font-black text-warning-700">{risk.medium}</p>
                <p className="text-xs font-bold text-warning-800 mt-1">MEDIUM RISK</p>
              </div>
              <div className="p-4 rounded-xl bg-danger-50 border border-danger-200">
                <p className="text-2xl font-black text-danger-700">{risk.high}</p>
                <p className="text-xs font-bold text-danger-800 mt-1">HIGH RISK</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Risk Reasons Breakdown</h4>
              {risk.reasons.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-neutral-100 last:border-0">
                  <span className="text-text-primary font-medium">{r.reason}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 font-bold text-text-secondary text-xs">
                    {r.count} deals
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Performance */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-600" /> Sales Rep Performance
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-muted uppercase">
                    <th className="py-2">Sales Rep</th>
                    <th className="py-2">Quotes</th>
                    <th className="py-2">Approved</th>
                    <th className="py-2">Avg Disc</th>
                    <th className="py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {perf.map((p, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50">
                      <td className="py-3 font-bold text-text-primary">{p.rep_name}</td>
                      <td className="py-3">{p.quotes}</td>
                      <td className="py-3 text-success-700 font-semibold">{p.approved}</td>
                      <td className="py-3 font-mono text-xs">{p.avg_discount}</td>
                      <td className="py-3 text-right font-bold font-mono">₹{p.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
