import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getCustomerPortalSummary } from "../../api/customers.api";
import { getQuotationById } from "../../api/quotations.api";
import NegotiationDrawer from "../negotiations/NegotiationDrawer";
import {
  FileText,
  ShoppingBag,
  Receipt,
  Truck,
  CheckCircle2,
  LogOut,
  User,
  ShieldCheck,
  RefreshCw,
  Clock,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerPortalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    quotations: [],
    orders: [],
    invoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Negotiation Drawer State
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isNegDrawerOpen, setIsNegDrawerOpen] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);

  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomerPortalSummary();
      setSummary(res.data || { quotations: [], orders: [], invoices: [] });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load portal commercial data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const handleOpenNegotiation = async (quotationId) => {
    try {
      setLoadingQuotation(true);
      const qData = await getQuotationById(quotationId);
      setSelectedQuotation(qData.quotation || qData);
      setIsNegDrawerOpen(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load quotation details for negotiation");
    } finally {
      setLoadingQuotation(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 font-extrabold text-white shadow-md">
            D
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              DealFlow360 Customer Portal
            </h1>
            <p className="text-xs text-text-muted">Commercial Account Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Customer Session
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-danger-50 hover:text-danger-700 text-xs font-semibold text-text-secondary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Welcome back, {user?.name || "Customer Representative"}!
              </h2>
              <Badge variant="primary">Customer Portal</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              Track active commercial proposals, order fulfillments, submit counter-offers, and inspect financial invoice settlements for your company.
            </p>
          </div>
          <button
            onClick={fetchSummaryData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface hover:bg-neutral-100 text-xs font-bold text-text-primary transition-colors self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>

        {/* Customer KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <FileText className="w-6 h-6 text-primary-600 mx-auto mb-1" />
            <p className="text-xs text-text-muted font-bold">OPEN PROPOSALS</p>
            <p className="text-xl font-black text-text-primary mt-1">{summary.quotations.filter(q => q.status !== 'CONVERTED' && q.status !== 'REJECTED').length}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <ShoppingBag className="w-6 h-6 text-indigo-600 mx-auto mb-1" />
            <p className="text-xs text-text-muted font-bold">ACTIVE ORDERS</p>
            <p className="text-xl font-black text-text-primary mt-1">{summary.orders.length}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <Receipt className="w-6 h-6 text-amber-600 mx-auto mb-1" />
            <p className="text-xs text-text-muted font-bold">PENDING INVOICES</p>
            <p className="text-xl font-black text-text-primary mt-1">{summary.invoices.filter(i => i.status !== 'PAID').length}</p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <Clock className="w-6 h-6 text-rose-600 mx-auto mb-1" />
            <p className="text-xs text-text-muted font-bold">OUTSTANDING BAL</p>
            <p className="text-xl font-black text-text-primary mt-1">
              ₹{(summary.invoices.reduce((acc, i) => acc + (Number(i.amount_due) || 0), 0) / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="p-4 bg-surface rounded-2xl border border-border shadow-xs text-center">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
            <p className="text-xs text-text-muted font-bold">ACTIVE SUBSCRIPTIONS</p>
            <p className="text-xl font-black text-text-primary mt-1">4</p>
          </div>
        </div>

        {/* Simplified Customer Deal Health (Point 35) */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 font-extrabold text-lg">
              78
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-text-primary">Commercial Account Health</h4>
                <Badge variant="warning">AT RISK</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                Tracking account status & operational delivery progress
              </p>
            </div>
          </div>
          <div className="text-xs text-text-muted space-y-1">
            <p className="font-semibold text-text-secondary">• Delivery pending for Order O-1002</p>
            <p className="font-semibold text-text-secondary">• Discount re-negotiation under manager review</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Section 1: Commercial Quotations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-bold text-text-primary">
                Commercial Proposals & Quotations
              </h3>
            </div>
            <span className="text-xs text-text-muted font-bold uppercase">
              {summary.quotations.length} Proposals
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-neutral-50 text-text-primary font-semibold border-b border-border text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Quotation #</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Proposal Status</th>
                    <th className="px-6 py-4">Sales Rep</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                        Loading proposals...
                      </td>
                    </tr>
                  ) : summary.quotations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                        No active commercial proposals found.
                      </td>
                    </tr>
                  ) : (
                    summary.quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary font-mono">
                          {q.quotation_number}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {q.currency} {Number(q.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              q.status === "APPROVED"
                                ? "success"
                                : q.status === "UNDER_REVIEW"
                                ? "warning"
                                : q.status === "REJECTED"
                                ? "danger"
                                : "neutral"
                            }
                          >
                            {q.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">{q.sales_rep_name || "Assigned Rep"}</td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {q.created_at ? new Date(q.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenNegotiation(q.id)}
                            disabled={loadingQuotation || q.status === "CONVERTED"}
                            className="text-xs font-semibold gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-50"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                            Re-Negotiate Deal
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Section 2: Sales Orders & Fulfillment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-text-primary">
                Sales Orders & Physical Delivery Pipeline
              </h3>
            </div>
            <span className="text-xs text-text-muted font-bold uppercase">
              {summary.orders.length} Orders
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-neutral-50 text-text-primary font-semibold border-b border-border text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Order Total</th>
                    <th className="px-6 py-4">Order Status</th>
                    <th className="px-6 py-4">Tracking Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                        Loading orders...
                      </td>
                    </tr>
                  ) : summary.orders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                        No active sales orders found.
                      </td>
                    </tr>
                  ) : (
                    summary.orders.map((o) => (
                      <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary font-mono">
                          {o.order_number}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {o.currency} {Number(o.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              o.status === "FULFILLED"
                                ? "success"
                                : o.status === "ORDERED"
                                ? "info"
                                : "neutral"
                            }
                          >
                            {o.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {o.tracking_number ? (
                            <span className="inline-flex items-center gap-1 font-bold text-primary-700">
                              <Truck className="w-3.5 h-3.5" /> {o.tracking_number}
                            </span>
                          ) : (
                            <span className="text-text-muted flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Awaiting Shipment
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Section 3: Invoices & Payment Settlements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-text-primary">
                Invoices & Financial Settlements
              </h3>
            </div>
            <span className="text-xs text-text-muted font-bold uppercase">
              {summary.invoices.length} Invoices
            </span>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-secondary">
                <thead className="bg-neutral-50 text-text-primary font-semibold border-b border-border text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Invoice #</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Settled Amount</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4">Issue Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : summary.invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                        No invoices issued.
                      </td>
                    </tr>
                  ) : (
                    summary.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                        <td className="px-6 py-4 font-bold text-text-primary font-mono">
                          {inv.invoice_number}
                        </td>
                        <td className="px-6 py-4 font-bold text-text-primary">
                          {inv.currency} {Number(inv.total_amount || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">
                          {inv.currency} {Number(inv.amount_paid || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              inv.status === "PAID"
                                ? "success"
                                : inv.status === "PARTIALLY_PAID"
                                ? "warning"
                                : "info"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-text-muted">
                          {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : "Draft"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* Negotiation Drawer Component */}
      {selectedQuotation && (
        <NegotiationDrawer
          isOpen={isNegDrawerOpen}
          onClose={() => setIsNegDrawerOpen(false)}
          quotation={selectedQuotation}
          onSuccess={fetchSummaryData}
        />
      )}
    </div>
  );
}
