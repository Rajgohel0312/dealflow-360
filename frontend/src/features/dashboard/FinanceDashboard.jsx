import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Building,
  RefreshCw,
  ArrowRight,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function FinanceDashboard() {
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
      setError(err.response?.data?.message || "Failed to load Finance Dashboard.");
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
  const payments = data?.payment_summary || { methods: [] };
  const overdue = data?.overdue_invoices || [];
  const subs = data?.subscriptions || {};

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Finance & Revenue Control Center
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Monitor billing schedules, outstanding receivables, overdue payments, and subscription MRR.
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

        {/* Finance KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Invoiced"
            value={`₹${(kpis.total_invoiced / 100000).toFixed(1)}L`}
            icon={Receipt}
            color="primary"
            description="Billed to customers"
          />
          <StatsCard
            title="Paid Collections"
            value={`₹${(kpis.paid / 100000).toFixed(1)}L`}
            icon={CheckCircle2}
            color="success"
            description="Collected revenue"
          />
          <StatsCard
            title="Outstanding"
            value={`₹${(kpis.outstanding / 100000).toFixed(1)}L`}
            icon={Clock}
            color="warning"
            description="Pending balance"
          />
          <StatsCard
            title="Overdue Invoices"
            value={`₹${(kpis.overdue / 100000).toFixed(1)}L`}
            icon={AlertCircle}
            color="danger"
            description="Payment past due date"
          />
        </div>

        {/* Overdue Invoices & Payment Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overdue Invoices Table */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-50 text-danger-700 rounded-xl border border-danger-200">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Overdue Invoices Alert
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Requires immediate financial follow-up
                  </p>
                </div>
              </div>
              <Link to="/dashboard/invoices" className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                View Invoices <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {overdue.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                <p className="font-bold text-text-primary">No Overdue Invoices</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                      <th className="py-3.5 px-6">Invoice</th>
                      <th className="py-3.5 px-6">Customer</th>
                      <th className="py-3.5 px-6">Days Overdue</th>
                      <th className="py-3.5 px-6 text-right">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {overdue.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-4 px-6 font-bold text-text-primary">
                          <Link to={`/dashboard/invoices/${inv.id}`} className="hover:text-primary-700">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="py-4 px-6 font-medium text-text-secondary">{inv.customer_name}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-danger-50 text-danger-700 border border-danger-200">
                            {inv.days_overdue} days overdue
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-black text-danger-700">
                          ₹{inv.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" /> Payment Breakdown
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-neutral-100">
                <span className="text-text-secondary">Successful</span>
                <span className="font-bold text-success-700 font-mono">₹{payments.successful}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-neutral-100">
                <span className="text-text-secondary">Pending</span>
                <span className="font-bold text-warning-700 font-mono">₹{payments.pending}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-neutral-100">
                <span className="text-text-secondary">Failed / Refunded</span>
                <span className="font-bold text-danger-600 font-mono">₹{payments.failed}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Payment Methods</h4>
              <div className="grid grid-cols-2 gap-3">
                {payments.methods.map((m, i) => (
                  <div key={i} className="p-3 bg-neutral-50 rounded-xl border border-border text-center">
                    <p className="text-xs text-text-muted">{m.name}</p>
                    <p className="text-sm font-black text-primary-700 mt-0.5">{m.percentage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Billing Overview */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-700" /> Subscription & Recurring Revenue
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
              <p className="text-xs font-bold text-primary-800">ACTIVE SUBSCRIPTIONS</p>
              <p className="text-2xl font-black text-primary-900 mt-1">{subs.active_subscriptions}</p>
            </div>
            <div className="p-4 rounded-xl bg-success-50 border border-success-200">
              <p className="text-xs font-bold text-success-800">MONTHLY RECURRING (MRR)</p>
              <p className="text-2xl font-black text-success-900 mt-1">₹{(subs.mrr / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-warning-50 border border-warning-200">
              <p className="text-xs font-bold text-warning-800">UPCOMING BILLING</p>
              <p className="text-2xl font-black text-warning-900 mt-1">₹{(subs.upcoming_billing / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-border">
              <p className="text-xs font-bold text-text-secondary">RENEWALS THIS MONTH</p>
              <p className="text-2xl font-black text-text-primary mt-1">{subs.renewals_this_month}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
