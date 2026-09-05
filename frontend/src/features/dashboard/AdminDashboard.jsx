import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  Users,
  Building2,
  Package,
  FileText,
  ShoppingBag,
  TrendingUp,
  Receipt,
  DollarSign,
  Shield,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function AdminDashboard() {
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
      setError(err.response?.data?.message || "Failed to load Admin Dashboard.");
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Enterprise Admin System Command Center
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Full enterprise visibility across users, customer companies, product catalogs, order pipeline, and financial ledgers.
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

        {/* Master Entity Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold">TOTAL USERS</p>
            <p className="text-2xl font-black text-text-primary mt-1">{kpis.total_users}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <Building2 className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold">CUSTOMERS</p>
            <p className="text-2xl font-black text-text-primary mt-1">{kpis.total_customers}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <Package className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold">PRODUCTS</p>
            <p className="text-2xl font-black text-text-primary mt-1">{kpis.total_products}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <FileText className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold">QUOTATIONS</p>
            <p className="text-2xl font-black text-text-primary mt-1">{kpis.total_quotations}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <ShoppingBag className="w-6 h-6 text-violet-600 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold">ORDERS</p>
            <p className="text-2xl font-black text-text-primary mt-1">{kpis.total_orders}</p>
          </div>
        </div>

        {/* Financial Ledgers & Revenue */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Pipeline Value"
            value={`₹${(kpis.pipeline_value / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="primary"
            description="Total deal pipeline"
          />
          <StatsCard
            title="Total Invoiced"
            value={`₹${(kpis.invoiced / 100000).toFixed(1)}L`}
            icon={Receipt}
            color="info"
            description="Issued commercial invoices"
          />
          <StatsCard
            title="Collected Revenue"
            value={`₹${(kpis.collected / 100000).toFixed(1)}L`}
            icon={DollarSign}
            color="success"
            description="Bank settlements"
          />
          <StatsCard
            title="Outstanding"
            value={`₹${(kpis.outstanding / 100000).toFixed(1)}L`}
            icon={Shield}
            color="danger"
            description="Uncollected balance"
          />
        </div>

        {/* Quick Admin Actions Grid */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <h3 className="text-base font-bold text-text-primary">Enterprise Administration Shortcuts</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link to="/dashboard/users" className="p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors flex items-center justify-between font-bold text-sm text-text-primary">
              Manage Users <ArrowRight className="w-4 h-4 text-primary-600" />
            </Link>
            <Link to="/dashboard/discount-rules" className="p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors flex items-center justify-between font-bold text-sm text-text-primary">
              Discount Rules <ArrowRight className="w-4 h-4 text-primary-600" />
            </Link>
            <Link to="/dashboard/price-lists" className="p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors flex items-center justify-between font-bold text-sm text-text-primary">
              Price Lists <ArrowRight className="w-4 h-4 text-primary-600" />
            </Link>
            <Link to="/dashboard/reports" className="p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors flex items-center justify-between font-bold text-sm text-text-primary">
              Audit & Reports <ArrowRight className="w-4 h-4 text-primary-600" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
