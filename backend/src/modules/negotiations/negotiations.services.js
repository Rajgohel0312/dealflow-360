import * as negRepo from "./negotiations.repository.js";
import { findQuotationById, updateQuotation, updateQuotationItem } from "../quotations/quotations.repository.js";
import { evaluateQuotationRisk } from "../quotations/quotations.services.js";
import AppError from "../../shared/errors/AppError.js";

export const createNegotiation = async (quotationId, user, data) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  const userId = typeof user === "object" ? user?.id : user;
  const userType = typeof user === "object" ? user?.user_type : null;

  // requested_by in negotiations table references `users(id)` (internal employee table).
  // If requested by customer user, fallback to quotation.sales_rep_id
  const requestedBy = userType === "CUSTOMER" ? (quotation.sales_rep_id || null) : (userId || quotation.sales_rep_id || null);

  const negotiation = await negRepo.createNegotiation({
    quotation_id: quotationId,
    customer_id: quotation.customer_id,
    requested_by: requestedBy,
    status: "OPEN",
    reason: data.reason || "Customer price/discount negotiation request",
  });

  if (data.items && data.items.length > 0) {
    for (const item of data.items) {
      await negRepo.createNegotiationItem({
        negotiation_id: negotiation.id,
        quotation_item_id: item.quotation_item_id,
        product_id: item.product_id,
        requested_quantity: item.requested_quantity ? Number(item.requested_quantity) : null,
        requested_discount_percent: item.requested_discount_percent !== undefined ? Number(item.requested_discount_percent) : null,
        requested_unit_price: item.requested_unit_price ? Number(item.requested_unit_price) : null,
        notes: item.notes || null,
      });
    }
  }

  return negRepo.findNegotiationById(negotiation.id);
};

export const submitNegotiation = async (id) => {
  const negotiation = await negRepo.findNegotiationById(id);
  if (!negotiation) {
    throw new AppError("Negotiation request not found", 404);
  }

  const quotation = await findQuotationById(negotiation.quotation_id);
  if (!quotation) {
    throw new AppError("Associated quotation not found", 404);
  }

  // Apply proposed negotiated items to quotation lines
  for (const negItem of negotiation.items) {
    if (negItem.quotation_item_id) {
      const updates = {};
      if (negItem.requested_quantity) updates.quantity = negItem.requested_quantity;
      if (negItem.requested_discount_percent !== null && negItem.requested_discount_percent !== undefined) {
        updates.discount_percent = negItem.requested_discount_percent;
      }
      if (Object.keys(updates).length > 0) {
        await updateQuotationItem(negItem.quotation_item_id, updates);
      }
    }
  }

  // Re-evaluate risk through Risk Engine
  const riskResult = await evaluateQuotationRisk(quotation.id);

  await negRepo.updateNegotiation(id, {
    status: riskResult.requires_approval ? "SUBMITTED" : "APPROVED",
  });

  return {
    negotiation: await negRepo.findNegotiationById(id),
    risk_evaluation: riskResult,
  };
};

export const approveNegotiation = async (id, comments = "Negotiated terms approved") => {
  const negotiation = await negRepo.findNegotiationById(id);
  if (!negotiation) {
    throw new AppError("Negotiation request not found", 404);
  }

  await negRepo.updateNegotiation(id, { status: "APPROVED" });
  await updateQuotation(negotiation.quotation_id, { status: "APPROVED" });

  return negRepo.findNegotiationById(id);
};

export const rejectNegotiation = async (id, comments = "Negotiation terms rejected") => {
  const negotiation = await negRepo.findNegotiationById(id);
  if (!negotiation) {
    throw new AppError("Negotiation request not found", 404);
  }

  await negRepo.updateNegotiation(id, { status: "REJECTED" });
  await updateQuotation(negotiation.quotation_id, { status: "REJECTED" });

  return negRepo.findNegotiationById(id);
};

export const getNegotiationsByQuotation = async (quotationId) => {
  return negRepo.findNegotiationsByQuotation(quotationId);
};

export const getNegotiationById = async (id) => {
  const negotiation = await negRepo.findNegotiationById(id);
  if (!negotiation) {
    throw new AppError("Negotiation request not found", 404);
  }
  return negotiation;
};
