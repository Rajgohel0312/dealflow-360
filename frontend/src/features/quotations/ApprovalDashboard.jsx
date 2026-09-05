import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import {
  getPendingApprovals,
  approveQuotation,
  rejectQuotation,
} from "../../api/quotations.api";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function ApprovalDashboard() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Action Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState("APPROVE"); // 'APPROVE' or 'REJECT'
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getPendingApprovals();
      setApprovals(res.approvals || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setErrorMsg("Access Denied: You do not have permission to view or manage pending quotation approvals.");
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to load pending approval requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (quotationId, type) => {
    setSelectedQuotationId(quotationId);
    setActionType(type);
    setComments(type === "APPROVE" ? "Approved by manager" : "Rejected by manager");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedQuotationId) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      if (actionType === "APPROVE") {
        await approveQuotation(selectedQuotationId, { comments });
        setSuccessMsg("Quotation approved successfully!");
      } else {
        await rejectQuotation(selectedQuotationId, { comments });
        setSuccessMsg("Quotation rejected!");
      }

      setModalOpen(false);
      fetchPendingApprovals();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to execute approval action"
      );
    } finally {
      setSubmitting(false);
    }
  };

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
              <CheckSquare className="w-6 h-6 text-primary-600" />
              Manager Approval Queue
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Review quotations with discount rule escalations or high-risk thresholds.
            </p>
          </div>
        </div>

        {/* Approvals List / Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading pending approvals...
            </div>
          ) : approvals.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No pending quotation approvals at this time. All submissions are up to date!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">QTN Number</th>
                    <th className="py-3.5 px-6">Customer & Tier</th>
                    <th className="py-3.5 px-6">Sales Rep</th>
                    <th className="py-3.5 px-6">Risk Level</th>
                    <th className="py-3.5 px-6">Escalation Comments</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {approvals.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6 font-mono font-bold text-primary-700">
                        {item.quotation_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {item.customer_name}
                        </div>
                        <div className="text-xs text-text-muted mt-0.5">
                          Tier: <span className="font-semibold text-text-primary">{item.customer_tier || "Bronze"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {item.sales_rep_name}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            item.risk_level === "FINANCE"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {item.risk_level} Risk
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-xs text-text-muted max-w-xs truncate">
                        {item.comments || "Discount limit exceeded"}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">
                        ₹{Number(item.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link to={`/dashboard/quotations/${item.quotation_id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>

                        <Button
                          onClick={() => handleOpenActionModal(item.quotation_id, "APPROVE")}
                          size="sm"
                          className="bg-emerald-700 hover:bg-emerald-800 gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </Button>

                        <Button
                          onClick={() => handleOpenActionModal(item.quotation_id, "REJECT")}
                          variant="danger"
                          size="sm"
                          className="gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approve / Reject Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={actionType === "APPROVE" ? "Approve Quotation" : "Reject Quotation"}
      >
        <form onSubmit={handleExecuteAction} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Approver Notes / Reason
            </label>
            <textarea
              rows={3}
              required
              placeholder="Enter approval comments..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
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
            <Button
              type="submit"
              disabled={submitting}
              variant={actionType === "APPROVE" ? "primary" : "danger"}
            >
              {submitting
                ? "Processing..."
                : actionType === "APPROVE"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
