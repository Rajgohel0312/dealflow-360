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
// Role utils
import { getUserRole } from "../../utils/roleUtils";
import { FileText, Plus, Search, Eye, ArrowRight, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";

export default function QuotationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = getUserRole(user);
  const canCreateQuotation = role === "ADMIN" || role === "SALES_REP";
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [priceLists, setPriceLists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
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
      setPriceLists((plRes.priceLists || []).filter((p) => p.is_active));
    } catch (err) {
      setErrorMsg("Failed to load quotations data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuotation = async (qtnId, qtnNum) => {
    if (!window.confirm(`Are you sure you want to delete quotation ${qtnNum}?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await deleteQuotation(qtnId);
      setSuccessMsg(`Quotation ${qtnNum} deleted successfully!`);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to delete quotation");
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

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by QTN number or customer name..."
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
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Pending Manager)</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading quotations...
            </div>
          ) : filteredQuotations.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No quotations found. Click "+ Create Quotation" to start a new proposal.
            </div>
          ) : (
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
                            onClick={() => handleDeleteQuotation(qtn.id, qtn.quotation_number)}
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
          )}
        </div>
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
    </DashboardLayout>
  );
}
