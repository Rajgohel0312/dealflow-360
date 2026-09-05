import { findQuotationById, findQuotationItemsByQuotationId } from "../quotations/quotations.repository.js";
import { findOrderByQuotationId } from "../orders/orders.repository.js";
import { findFulfillmentsByOrderId } from "../fulfillment/fulfillment.repository.js";
import { findInvoiceByOrderId } from "../invoices/invoices.repository.js";
import { findNegotiationsByQuotation } from "../negotiations/negotiations.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const calculateDealHealth = async (quotationId) => {
  const quotation = await findQuotationById(quotationId);
  if (!quotation) {
    throw new AppError("Quotation not found", 404);
  }

  let score = 100;
  const factors = [];

  // 1. Commercial Discount Risk Factor
  const items = await findQuotationItemsByQuotationId(quotationId);
  let maxRequestedDisc = 0;
  if (items && items.length > 0) {
    maxRequestedDisc = Math.max(...items.map((i) => Number(i.discount_percent || 0)));
  }

  if (quotation.requires_approval || quotation.risk_level !== "NORMAL" || maxRequestedDisc > 15) {
    const penalty = 20;
    score -= penalty;
    factors.push({
      type: "DISCOUNT_RISK",
      impact: -penalty,
      message: `Requested discount (${maxRequestedDisc}%) exceeds commercial threshold (15%) and requires ${quotation.risk_level || 'MANAGER'} approval`,
    });
  }

  // 2. Approval Risk Factor
  if (quotation.status === "UNDER_REVIEW") {
    const penalty = 15;
    score -= penalty;
    factors.push({
      type: "APPROVAL_DELAY",
      impact: -penalty,
      message: "Quotation is pending executive manager/finance approval",
    });
  } else if (quotation.status === "REJECTED") {
    const penalty = 40;
    score -= penalty;
    factors.push({
      type: "APPROVAL_REJECTED",
      impact: -penalty,
      message: "Commercial proposal was rejected during approval review",
    });
  }

  // 3. Order & Fulfillment Risk Factor
  const order = await findOrderByQuotationId(quotationId);
  if (order) {
    const fulfillments = await findFulfillmentsByOrderId(order.id);
    if (fulfillments.length === 0 && order.status !== "FULFILLED") {
      const penalty = 15;
      score -= penalty;
      factors.push({
        type: "FULFILLMENT_PENDING",
        impact: -penalty,
        message: "Sales order is awaiting warehouse stock reservation & fulfillment initiation",
      });
    }

    // 4. Payment Risk Factor
    const invoice = await findInvoiceByOrderId(order.id);
    if (invoice) {
      if (invoice.status === "OVERDUE") {
        const penalty = 25;
        score -= penalty;
        factors.push({
          type: "PAYMENT_OVERDUE",
          impact: -penalty,
          message: `Invoice ${invoice.invoice_number} is past due date with ₹${invoice.amount_due} unpaid`,
        });
      } else if (invoice.status === "ISSUED" || invoice.status === "PARTIALLY_PAID") {
        const penalty = 10;
        score -= penalty;
        factors.push({
          type: "PAYMENT_UNPAID",
          impact: -penalty,
          message: `Invoice balance of ₹${invoice.amount_due} is pending collection`,
        });
      }
    }
  }

  // 5. Negotiation History Risk Factor
  const negotiations = await findNegotiationsByQuotation(quotationId);
  if (negotiations.length > 0) {
    const penalty = Math.min(negotiations.length * 10, 30);
    score -= penalty;
    factors.push({
      type: "REPEATED_NEGOTIATIONS",
      impact: -penalty,
      message: `Deal underwent ${negotiations.length} re-negotiation iteration(s)`,
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let status = "HEALTHY";
  if (finalScore < 50) {
    status = "CRITICAL";
  } else if (finalScore < 80) {
    status = "AT_RISK";
  }

  return {
    quotation_id: quotationId,
    quotation_number: quotation.quotation_number,
    score: finalScore,
    status,
    factors,
  };
};
