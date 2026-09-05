import { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { createNegotiation, submitNegotiation } from "../../api/negotiations.api";
import { DollarSign, MessageSquare, AlertTriangle } from "lucide-react";

export default function NegotiationDrawer({ isOpen, onClose, quotation, onSuccess }) {
  const [reason, setReason] = useState("");
  const [itemsData, setItemsData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const itemsList = quotation?.items || quotation?.quotation?.items || [];
    if (itemsList.length > 0) {
      setItemsData(
        itemsList.map((item) => ({
          quotation_item_id: item.id,
          product_id: item.product_id,
          product_name: item.product_name || "Product Item",
          current_quantity: item.quantity,
          current_discount: item.discount_percent,
          requested_quantity: item.quantity,
          requested_discount_percent: item.discount_percent,
        }))
      );
    } else {
      setItemsData([]);
    }
  }, [quotation]);

  const handleItemChange = (idx, field, val) => {
    const updated = [...itemsData];
    updated[idx][field] = val;
    setItemsData(updated);
  };

  const handleSubmitNegotiation = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Please specify a reason for this commercial negotiation request");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Create negotiation record
      const negRes = await createNegotiation(quotation.id, {
        reason,
        items: itemsData.map((i) => ({
          quotation_item_id: i.quotation_item_id,
          product_id: i.product_id,
          requested_quantity: parseFloat(i.requested_quantity),
          requested_discount_percent: parseFloat(i.requested_discount_percent),
        })),
      });

      const negId = negRes.negotiation?.id || negRes.id;

      // 2. Submit to Risk & Approval Engine
      await submitNegotiation(negId);

      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit negotiation request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Deal Re-Negotiation" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmitNegotiation} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
            {errorMsg}
          </div>
        )}

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Preserved Negotiation Audit Trail
          </div>
          <div>
            Submitting negotiated discounts re-triggers the Discount & Risk Engine without overwriting deal history. Higher discounts may route for Manager/Finance reapproval.
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-primary uppercase mb-1">
            Negotiation Reason / Customer Note *
          </label>
          <Input
            required
            placeholder="e.g. Customer requested 20% discount for bulk commitment of 10 units"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-text-primary uppercase">
            Negotiate Line Items ({itemsData.length})
          </label>
          {itemsData.length === 0 ? (
            <div className="p-4 rounded-xl bg-neutral-100 text-xs text-text-muted text-center border border-border">
              No line items attached to this proposal. Add products to the quotation first.
            </div>
          ) : (
            itemsData.map((item, idx) => (
              <div
                key={item.quotation_item_id || idx}
                className="p-4 rounded-xl bg-neutral-50 border border-border space-y-3 text-xs"
              >
                <div className="font-bold text-text-primary text-sm">
                  {item.product_name}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">
                      Requested Qty (Was: {item.current_quantity})
                    </label>
                    <Input
                      type="number"
                      min="1"
                      required
                      value={item.requested_quantity}
                      onChange={(e) =>
                        handleItemChange(idx, "requested_quantity", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-text-muted mb-1 font-semibold">
                      Requested Disc % (Was: {item.current_discount}%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      required
                      value={item.requested_discount_percent}
                      onChange={(e) =>
                        handleItemChange(idx, "requested_discount_percent", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white">
            {submitting ? "Evaluating Risk..." : "Submit to Risk & Approval Engine"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
