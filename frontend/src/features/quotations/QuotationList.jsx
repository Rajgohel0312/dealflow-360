import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  getQuotations,
  createQuotation,
  deleteQuotation,
} from "../../api/quotations.api";
import { getCustomersBySalesRep } from "../../api/customers.api";
import { getPriceLists } from "../../api/catalog.api";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { getUserRole } from "../../utils/roleUtils";
import {
  FileText,
  Plus,
  Search,
  Eye,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  LayoutList,
  Columns,
  Clock,
  XCircle,
  ShoppingBag,
  Building2,
} from "lucide-react";

export default function QuotationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = getUserRole(user);
  const canCreateQuotation = role === "ADMIN" || role === "SALES_REP";
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode & Filters
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'table'
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    quotation_number: "",
    loading: false,
  });
  const [formData, setFormData] = useState({
    customer_id: "",
    price_list_id: "",
    currency: "INR",
    valid_until: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [qtnRes, custRes, plRes] = await Promise.all([
        getQuotations(),
        getCustomersBySalesRep(),
        getPriceLists(),
      ]);
      setQuotations(qtnRes.quotations || []);
      setCustomers(custRes.customers || []);
      const rawPriceLists = plRes.price_lists || plRes.priceLists || [];
      setPriceLists(rawPriceLists.filter((p) => p.is_active));
    } catch (err) {
      setErrorMsg("Failed to load quotations data");
    } finally {
      setLoading(false);
    }
  };

  const promptDeleteQuotation = (qtnId, qtnNum) => {
    setDeleteConfirm({
      isOpen: true,
      id: qtnId,
      quotation_number: qtnNum,
      loading: false,
    });
  };

  const executeDeleteQuotation = async () => {
    if (!deleteConfirm.id) return;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await deleteQuotation(deleteConfirm.id);
      setSuccessMsg(`Quotation ${deleteConfirm.quotation_number} deleted successfully!`);
      setDeleteConfirm({ isOpen: false, id: null, quotation_number: "", loading: false });
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to delete quotation");
      setDeleteConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFetchQuotations = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await getQuotations(params);
      setQuotations(res.quotations || []);
    } catch (err) {
      setErrorMsg("Failed to refresh quotations");
    }
  };

  useEffect(() => {
    handleFetchQuotations();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    setFormData({
      customer_id: customers[0]?.id || "",
      price_list_id: priceLists[0]?.id || "",
      currency: "INR",
      valid_until: "",
      notes: "",
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await createQuotation({
        customer_id: formData.customer_id,
        price_list_id: formData.price_list_id || null,
        currency: formData.currency,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
        notes: formData.notes,
      });

      setModalOpen(false);
      setSuccessMsg(`Quotation ${res.quotation.quotation_number} created successfully`);
      setTimeout(() => setSuccessMsg(""), 3000);
      navigate(`/dashboard/quotations/${res.quotation.id}`);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to create quotation draft"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "UNDER_REVIEW":
        return "warning";
      case "REJECTED":
        return "danger";
      case "SUBMITTED":
        return "info";
      default:
        return "neutral"; // DRAFT
    }
  };

  const filteredQuotations = quotations.filter((q) => {
    const term = search.toLowerCase();
    const matchNumber = q.quotation_number?.toLowerCase().includes(term);
    const matchCust = q.customer_name?.toLowerCase().includes(term);
    return matchNumber || matchCust;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Quotations Engine
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Create sales proposals, add volume product items, and execute discount risk checks.
            </p>
          </div>

          <div>
            {canCreateQuotation && (
              <Button onClick={handleOpenCreateModal} className="gap-2">
                <Plus className="w-4 h-4" /> Create Quotation
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls & View Toggle Switcher */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border shadow-xs">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Search by QTN number or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3.5 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary font-medium"
            >
              <option value="">All Workflow Stages</option>
              <option value="DRAFT">DRAFT</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Pending Approval)</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CONVERTED">CONVERTED</option>
            </select>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-border self-end md:self-auto">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "kanban"
                  ? "bg-surface text-primary-700 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-surface text-primary-700 shadow-xs"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              Table View
            </button>
          </div>
        </div>

        {/* Content Views: Kanban Board or Table */}
        {loading ? (
          <div className="p-16 text-center text-text-muted bg-surface rounded-2xl border border-border">
            Loading sales quotations...
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-16 text-center text-text-muted bg-surface rounded-2xl border border-border">
            No quotations found matching your filter criteria. Click "+ Create Quotation" to start a proposal.
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN BOARD VIEW - SLEEK HORIZONTAL & VERTICAL SCROLL EXPERIENCE */
          <div className="overflow-x-auto pb-4 -mx-1 px-1 scrollbar-thin">
            <div className="flex gap-4 min-w-max pb-2">
              {[
                {
                  id: "DRAFT",
                  label: "Draft Proposals",
                  badgeVariant: "neutral",
                  columnBg: "bg-surface border-border border-t-4 border-t-neutral-400",
                  badgeBg: "bg-neutral-100 text-neutral-800 border border-neutral-200",
                },
                {
                  id: "UNDER_REVIEW",
                  label: "Under Review",
                  badgeVariant: "warning",
                  columnBg: "bg-surface border-border border-t-4 border-t-amber-500",
                  badgeBg: "bg-amber-100 text-amber-900 border border-amber-200",
                },
                {
                  id: "APPROVED",
                  label: "Approved",
                  badgeVariant: "success",
                  columnBg: "bg-surface border-border border-t-4 border-t-emerald-500",
                  badgeBg: "bg-emerald-100 text-emerald-900 border border-emerald-200",
                },
                {
                  id: "REJECTED",
                  label: "Rejected",
                  badgeVariant: "danger",
                  columnBg: "bg-surface border-border border-t-4 border-t-rose-500",
                  badgeBg: "bg-rose-100 text-rose-900 border border-rose-200",
                },
                {
                  id: "CONVERTED",
                  label: "Converted Orders",
                  badgeVariant: "primary",
                  columnBg: "bg-surface border-border border-t-4 border-t-indigo-500",
                  badgeBg: "bg-indigo-100 text-indigo-900 border border-indigo-200",
                },
              ].map((col) => {
                const colQuotes = filteredQuotations.filter((q) => q.status === col.id);
                const totalVal = colQuotes.reduce((sum, q) => sum + Number(q.total_amount || 0), 0);

                return (
                  <div
                    key={col.id}
                    className={`w-[290px] rounded-2xl border ${col.columnBg} p-3.5 flex flex-col min-h-[400px] shadow-2xs space-y-3 shrink-0`}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-border">
                      <div className="min-w-0 pr-2">
                        <h3 className="font-extrabold text-xs text-text-primary tracking-tight truncate">
                          {col.label}
                        </h3>
                        <p className="text-[10px] font-mono font-semibold text-text-muted mt-0.5">
                          ₹{(totalVal / 100000).toFixed(1)}L Total
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black font-mono flex-shrink-0 ${col.badgeBg}`}>
                        {colQuotes.length}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="space-y-2.5 flex-1">
                      {colQuotes.length === 0 ? (
                        <div className="p-6 text-center text-[11px] text-text-muted border border-dashed border-border rounded-xl bg-neutral-50/50">
                          No {col.label.toLowerCase()}
                        </div>
                      ) : (
                        colQuotes.map((qtn) => (
                          <div
                            key={qtn.id}
                            className="bg-surface p-3 rounded-xl border border-border/80 shadow-2xs hover:border-primary-400 hover:shadow-xs transition-all space-y-2 group"
                          >
                            {/* Card Header Row */}
                            <div className="flex items-center justify-between gap-1.5">
                              <Link
                                to={`/dashboard/quotations/${qtn.id}`}
                                className="font-mono font-black text-xs text-primary-700 hover:text-primary-800 transition-colors truncate"
                              >
                                {qtn.quotation_number}
                              </Link>
                              <Badge variant={getStatusBadgeVariant(qtn.status)} className="text-[9px] py-0 px-1.5 font-bold flex-shrink-0">
                                {qtn.status}
                              </Badge>
                            </div>

                            {/* Customer & Portfolio Info */}
                            <div className="space-y-0.5">
                              <div className="font-bold text-xs text-text-primary flex items-center gap-1 truncate">
                                <Building2 className="w-3 h-3 text-text-muted flex-shrink-0" />
                                <span className="truncate">{qtn.customer_name}</span>
                              </div>
                              <div className="text-[10px] text-text-muted flex items-center justify-between">
                                <span>Tier: <strong className="text-text-primary">{qtn.customer_tier || "Bronze"}</strong></span>
                              </div>
                            </div>

                            {/* Proposal Monetary Total */}
                            <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                              <div>
                                <span className="text-[9px] uppercase font-extrabold text-text-muted block">Total Value</span>
                                <span className="font-mono font-extrabold text-xs text-emerald-700">
                                  ₹{Number(qtn.total_amount).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <span className="text-[9px] text-text-muted font-medium">
                                {new Date(qtn.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Card Action Links */}
                            <div className="pt-2 flex items-center justify-between gap-1.5 border-t border-border/40">
                              <Link
                                to={`/dashboard/quotations/${qtn.id}`}
                                className="flex-1 text-center py-1 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-text-primary font-bold text-[11px] transition-colors flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3 h-3 text-text-muted" />
                                {qtn.status === "DRAFT" ? "Edit" : "Details"}
                              </Link>

                              {canCreateQuotation && qtn.status !== "CONVERTED" && (
                                <button
                                  onClick={() => promptDeleteQuotation(qtn.id, qtn.quotation_number)}
                                  title="Delete Quotation"
                                  className="p-1 text-text-muted hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TABULAR VIEW */
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">QTN Number</th>
                    <th className="py-3.5 px-6">Customer & Tier</th>
                    <th className="py-3.5 px-6">Price List</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredQuotations.map((qtn) => (
                    <tr
                      key={qtn.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-primary-700">
                        {qtn.quotation_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {qtn.customer_name}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          Tier: <span className="font-semibold text-text-primary">{qtn.customer_tier || "Bronze"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {qtn.price_list_name || "Standard Base Price"}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">
                        ₹{Number(qtn.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getStatusBadgeVariant(qtn.status)}>
                          {qtn.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-text-muted text-xs">
                        {new Date(qtn.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right flex items-center justify-end gap-2">
                        <Link to={`/dashboard/quotations/${qtn.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-3.5 h-3.5" />
                            {qtn.status === "DRAFT" ? "Edit Line Items" : "View Details"}
                          </Button>
                        </Link>
                        {canCreateQuotation && qtn.status !== "CONVERTED" && (
                          <button
                            onClick={() => promptDeleteQuotation(qtn.id, qtn.quotation_number)}
                            title="Delete Quotation"
                            className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors inline-flex items-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Quotation Draft"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Select Assigned Customer *
            </label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Customer Company</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Tier: {c.customer_tier || "Bronze"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Select Price List
            </label>
            <select
              value={formData.price_list_id}
              onChange={(e) =>
                setFormData({ ...formData, price_list_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Standard Base Price List</option>
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name} ({pl.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Currency
              </label>
              <Input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Valid Until
              </label>
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) =>
                  setFormData({ ...formData, valid_until: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Proposal Notes
            </label>
            <textarea
              rows={3}
              placeholder="Enterprise software proposal notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Proposal Draft"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Sleek Delete Quotation Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, quotation_number: "", loading: false })}
        onConfirm={executeDeleteQuotation}
        title="Delete Proposal Draft"
        message={`Are you sure you want to delete quotation ${deleteConfirm.quotation_number}? This action will remove all negotiation logs and line items and cannot be undone.`}
        confirmText="Delete Proposal"
        variant="danger"
        loading={deleteConfirm.loading}
      />
    </DashboardLayout>
  );
}
