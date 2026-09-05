import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { getOrderById } from "../../api/orders.api";
import { getWarehouses } from "../../api/inventory.api";
import { createFulfillment } from "../../api/fulfillment.api";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  Box,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Receipt,
} from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = getUserRole(user);

  const canFulfill = userRole === "ADMIN" || userRole === "OPERATIONS" || userRole === "MANAGER";
  const canInvoice = userRole === "ADMIN" || userRole === "FINANCE";

  const [order, setOrder] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fulfill modal state
  const [fulfillModalOpen, setFulfillModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [fulfilling, setFulfilling] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [fulfillError, setFulfillError] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const [orderRes, whRes] = await Promise.all([
        getOrderById(id),
        getWarehouses(),
      ]);
      setOrder(orderRes.order || orderRes);
      const whList = whRes.warehouses || whRes || [];
      setWarehouses(whList);
      if (whList.length > 0) {
        setSelectedWarehouse(whList[0].id);
      }
    } catch (err) {
      setErrorMsg("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    setCreatingInvoice(true);
    setErrorMsg("");
    try {
      const res = await createInvoiceFromOrder(id);
      const invId = res.invoice?.id || res.id;
      navigate(`/dashboard/invoices/${invId}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to generate invoice from order");
    } finally {
      setCreatingInvoice(false);
    }
  };

  const handleCreateFulfillment = async (e) => {
    e.preventDefault();
    if (!selectedWarehouse) {
      setFulfillError("Please select a warehouse for physical stock reservation");
      return;
    }
    setFulfilling(true);
    setFulfillError("");
    try {
      await createFulfillment(id, selectedWarehouse);
      setFulfillModalOpen(false);
      navigate("/dashboard/fulfillment");
    } catch (err) {
      setFulfillError(err.response?.data?.message || "Failed to create fulfillment");
    } finally {
      setFulfilling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Loading sales order details...
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Sales order not found.
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "FULFILLED":
        return <Badge variant="success">FULFILLED</Badge>;
      case "PROCESSING":
        return <Badge variant="primary">PROCESSING</Badge>;
      case "CANCELLED":
        return <Badge variant="danger">CANCELLED</Badge>;
      default:
        return <Badge variant="warning">PENDING FULFILLMENT</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          to="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sales Orders
        </Link>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-800 border border-danger-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary font-mono">
                {order.order_number}
              </h1>
              {getStatusBadge(order.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-text-muted">
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Customer
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {order.customer_name}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Quotation Ref
                </span>
                <span className="text-sm font-mono text-primary-700 font-bold">
                  {order.quotation_number || "Direct"}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Order Date
                </span>
                <span className="text-sm text-text-secondary">
                  {new Date(order.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Total Value
                </span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  ₹{Number(order.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {order.status === "CONFIRMED" && canFulfill && (
              <Button
                onClick={() => setFulfillModalOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Truck className="w-4 h-4" /> Reserve Stock & Fulfill Order
              </Button>
            )}
            {order.status !== "CONFIRMED" && canFulfill && (
              <Link to="/dashboard/fulfillment">
                <Button variant="outline" className="gap-2">
                  <Truck className="w-4 h-4" /> View Fulfillment Pipeline
                </Button>
              </Link>
            )}
            {canInvoice && (
              order.invoice_id ? (
                <Link to={`/dashboard/invoices/${order.invoice_id}`}>
                  <Button className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white">
                    <Receipt className="w-4 h-4" /> View Invoice ({order.invoice_number || "INV"})
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleCreateInvoice}
                  disabled={creatingInvoice}
                  className="gap-2 bg-emerald-700 hover:bg-emerald-800 text-white"
                >
                  <Receipt className="w-4 h-4" />
                  {creatingInvoice ? "Generating Invoice..." : "Create Commercial Invoice"}
                </Button>
              )
            )}
          </div>
        </div>

        {/* Order Line Items Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-neutral-50/50 flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Confirmed Line Items ({order.items?.length || 0})
            </h3>
          </div>

          {!order.items || order.items.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No items recorded for this sales order.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Product / SKU</th>
                    <th className="py-3.5 px-6">Qty Ordered</th>
                    <th className="py-3.5 px-6">Unit Price</th>
                    <th className="py-3.5 px-6">Discount</th>
                    <th className="py-3.5 px-6">Tax</th>
                    <th className="py-3.5 px-6 font-bold">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {item.product_name}
                        </div>
                        <div className="text-xs font-mono text-text-muted">
                          SKU: {item.product_sku}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-text-primary">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 font-mono text-text-secondary">
                        ₹{Number(item.unit_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-amber-700 font-semibold">
                        ₹{Number(item.discount_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-text-muted text-xs">
                        ₹{Number(item.tax_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">
                        ₹{Number(item.line_total).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-surface p-6 rounded-2xl border border-border space-y-3">
            <div className="flex justify-between text-sm text-text-muted">
              <span>Gross Subtotal</span>
              <span className="font-semibold text-text-primary">
                ₹{Number(order.subtotal).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm text-amber-700">
              <span>Applied Discount</span>
              <span className="font-semibold">
                -₹{Number(order.discount_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-muted">
              <span>GST Tax</span>
              <span className="font-semibold text-text-primary">
                +₹{Number(order.tax_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="pt-3 border-t border-border flex justify-between text-base font-extrabold text-text-primary">
              <span>Grand Total</span>
              <span className="text-emerald-700">
                ₹{Number(order.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reserve Stock & Fulfill Modal */}
      <Modal
        isOpen={fulfillModalOpen}
        onClose={() => setFulfillModalOpen(false)}
        title="Initiate Physical Warehouse Fulfillment"
      >
        <form onSubmit={handleCreateFulfillment} className="space-y-4">
          {fulfillError && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {fulfillError}
            </div>
          )}

          <p className="text-sm text-text-secondary">
            Select the dispatch warehouse to check physical availability and reserve items for Sales Order <strong className="font-mono text-text-primary">{order.order_number}</strong>.
          </p>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Fulfillment Warehouse *
            </label>
            <select
              required
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code}) — {wh.location || "Main Location"}
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Box className="w-4 h-4 text-indigo-600" /> Stock Reservation Guard
            </div>
            <div>
              Initiating fulfillment will attempt to lock available stock units across order line items. If stock is insufficient, the system will raise an inventory error.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFulfillModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={fulfilling} className="bg-indigo-600 hover:bg-indigo-700">
              {fulfilling ? "Reserving Stock..." : "Initiate Fulfillment"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
