import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getOrders } from "../../api/orders.api";
import { ShoppingBag, Search, Eye, ArrowRight, CheckCircle2 } from "lucide-react";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getOrders(params);
      setOrders(res.orders || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "FULFILLED":
        return "success";
      case "PROCESSING":
        return "warning";
      case "CANCELLED":
        return "danger";
      default:
        return "primary"; // CONFIRMED
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = search.toLowerCase();
    return (
      o.order_number?.toLowerCase().includes(term) ||
      o.customer_name?.toLowerCase().includes(term) ||
      o.quotation_number?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-primary-600" />
              Sales Orders
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Confirmed commercial sales orders converted from approved proposal quotations.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by SO number, QTN number or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="">All Order Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING (In Fulfillment)</option>
              <option value="FULFILLED">FULFILLED (Delivered)</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading sales orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No sales orders found. Convert an APPROVED proposal to generate an order!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Order Number</th>
                    <th className="py-3.5 px-6">Customer & Tier</th>
                    <th className="py-3.5 px-6">Source Proposal</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Order Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6 font-mono font-bold text-primary-700">
                        {o.order_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {o.customer_name}
                        </div>
                        <div className="text-xs text-text-muted">
                          Tier: {o.customer_tier || "Bronze"}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-text-secondary">
                        {o.quotation_number || "Direct Order"}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">
                        ₹{Number(o.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getStatusBadgeVariant(o.status)}>
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-text-muted text-xs">
                        {new Date(o.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/dashboard/orders/${o.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> View Order
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
      </div>
    </DashboardLayout>
  );
}
