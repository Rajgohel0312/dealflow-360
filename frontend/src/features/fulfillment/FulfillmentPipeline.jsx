import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import {
  getFulfillments,
  pickFulfillment,
  packFulfillment,
  shipFulfillment,
  deliverFulfillment,
} from "../../api/fulfillment.api";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import {
  Truck,
  Box,
  CheckCircle2,
  PackageCheck,
  Navigation,
  CheckCheck,
  Search,
  Building,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function FulfillmentPipeline() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const canManageFulfillment = userRole === "ADMIN" || userRole === "OPERATIONS" || userRole === "MANAGER";
  const [fulfillments, setFulfillments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Ship modal
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [selectedFulfillmentId, setSelectedFulfillmentId] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFulfillments();
  }, []);

  const fetchFulfillments = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getFulfillments();
      setFulfillments(res.fulfillments || res || []);
    } catch (err) {
      setErrorMsg("Failed to load warehouse fulfillment pipeline");
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async (id) => {
    try {
      await pickFulfillment(id);
      setSuccessMsg("Order items picked from warehouse shelves");
      fetchFulfillments();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update picking status");
    }
  };

  const handlePack = async (id) => {
    try {
      await packFulfillment(id);
      setSuccessMsg("Parcel packaged and ready for dispatch");
      fetchFulfillments();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update packing status");
    }
  };

  const handleOpenShipModal = (id) => {
    setSelectedFulfillmentId(id);
    setTrackingNumber(`TRK-BLR-${Math.floor(100000 + Math.random() * 900000)}`);
    setShipModalOpen(true);
  };

  const handleShipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFulfillmentId) return;
    setSubmitting(true);
    try {
      await shipFulfillment(selectedFulfillmentId, trackingNumber);
      setShipModalOpen(false);
      setSuccessMsg("Shipment dispatched with tracking details");
      fetchFulfillments();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to ship package");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliver = async (id) => {
    if (!confirm("Confirm delivery to customer? This will deduct reserved warehouse stock and mark Sales Order as FULFILLED.")) return;
    try {
      await deliverFulfillment(id);
      setSuccessMsg("Package delivered! Physical stock deducted & Sales Order completed.");
      fetchFulfillments();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to complete delivery");
    }
  };

  const filteredFulfillments = fulfillments.filter((f) => {
    const matchesSearch =
      f.fulfillment_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? f.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const renderStatusPipeline = (status) => {
    const steps = [
      { key: "PENDING", label: "Reserved" },
      { key: "PICKING", label: "Picking" },
      { key: "PACKED", label: "Packed" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
    ];

    const activeIndex = steps.findIndex((s) => s.key === status);

    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, idx) => {
          const isDone = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          return (
            <div key={step.key} className="flex items-center gap-1 sm:gap-2">
              <div
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  isCurrent
                    ? "bg-primary-600 text-white shadow-sm"
                    : isDone
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-neutral-100 text-text-muted"
                }`}
              >
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-neutral-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Truck className="w-7 h-7 text-primary-600" />
              Warehouse Fulfillment Pipeline
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Track warehouse stock dispatch through 5 operational stages: Reservation $\rightarrow$ Picking $\rightarrow$ Packing $\rightarrow$ Shipping $\rightarrow$ Physical Issue Delivery.
            </p>
          </div>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-800 border border-danger-200 text-sm font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search fulfillment #, order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Pipeline Stages</option>
            <option value="PENDING">PENDING (Reserved)</option>
            <option value="PICKING">PICKING</option>
            <option value="PACKED">PACKED</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
        </div>

        {/* Fulfillment List Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-border">
              Loading warehouse fulfillment queue...
            </div>
          ) : filteredFulfillments.length === 0 ? (
            <div className="p-12 text-center text-text-muted bg-surface rounded-2xl border border-border">
              No active warehouse fulfillments matching your search. Create fulfillments from confirmed Sales Orders!
            </div>
          ) : (
            filteredFulfillments.map((f) => (
              <div
                key={f.id}
                className="bg-surface p-6 rounded-2xl border border-border space-y-4 hover:border-primary-200 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                      <Box className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-text-primary font-mono">
                          {f.fulfillment_number}
                        </span>
                        <Badge
                          variant={
                            f.status === "DELIVERED"
                              ? "success"
                              : f.status === "SHIPPED"
                              ? "primary"
                              : "warning"
                          }
                        >
                          {f.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        Sales Order: <span className="font-mono font-bold text-text-primary">{f.order_number}</span> | Customer: <span className="font-semibold text-text-primary">{f.customer_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Progress Bar */}
                  {renderStatusPipeline(f.status)}
                </div>

                {/* Body Details & Action Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-text-muted">
                    <div>
                      <span className="block font-bold text-text-primary uppercase">
                        Dispatch Warehouse
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        {f.warehouse_name}
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-text-primary uppercase">
                        Tracking Number
                      </span>
                      <span className="text-sm font-mono text-primary-700 font-bold">
                        {f.tracking_number || "Not Shipped Yet"}
                      </span>
                    </div>
                    <div>
                      <span className="block font-bold text-text-primary uppercase">
                        Created Date
                      </span>
                      <span className="text-sm text-text-secondary">
                        {new Date(f.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Pipeline Stage Action Buttons */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {canManageFulfillment && (
                      <>
                        {f.status === "PENDING" && (
                          <Button
                            onClick={() => handlePick(f.id)}
                            className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                          >
                            <PackageCheck className="w-4 h-4" /> Start Item Picking
                          </Button>
                        )}

                        {f.status === "PICKING" && (
                          <Button
                            onClick={() => handlePack(f.id)}
                            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                          >
                            <Box className="w-4 h-4" /> Pack Items in Parcel
                          </Button>
                        )}

                        {f.status === "PACKED" && (
                          <Button
                            onClick={() => handleOpenShipModal(f.id)}
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Navigation className="w-4 h-4" /> Dispatch & Ship
                          </Button>
                        )}

                        {f.status === "SHIPPED" && (
                          <Button
                            onClick={() => handleDeliver(f.id)}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCheck className="w-4 h-4" /> Confirm Customer Delivery
                          </Button>
                        )}
                      </>
                    )}

                    {f.status === "DELIVERED" && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Physical Stock Issued & Delivered
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dispatch Shipment Modal */}
      <Modal
        isOpen={shipModalOpen}
        onClose={() => setShipModalOpen(false)}
        title="Dispatch Shipment & Record Tracking"
      >
        <form onSubmit={handleShipSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Tracking / Waybill Number *
            </label>
            <Input
              required
              placeholder="e.g. TRK-992019"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" /> Carrier Dispatch Notification
            </div>
            <div>
              Submitting tracking details advances fulfillment status to <strong>SHIPPED</strong>.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShipModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
              {submitting ? "Dispatching..." : "Confirm Dispatch"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
