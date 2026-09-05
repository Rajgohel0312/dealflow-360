import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboardData } from "../../api/dashboard.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import {
  Boxes,
  Truck,
  Package,
  AlertTriangle,
  Building2,
  RefreshCw,
  ArrowRight,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

export default function OperationsDashboard() {
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
      setError(err.response?.data?.message || "Failed to load Operations Dashboard.");
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
  const inv = data?.inventory || { low_stock_items: [] };
  const warehouses = data?.warehouses || [];
  const pipeline = data?.fulfillment_pipeline || {};
  const alerts = data?.delivery_alerts || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Warehouse & Logistics Operations Hub
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage stock reservations, picking/packing workflow, warehouse splitting, and delivery alerts.
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

        {/* Ops KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Open Orders"
            value={kpis.open_orders}
            icon={Package}
            color="primary"
            description="Active sales orders"
          />
          <StatsCard
            title="Pending Fulfillment"
            value={kpis.pending_fulfillment}
            icon={Clock}
            color="warning"
            description="Stock reservation required"
          />
          <StatsCard
            title="Picking / Packing"
            value={(kpis.picking || 0) + (kpis.packed || 0)}
            icon={Boxes}
            color="info"
            description="In warehouse processing"
          />
          <StatsCard
            title="Shipped In Transit"
            value={kpis.shipped}
            icon={Truck}
            color="success"
            description="Out for delivery"
          />
        </div>

        {/* Fulfillment Pipeline Stage Breakdown */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-700" /> Fulfillment Stage Breakdown
            </h3>
            <Link to="/dashboard/fulfillment" className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
              View Pipeline <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-xl bg-neutral-100 border border-neutral-200">
              <p className="text-xs text-text-muted font-bold">PENDING</p>
              <p className="text-xl font-black text-text-primary mt-1">{pipeline.pending}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-800 font-bold">PICKING</p>
              <p className="text-xl font-black text-amber-900 mt-1">{pipeline.picking}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-800 font-bold">PACKED</p>
              <p className="text-xl font-black text-blue-900 mt-1">{pipeline.packed}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-xs text-indigo-800 font-bold">SHIPPED</p>
              <p className="text-xl font-black text-indigo-900 mt-1">{pipeline.shipped}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-800 font-bold">DELIVERED</p>
              <p className="text-xl font-black text-emerald-900 mt-1">{pipeline.delivered}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
              <p className="text-xs text-rose-800 font-bold">DELAYED</p>
              <p className="text-xl font-black text-rose-900 mt-1">{pipeline.delayed}</p>
            </div>
          </div>
        </div>

        {/* Low Stock & Warehouse Status Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Inventory Low Stock Alert */}
          <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-50 text-warning-700 rounded-xl border border-warning-200">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Stock & Reserved Inventory
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    SKUs with low available stock vs reserved commitments
                  </p>
                </div>
              </div>
              <Link to="/dashboard/inventory" className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
                Manage Stock <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 grid grid-cols-4 gap-4 border-b border-border bg-neutral-50/50 text-center">
              <div>
                <p className="text-xs text-text-muted font-bold">TOTAL SKUS</p>
                <p className="text-lg font-black text-text-primary mt-0.5">{inv.skus}</p>
              </div>
              <div>
                <p className="text-xs text-warning-800 font-bold">LOW STOCK</p>
                <p className="text-lg font-black text-warning-700 mt-0.5">{inv.low_stock}</p>
              </div>
              <div>
                <p className="text-xs text-danger-800 font-bold">OUT OF STOCK</p>
                <p className="text-lg font-black text-danger-700 mt-0.5">{inv.out_of_stock}</p>
              </div>
              <div>
                <p className="text-xs text-primary-800 font-bold">RESERVED</p>
                <p className="text-lg font-black text-primary-700 mt-0.5">{inv.reserved}</p>
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Low Stock SKUs</h4>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs font-bold text-text-muted uppercase">
                    <th className="py-2">Item Product</th>
                    <th className="py-2">On Hand</th>
                    <th className="py-2">Reserved</th>
                    <th className="py-2 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inv.low_stock_items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2.5 font-bold text-text-primary">{item.product_name}</td>
                      <td className="py-2.5 font-mono">{item.current}</td>
                      <td className="py-2.5 font-mono text-warning-700">{item.reserved}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-danger-600">{item.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivery Alerts & Warehouses */}
          <div className="space-y-6">
            {/* Delivery Alerts */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-danger-600" /> Operational Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((al, idx) => (
                  <div key={idx} className={`p-3 rounded-xl border text-xs font-medium ${al.type === "DANGER" ? "bg-danger-50 border-danger-200 text-danger-900" : "bg-warning-50 border-warning-200 text-warning-900"}`}>
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {al.id}
                    </p>
                    <p className="mt-1 text-text-secondary">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Warehouse Status */}
            <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
              <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-600" /> Warehouse Status
              </h3>
              <div className="space-y-3">
                {warehouses.map((wh, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-border">
                    <div>
                      <p className="font-bold text-sm text-text-primary">{wh.name}</p>
                      <p className="text-xs text-text-muted">{wh.orders} active orders assigned</p>
                    </div>
                    <span className="px-3 py-1 bg-primary-100 text-primary-800 font-bold rounded-lg text-xs">
                      {wh.utilization} Utilization
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
