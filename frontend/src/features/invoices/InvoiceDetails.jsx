import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { getInvoiceById, issueInvoice, sendInvoiceEmail } from "../../api/invoices.api";
import { getCustomerUsers } from "../../api/customers.api";
import { recordPayment } from "../../api/payments.api";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import {
  Receipt,
  ArrowLeft,
  Send,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building,
  DollarSign,
  Mail,
} from "lucide-react";

export default function InvoiceDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const userRole = getUserRole(user);

  const canManagePayments = userRole === "ADMIN" || userRole === "FINANCE";
  const canIssueInvoice = userRole === "ADMIN" || userRole === "FINANCE";

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Action states
  const [issuing, setIssuing] = useState(false);
  const [issueConfirmOpen, setIssueConfirmOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    payment_method: "BANK_TRANSFER",
    transaction_reference: "",
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Email Recipient Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [customerUsers, setCustomerUsers] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState("ALL");
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [id]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const res = await getInvoiceById(id);
      const invData = res.invoice || res;
      setInvoice(invData);
      setPaymentFormData({
        amount: invData.amount_due || "",
        payment_method: "BANK_TRANSFER",
        transaction_reference: `TXN-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    } catch (err) {
      setErrorMsg("Failed to load commercial invoice details");
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = async () => {
    setEmailModalOpen(true);
    setSelectedRecipient("ALL");
    if (invoice?.customer_id) {
      setLoadingUsers(true);
      try {
        const res = await getCustomerUsers(invoice.customer_id);
        setCustomerUsers(res.customerUsers || []);
      } catch (err) {
        console.error("Failed to fetch customer users:", err);
      } finally {
        setLoadingUsers(false);
      }
    }
  };

  const handleIssueInvoice = async () => {
    setIssuing(true);
    setErrorMsg("");
    try {
      await issueInvoice(id);
      setSuccessMsg("Invoice issued to customer successfully");
      setIssueConfirmOpen(false);
      fetchInvoiceDetails();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to issue invoice");
    } finally {
      setIssuing(false);
    }
  };

  const handleSendInvoiceEmail = async (e) => {
    if (e) e.preventDefault();
    setSendingEmail(true);
    setErrorMsg("");
    try {
      const res = await sendInvoiceEmail(id, { recipientEmail: selectedRecipient });
      setSuccessMsg(res?.message || "Commercial Invoice email dispatch initiated successfully!");
      setEmailModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send invoice email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(paymentFormData.amount);
    if (!amountNum || amountNum <= 0) {
      setPaymentError("Payment amount must be greater than 0");
      return;
    }

    if (amountNum > Number(invoice.amount_due)) {
      setPaymentError(`Payment amount (₹${amountNum}) cannot exceed outstanding balance (₹${invoice.amount_due})`);
      return;
    }

    setSubmittingPayment(true);
    setPaymentError("");
    try {
      await recordPayment(id, {
        amount: amountNum,
        payment_method: paymentFormData.payment_method,
        transaction_reference: paymentFormData.transaction_reference,
      });
      setSuccessMsg("Payment recorded successfully");
      setPaymentModalOpen(false);
      fetchInvoiceDetails();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to record payment transaction");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Loading commercial invoice...
        </div>
      </DashboardLayout>
    );
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Invoice not found.
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">PAID IN FULL</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="primary">PARTIALLY PAID</Badge>;
      case "ISSUED":
        return <Badge variant="warning">ISSUED (UNPAID)</Badge>;
      case "OVERDUE":
        return <Badge variant="danger">OVERDUE</Badge>;
      default:
        return <Badge variant="neutral">DRAFT</Badge>;
    }
  };

  const paidPercentage = Math.min(
    100,
    Math.round((Number(invoice.amount_paid) / Number(invoice.total_amount)) * 100) || 0
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          to="/dashboard/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>

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

        {/* Invoice Header Card */}
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary font-mono">
                {invoice.invoice_number}
              </h1>
              {getStatusBadge(invoice.status)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-text-muted">
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Customer
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {invoice.customer_name}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Sales Order Ref
                </span>
                <span className="text-sm font-mono text-primary-700 font-bold">
                  {invoice.order_number}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Payment Due Date
                </span>
                <span className="text-sm font-semibold text-amber-800">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Total Bill Amount
                </span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openEmailModal}
              disabled={sendingEmail}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Mail className="w-4 h-4" />
              {sendingEmail ? "Sending..." : "Send Invoice Email"}
            </Button>

            {canManagePayments && (
              <>
                {canIssueInvoice && invoice.status === "DRAFT" && (
                  <Button
                    onClick={() => setIssueConfirmOpen(true)}
                    disabled={issuing}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Send className="w-4 h-4" />
                    {issuing ? "Issuing..." : "Issue Commercial Invoice"}
                  </Button>
                )}

                {(invoice.status === "ISSUED" || invoice.status === "PARTIALLY_PAID") && (
                  <Button
                    onClick={() => setPaymentModalOpen(true)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <CreditCard className="w-4 h-4" /> Record Payment
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Payment Settlement Tracker */}
        <div className="bg-surface p-6 rounded-2xl border border-border space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-text-muted">
            <span>Payment Settlement Progress</span>
            <span className="text-text-primary font-mono text-sm">
              {paidPercentage}% Settled
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                invoice.status === "PAID"
                  ? "bg-emerald-500"
                  : invoice.status === "PARTIALLY_PAID"
                  ? "bg-indigo-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${paidPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div>
              <span className="block text-text-muted">Total Invoiced</span>
              <span className="text-sm font-bold text-text-primary font-mono">
                ₹{Number(invoice.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="block text-text-muted">Total Paid</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">
                ₹{Number(invoice.amount_paid).toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="block text-text-muted">Outstanding Balance</span>
              <span className="text-sm font-bold text-amber-700 font-mono">
                ₹{Number(invoice.amount_due).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-neutral-50/50 flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Invoice Itemized Breakdown ({invoice.items?.length || 0})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                  <th className="py-3.5 px-6">Description / Product</th>
                  <th className="py-3.5 px-6">Qty</th>
                  <th className="py-3.5 px-6">Unit Price</th>
                  <th className="py-3.5 px-6">Discount</th>
                  <th className="py-3.5 px-6">GST (18%)</th>
                  <th className="py-3.5 px-6 font-bold">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items?.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50">
                    <td className="py-4 px-6">
                      <div className="font-bold text-text-primary">
                        {item.description || item.product_name}
                      </div>
                      <div className="text-xs font-mono text-text-muted">
                        SKU: {item.product_sku || "ITEM"}
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
        </div>

        {/* Payments History Audit Trail */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Payment Transaction History ({invoice.payments.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-text-muted uppercase">
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-primary-700">
                        {p.transaction_reference || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        {p.payment_method}
                      </td>
                      <td className="py-3 px-4 font-extrabold text-emerald-700 font-mono">
                        +₹{Number(p.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-text-muted font-mono">
                        {new Date(p.paid_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success">SUCCESS</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Record Financial Customer Payment"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          {paymentError && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {paymentError}
            </div>
          )}

          <div className="p-4 rounded-xl bg-neutral-50 border border-border text-xs space-y-1">
            <div className="font-bold text-text-primary">Outstanding Invoice Balance</div>
            <div className="text-base font-extrabold text-amber-700 font-mono">
              ₹{Number(invoice.amount_due).toLocaleString("en-IN")}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Payment Amount (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              max={invoice.amount_due}
              required
              value={paymentFormData.amount}
              onChange={(e) =>
                setPaymentFormData({ ...paymentFormData, amount: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Payment Method *
              </label>
              <select
                required
                value={paymentFormData.payment_method}
                onChange={(e) =>
                  setPaymentFormData({ ...paymentFormData, payment_method: e.target.value })
                }
                className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                <option value="UPI">UPI / Digital Transfer</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Payment</option>
                <option value="OTHER">Other Reference</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Transaction Ref #
              </label>
              <Input
                placeholder="e.g. UTR-9920192"
                value={paymentFormData.transaction_reference}
                onChange={(e) =>
                  setPaymentFormData({
                    ...paymentFormData,
                    transaction_reference: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submittingPayment} className="bg-indigo-600 hover:bg-indigo-700">
              {submittingPayment ? "Recording..." : "Confirm & Save Payment"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Issue Invoice Confirmation Modal */}
      <ConfirmModal
        isOpen={issueConfirmOpen}
        onClose={() => setIssueConfirmOpen(false)}
        onConfirm={handleIssueInvoice}
        title="Issue Commercial Invoice"
        message={`Are you sure you want to issue Invoice ${invoice?.invoice_number || ''} to customer ${invoice?.customer_name || ''}? Once issued, payment collection will begin.`}
        confirmText="Issue Invoice"
        variant="primary"
        loading={issuing}
      />

      {/* Send Invoice Email Recipient Selection Modal */}
      <Modal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Send Commercial Invoice Email"
      >
        <form onSubmit={handleSendInvoiceEmail} className="space-y-5">
          <div>
            <p className="text-xs text-text-muted mb-3">
              Select target recipient email address for Commercial Invoice <strong className="font-mono text-text-primary">#{invoice?.invoice_number}</strong>:
            </p>

            {loadingUsers ? (
              <div className="p-4 text-center text-xs text-text-muted">
                Loading customer user accounts...
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {/* Option 1: ALL */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedRecipient === "ALL" ? "border-primary-500 bg-primary-50/50" : "border-border hover:bg-neutral-50"}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="recipient"
                      value="ALL"
                      checked={selectedRecipient === "ALL"}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <span className="block text-sm font-bold text-text-primary">⚡ Send to All Recipients</span>
                      <span className="block text-xs text-text-muted">Company email + all registered customer user logins</span>
                    </div>
                  </div>
                  <Badge variant="primary">Broadcast</Badge>
                </label>

                {/* Option 2: Company Primary Email */}
                {invoice?.customer_email && (
                  <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedRecipient === invoice.customer_email ? "border-primary-500 bg-primary-50/50" : "border-border hover:bg-neutral-50"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="recipient"
                        value={invoice.customer_email}
                        checked={selectedRecipient === invoice.customer_email}
                        onChange={(e) => setSelectedRecipient(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="block text-sm font-bold text-text-primary">🏢 Customer Company Email</span>
                        <span className="block text-xs text-text-muted font-mono">{invoice.customer_email}</span>
                      </div>
                    </div>
                    <Badge variant="neutral">Company</Badge>
                  </label>
                )}

                {/* Options 3+: Registered Customer Users */}
                {customerUsers.map((emp) => (
                  <label key={emp.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${selectedRecipient === emp.email ? "border-primary-500 bg-primary-50/50" : "border-border hover:bg-neutral-50"}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="recipient"
                        value={emp.email}
                        checked={selectedRecipient === emp.email}
                        onChange={(e) => setSelectedRecipient(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="block text-sm font-bold text-text-primary">👤 {emp.name}</span>
                        <span className="block text-xs text-text-muted font-mono">{emp.email}</span>
                      </div>
                    </div>
                    <Badge variant="success font-mono">User</Badge>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sendingEmail} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Mail className="w-4 h-4" />
              {sendingEmail ? "Dispatching..." : "Send Email Now"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
