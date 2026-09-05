import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import {
  getQuotationById,
  addQuotationItem,
  deleteQuotationItem,
  submitQuotation,
} from "../../api/quotations.api";
import { convertQuotationToOrder } from "../../api/orders.api";
import { getProducts } from "../../api/catalog.api";
import {
  FileText,
  Plus,
  ArrowLeft,
  Trash2,
  Send,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import DealHealthWidget from "../dealHealth/DealHealthWidget";
import NegotiationDrawer from "../negotiations/NegotiationDrawer";

export default function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [itemFormData, setItemFormData] = useState({
    product_id: "",
    quantity: 1,
    discount_percent: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittingQuotation, setSubmittingQuotation] = useState(false);
  const [converting, setConverting] = useState(false);
  const [negDrawerOpen, setNegDrawerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submissionFeedback, setSubmissionFeedback] = useState(null);

  useEffect(() => {
    fetchQuotationData();
  }, [id]);

  const fetchQuotationData = async () => {
    setLoading(true);
    try {
      const [qtnRes, prodRes] = await Promise.all([
        getQuotationById(id),
        getProducts({ is_active: true }),
      ]);
      setQuotation(qtnRes.quotation || qtnRes);
      setProducts(prodRes.products || []);
    } catch (err) {
      setErrorMsg("Failed to load quotation details");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async () => {
    if (!confirm("Are you sure you want to convert this approved quotation into a Sales Order?")) return;
    setConverting(true);
    setErrorMsg("");
    try {
      const res = await convertQuotationToOrder(id);
      setSuccessMsg(`Quotation converted! Sales Order ${res.order?.order_number || ''} created.`);
      navigate(`/dashboard/orders/${res.order?.id}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to convert quotation to order");
      setConverting(false);
    }
  };

  const handleOpenAddItemModal = () => {
    setItemFormData({
      product_id: products[0]?.id || "",
      quantity: 1,
      discount_percent: 0,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      await addQuotationItem(id, {
        product_id: itemFormData.product_id,
        quantity: parseFloat(itemFormData.quantity),
        discount_percent: parseFloat(itemFormData.discount_percent || 0),
      });

      setModalOpen(false);
      setSuccessMsg("Product item added to quotation");
      fetchQuotationData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to add item to quotation"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to remove this line item?")) return;

    try {
      await deleteQuotationItem(id, itemId);
      setSuccessMsg("Line item removed");
      fetchQuotationData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to delete line item");
    }
  };

  const handleSubmitQuotation = async () => {
    if (!confirm("Are you ready to submit this quotation to the Discount & Risk Engine?"))
      return;

    setSubmittingQuotation(true);
    setErrorMsg("");
    setSubmissionFeedback(null);

    try {
      const result = await submitQuotation(id);
      setSubmissionFeedback(result);
      fetchQuotationData();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to submit quotation"
      );
    } finally {
      setSubmittingQuotation(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Loading proposal details...
        </div>
      </DashboardLayout>
    );
  }

  if (!quotation) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          Quotation not found.
        </div>
      </DashboardLayout>
    );
  }

  const isDraft = quotation.status === "DRAFT";

  const selectedProductObj = products.find(
    (p) => p.id === itemFormData.product_id
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          to="/dashboard/quotations"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quotations Engine
        </Link>

        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Submission Risk Feedback Banner */}
        {submissionFeedback && (
          <div
            className={`p-5 rounded-2xl border text-sm font-medium animate-in fade-in ${
              submissionFeedback.requires_approval
                ? "bg-amber-50 text-amber-900 border-amber-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {submissionFeedback.requires_approval ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-base">
                  {submissionFeedback.requires_approval
                    ? "Routed for Manager Approval"
                    : "Quotation Auto-Approved"}
                </h4>
                <p className="mt-1">{submissionFeedback.message}</p>
                {submissionFeedback.reasons && submissionFeedback.reasons.length > 0 && (
                  <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-amber-800 font-normal">
                    {submissionFeedback.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Deal Health Index Widget */}
        <DealHealthWidget quotationId={id} />

        {/* Header Summary */}
        <div className="bg-surface p-6 rounded-2xl border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-text-primary font-mono">
                {quotation.quotation_number}
              </h1>
              <Badge
                variant={
                  quotation.status === "APPROVED"
                    ? "success"
                    : quotation.status === "UNDER_REVIEW"
                    ? "warning"
                    : quotation.status === "REJECTED"
                    ? "danger"
                    : "neutral"
                }
              >
                {quotation.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs text-text-muted">
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Customer
                </span>
                <span className="text-sm font-semibold text-text-primary">
                  {quotation.customer_name}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Customer Tier
                </span>
                <Badge variant="primary" className="mt-0.5">
                  {quotation.customer_tier || "Bronze"} Tier
                </Badge>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Price List
                </span>
                <span className="text-sm text-text-secondary">
                  {quotation.price_list_name || "Base Price List"}
                </span>
              </div>
              <div>
                <span className="block font-bold text-text-primary uppercase">
                  Sales Rep
                </span>
                <span className="text-sm text-text-secondary">
                  {quotation.sales_rep_name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isDraft && (
              <>
                <Button
                  onClick={handleOpenAddItemModal}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Product Line
                </Button>
                <Button
                  onClick={handleSubmitQuotation}
                  disabled={submittingQuotation}
                  className="gap-2 bg-emerald-700 hover:bg-emerald-800"
                >
                  <Send className="w-4 h-4" />
                  {submittingQuotation ? "Validating..." : "Submit Quotation"}
                </Button>
              </>
            )}

            {!isDraft && quotation.status !== "CONVERTED" && (
              <Button
                variant="outline"
                onClick={() => setNegDrawerOpen(true)}
                className="gap-2 border-amber-300 text-amber-900 hover:bg-amber-50"
              >
                <MessageSquare className="w-4 h-4 text-amber-600" /> Re-Negotiate Deal
              </Button>
            )}

            {quotation.status === "APPROVED" && (
              <Button
                onClick={handleConvertToOrder}
                disabled={converting}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <ShoppingBag className="w-4 h-4" />
                {converting ? "Converting..." : "Convert to Sales Order"}
              </Button>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-neutral-50/50 flex items-center justify-between">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Quotation Line Items ({quotation.items?.length || 0})
            </h3>
          </div>

          {(!quotation.items || quotation.items.length === 0) ? (
            <div className="p-12 text-center text-text-muted">
              No products added to this proposal yet. Click "+ Add Product Line" to populate items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Product / SKU</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Qty</th>
                    <th className="py-3.5 px-6">Unit Price</th>
                    <th className="py-3.5 px-6">Disc %</th>
                    <th className="py-3.5 px-6">Disc Amount</th>
                    <th className="py-3.5 px-6">Tax (18%)</th>
                    <th className="py-3.5 px-6 font-bold">Line Total</th>
                    {isDraft && <th className="py-3.5 px-6 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotation.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {item.product_name}
                        </div>
                        <div className="text-xs font-mono text-text-muted">
                          SKU: {item.product_sku}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary text-xs">
                        {item.category_name}
                      </td>
                      <td className="py-4 px-6 font-bold text-text-primary">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-6 font-mono text-text-secondary">
                        ₹{Number(item.unit_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-bold text-amber-700">
                        {item.discount_percent}%
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        ₹{Number(item.discount_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-text-muted text-xs">
                        ₹{Number(item.tax_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-emerald-700">
                        ₹{Number(item.line_total).toLocaleString("en-IN")}
                      </td>
                      {isDraft && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-text-muted hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                            title="Delete Line Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals Summary Footer Card */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-surface p-6 rounded-2xl border border-border space-y-3">
            <div className="flex justify-between text-sm text-text-muted">
              <span>Gross Subtotal</span>
              <span className="font-semibold text-text-primary">
                ₹{Number(quotation.subtotal).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm text-amber-700">
              <span>Total Discount</span>
              <span className="font-semibold">
                -₹{Number(quotation.discount_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm text-text-muted">
              <span>Total Tax (GST)</span>
              <span className="font-semibold text-text-primary">
                +₹{Number(quotation.tax_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="pt-3 border-t border-border flex justify-between text-base font-extrabold text-text-primary">
              <span>Grand Total</span>
              <span className="text-emerald-700">
                ₹{Number(quotation.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Approval Audit Trail (if submitted or reviewed) */}
        {quotation.approvals && quotation.approvals.length > 0 && (
          <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
            <h3 className="font-bold text-text-primary text-sm uppercase tracking-wide">
              Approval Audit Trail
            </h3>
            <div className="space-y-3">
              {quotation.approvals.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl bg-neutral-50 border border-border text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">
                      Level: {app.approval_level} Approval
                    </span>
                    <Badge
                      variant={
                        app.status === "APPROVED"
                          ? "success"
                          : app.status === "REJECTED"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                  {app.approver_name && (
                    <div className="text-text-secondary">
                      Approver: <span className="font-semibold">{app.approver_name}</span>
                    </div>
                  )}
                  {app.comments && (
                    <div className="text-text-muted italic">
                      "{app.comments}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Line Item Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Product Line Item"
      >
        <form onSubmit={handleAddItem} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Select Product *
            </label>
            <select
              required
              value={itemFormData.product_id}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, product_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) — Base Price ₹{p.base_price}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Quantity *
              </label>
              <Input
                type="number"
                min="1"
                required
                value={itemFormData.quantity}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    quantity: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Requested Discount (%)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={itemFormData.discount_percent}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    discount_percent: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {selectedProductObj && (
            <div className="p-4 rounded-xl bg-primary-50/60 border border-primary-200 text-xs text-primary-900 space-y-1">
              <div className="font-bold">Catalog Pricing Preview</div>
              <div>Base Price: ₹{selectedProductObj.base_price} / unit</div>
              <div>Tax Rate: {selectedProductObj.tax_rate}% GST</div>
              <div className="text-text-muted text-[11px] mt-1">
                * Note: Price list volume discounts will automatically apply if minimum quantity tiers are met.
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Line Item"}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Re-Negotiation Drawer Modal */}
      <NegotiationDrawer
        isOpen={negDrawerOpen}
        onClose={() => setNegDrawerOpen(false)}
        quotation={quotation}
        onSuccess={() => fetchQuotationData()}
      />
    </DashboardLayout>
  );
}
