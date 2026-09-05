import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { getExecutiveDashboardReports } from "../../api/reports.api";
import { Badge } from "../../components/ui/Badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Percent,
  Boxes,
  Truck,
  FileCheck2,
  PieChart,
  Activity,
} from "lucide-react";

export default function ExecutiveReports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getExecutiveDashboardReports();
      setReports(res.reports || res);
    } catch (err) {
      setErrorMsg("Failed to load executive reports dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Generating executive commercial analytics & reporting metrics...
        </div>
      </DashboardLayout>
    );
  }

  if (errorMsg || !reports) {
    return (
      <DashboardLayout>
        <div className="p-4 rounded-xl bg-danger-50 text-danger-800 border border-danger-200 text-sm font-medium">
          {errorMsg || "Failed to render executive reports"}
        </div>
      </DashboardLayout>
    );
  }

  const { sales, revenue, discounts, inventory, fulfillment } = reports;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-primary-600" />
              Executive DealFlow Analytics & Reports
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Consolidated real-time operational intelligence across Sales Conversion, Financial Collection, Margins, Stock Balances, and Delivery Pipeline.
            </p>
          </div>
        </div>

        {/* Top Summary Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-text-muted">
              <span>Proposal Conversion</span>
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-text-primary font-mono">
              {sales.conversion_rate_percent}%
            </div>
            <div className="text-xs text-text-muted">
              {sales.quotations.approved_count} of {sales.quotations.total_quotations} Proposals Approved
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-text-muted">
              <span>Total Revenue Invoiced</span>
              <DollarSign className="w-4 h-4 text-primary-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700 font-mono">
              ₹{Number(revenue.total_invoiced).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-emerald-800 font-semibold">
              ₹{Number(revenue.total_paid).toLocaleString("en-IN")} Collected
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-text-muted">
              <span>Average Commercial Disc</span>
              <Percent className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-extrabold text-amber-700 font-mono">
              {Number(discounts.avg_discount_percent).toFixed(1)}%
            </div>
            <div className="text-xs text-text-muted">
              Max Disc: {Number(discounts.max_discount_percent).toFixed(1)}%
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase text-text-muted">
              <span>Warehouse Stock Issued</span>
              <Truck className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-700 font-mono">
              {fulfillment.delivered_count} / {fulfillment.total_fulfillments}
            </div>
            <div className="text-xs text-text-muted">
              Packages Delivered to Customers
            </div>
          </div>
        </div>

        {/* Detailed Report Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales & Orders Conversion Breakdown */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Sales Funnel & Quotation Pipeline
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Total Quotations Drafted</span>
                <span className="font-bold text-text-primary">{sales.quotations.total_quotations}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Approved Commercial Proposals</span>
                <span className="font-bold text-emerald-700">{sales.quotations.approved_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Pending Manager Approvals</span>
                <span className="font-bold text-amber-700">{sales.quotations.review_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Total Orders Converted</span>
                <span className="font-bold text-text-primary">{sales.orders.total_orders}</span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-extrabold text-base">
                <span>Total Gross Sales Value</span>
                <span className="text-emerald-700">
                  ₹{Number(sales.orders.total_order_value).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue & Collections Breakdown */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <DollarSign className="w-5 h-5 text-primary-600" /> Billing Collection & Outstanding
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Invoices Issued</span>
                <span className="font-bold text-text-primary">{revenue.total_invoices}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Fully Paid Invoices</span>
                <span className="font-bold text-emerald-700">{revenue.paid_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Partially Paid Invoices</span>
                <span className="font-bold text-indigo-700">{revenue.partial_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Total Cash Received</span>
                <span className="font-bold text-emerald-700 font-mono">
                  ₹{Number(revenue.total_paid).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-extrabold text-base">
                <span>Outstanding Receivables</span>
                <span className="text-amber-700 font-mono">
                  ₹{Number(revenue.total_outstanding).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Warehouse & Stock Level Report */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <Boxes className="w-5 h-5 text-indigo-600" /> Physical Inventory Balances
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Total Stock On Hand</span>
                <span className="font-bold text-text-primary">{inventory.total_on_hand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Reserved for Sales Orders</span>
                <span className="font-bold text-amber-700">{inventory.total_reserved}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Available Stock Balance</span>
                <span className="font-bold text-emerald-700">{inventory.total_available}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-muted">Low Stock SKU Items</span>
                <Badge variant={inventory.low_stock_items > 0 ? "warning" : "success"}>
                  {inventory.low_stock_items} SKUs
                </Badge>
              </div>
            </div>
          </div>

          {/* Fulfillment Pipeline Stage Distribution */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="font-bold text-text-primary text-base flex items-center gap-2 border-b border-border pb-3">
              <Truck className="w-5 h-5 text-blue-600" /> Fulfillment Pipeline Distribution
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Stage 1: Reserved (Pending)</span>
                <span className="font-bold text-text-primary">{fulfillment.pending_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Stage 2: Picking from Shelves</span>
                <span className="font-bold text-amber-700">{fulfillment.picking_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Stage 3: Packed in Parcels</span>
                <span className="font-bold text-indigo-700">{fulfillment.packed_count}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Stage 4: Shipped with Tracking</span>
                <span className="font-bold text-blue-700">{fulfillment.shipped_count}</span>
              </div>
              <div className="flex justify-between py-2 font-extrabold text-emerald-700">
                <span>Stage 5: Delivered & Issued</span>
                <span>{fulfillment.delivered_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
