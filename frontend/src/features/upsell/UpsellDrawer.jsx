import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { getRecommendationsForCustomer, createQuotationFromRecommendation } from "../../api/upsell.api";
import { Sparkles, Plus, CheckCircle2, Box } from "lucide-react";

export default function UpsellDrawer({ isOpen, onClose, customerId, customerName }) {
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen && customerId) {
      fetchRecommendations();
    }
  }, [isOpen, customerId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getRecommendationsForCustomer(customerId);
      const recs = res.recommendations || [];
      setRecommendations(recs);
      if (recs.length > 0) {
        setSelectedProductIds([recs[0].recommended_product_id]);
      }
    } catch (err) {
      setErrorMsg("Failed to load product recommendations");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectProduct = (prodId) => {
    if (selectedProductIds.includes(prodId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== prodId));
    } else {
      setSelectedProductIds([...selectedProductIds, prodId]);
    }
  };

  const handleGenerateProposal = async (e) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      setErrorMsg("Please select at least one recommended product");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await createQuotationFromRecommendation(customerId, selectedProductIds);
      const qtnId = res.quotation?.id || res.id;
      onClose();
      navigate(`/dashboard/quotations/${qtnId}`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Upsell Recommendations for ${customerName || "Customer"}`}
    >
      <form onSubmit={handleGenerateProposal} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-xl bg-primary-50/70 border border-primary-200 text-xs text-primary-900 flex items-start gap-2.5">
          <Sparkles className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Smart Cross-Sell Intelligence</span>
            Selecting recommended add-on products generates a new draft commercial proposal fed directly into your quotation engine.
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted animate-pulse">
            Analyzing purchase history & matching product recommendations...
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-6 text-center text-xs text-text-muted">
            No specific upsell rules matched for this customer catalog history.
          </div>
        ) : (
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-text-primary uppercase">
              Select Recommended Add-ons
            </label>
            {recommendations.map((rec) => {
              const prodId = rec.recommended_product_id;
              const isSelected = selectedProductIds.includes(prodId);
              return (
                <div
                  key={rec.id || prodId}
                  onClick={() => toggleSelectProduct(prodId)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-primary-50/60 border-primary-400 ring-2 ring-primary-500/20"
                      : "bg-surface border-border hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neutral-100 text-text-secondary">
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-text-primary">
                        {rec.recommended_product_name}
                      </div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {rec.reason || "Recommended add-on product"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-extrabold text-emerald-700 text-sm">
                      ₹{Number(rec.recommended_base_price).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-primary-700 font-semibold mt-0.5">
                      {isSelected ? "✓ Selected" : "+ Click to Select"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || selectedProductIds.length === 0}
            className="bg-primary-700 hover:bg-primary-800 gap-2"
          >
            <Plus className="w-4 h-4" />
            {submitting ? "Creating..." : "Generate Draft Quotation Proposal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
